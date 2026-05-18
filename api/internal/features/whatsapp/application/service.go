package application

import (
	"context"
	"fmt"
	"log"
	"math"
	"regexp"
	"strings"
	"sync"
	"time"

	"biofood-solution/api/internal/features/whatsapp/domain"
	apperrors "biofood-solution/api/internal/shared/errors"
)

const contextCacheTTL = 60 * time.Second

type cachedContext struct {
	ctx       domain.StudentContext
	expiresAt time.Time
}

type Service struct {
	sender   domain.Sender
	repo     domain.BotRepository
	llm      domain.LLMClient
	payments domain.PaymentGateway
	ctxCache sync.Map // map[phoneE164 string]cachedContext
}

func NewService(sender domain.Sender, repo domain.BotRepository, llm domain.LLMClient, payments domain.PaymentGateway) *Service {
	return &Service{sender: sender, repo: repo, llm: llm, payments: payments}
}

func (s *Service) getStudentContext(phone string) (domain.StudentContext, bool, error) {
	if v, ok := s.ctxCache.Load(phone); ok {
		cached := v.(cachedContext)
		if time.Now().Before(cached.expiresAt) {
			return cached.ctx, true, nil
		}
	}
	ctx, err := s.repo.GetStudentContextByPhone(phone)
	if err != nil {
		return domain.StudentContext{}, false, err
	}
	s.ctxCache.Store(phone, cachedContext{ctx: ctx, expiresAt: time.Now().Add(contextCacheTTL)})
	return ctx, false, nil
}

func (s *Service) Send(input SendInput) error {
	if input.To == "" || input.Text == "" {
		return apperrors.ErrInvalidInput
	}
	return s.sender.Send(domain.OutgoingMessage{To: input.To, Text: input.Text})
}

func (s *Service) HandleIncoming(msg domain.IncomingMessage) error {
	if isRechargeIntent(msg.Text) {
		return s.handleRecharge(msg)
	}
	reply := s.processWithLLM(msg)
	return s.sender.Send(domain.OutgoingMessage{To: msg.From, Text: reply})
}

func (s *Service) handleRecharge(msg domain.IncomingMessage) error {
	if s.payments == nil {
		return s.sender.Send(domain.OutgoingMessage{
			To:   msg.From,
			Text: "Todavía no tengo configurado el procesador de pagos. Intenta más tarde o contacta a la cafetería.",
		})
	}

	ctx, _, err := s.getStudentContext(msg.From)
	if err != nil {
		return s.sender.Send(domain.OutgoingMessage{
			To:   msg.From,
			Text: "No encontré tu número registrado. Contacta a la cafetería para vincularlo. 📞",
		})
	}

	phoneNumber, err := colombianMobileFromE164(msg.From)
	if err != nil {
		return s.sender.Send(domain.OutgoingMessage{
			To:   msg.From,
			Text: "Para pagar con Nequi necesito que tu WhatsApp registrado sea un celular colombiano de 10 dígitos.",
		})
	}

	amountInCents := recommendedRechargeAmountInCents(ctx)
	amountCOP := float64(amountInCents) / 100
	reference := fmt.Sprintf("BIOFOOD-%s-%d", sanitizeReferencePart(ctx.UsuarioID), time.Now().Unix())

	if err := s.sender.Send(domain.OutgoingMessage{
		To: msg.From,
		Text: fmt.Sprintf(
			"Listo, voy a enviarte una solicitud de pago Nequi por *$%.0f COP* al número registrado.\n\nTe llegará una notificación push de Nequi para aceptar o rechazar la transacción.",
			amountCOP,
		),
	}); err != nil {
		return err
	}

	go s.createAndPollRecharge(msg.From, domain.RechargeRequest{
		PhoneE164:      msg.From,
		PhoneNumber:    phoneNumber,
		AmountInCents:  amountInCents,
		CustomerEmail:  defaultCustomerEmail(ctx),
		CustomerName:   ctx.Name,
		StudentName:    ctx.Name,
		StudentID:      ctx.UsuarioID,
		Reference:      reference,
		TimeoutSeconds: 60,
	})

	return nil
}

func (s *Service) createAndPollRecharge(to string, req domain.RechargeRequest) {
	start := time.Now()
	created, err := s.payments.CreateNequiRecharge(context.Background(), req)
	if err != nil {
		log.Printf("[wompi] create recharge failed phone=%s err=%v", to, err)
		_ = s.sender.Send(domain.OutgoingMessage{
			To:   to,
			Text: "No pude crear la recarga en Wompi en este momento. Intenta nuevamente en unos minutos.",
		})
		return
	}

	result, err := s.payments.PollTransactionStatus(context.Background(), created.TransactionID, 60)
	if err != nil {
		log.Printf("[wompi] poll failed tx=%s phone=%s err=%v", created.TransactionID, to, err)
		_ = s.sender.Send(domain.OutgoingMessage{
			To: to,
			Text: fmt.Sprintf(
				"Ya envié la solicitud a Nequi, pero no recibí confirmación en 60 segundos.\n\nReferencia: *%s*\nPuedes revisar la notificación en tu app de Nequi.",
				created.Reference,
			),
		})
		return
	}

	log.Printf("[wompi] recharge tx=%s phone=%s status=%s elapsed=%dms",
		result.TransactionID, to, result.Status, time.Since(start).Milliseconds())

	_ = s.sender.Send(domain.OutgoingMessage{To: to, Text: rechargeStatusMessage(result)})
}

func isRechargeIntent(text string) bool {
	normalized := strings.TrimSpace(strings.ToLower(text))
	normalized = strings.Trim(normalized, " .,!¡¿?")
	return normalized == "recargar" || normalized == "recarga"
}

func recommendedRechargeAmountInCents(ctx domain.StudentContext) int {
	amount := math.Max(10000, ctx.AvgDailySpend*5)
	if ctx.DaysRemaining < 3 && ctx.AvgDailySpend > 0 {
		amount = math.Max(amount, ctx.AvgDailySpend*10)
	}
	roundedCOP := int(math.Ceil(amount/1000) * 1000)
	return roundedCOP * 100
}

func colombianMobileFromE164(phoneE164 string) (string, error) {
	digits := regexp.MustCompile(`\D`).ReplaceAllString(phoneE164, "")
	if len(digits) == 12 && strings.HasPrefix(digits, "57") {
		digits = digits[2:]
	}
	if len(digits) != 10 || !strings.HasPrefix(digits, "3") {
		return "", apperrors.ErrInvalidInput
	}
	return digits, nil
}

func sanitizeReferencePart(value string) string {
	re := regexp.MustCompile(`[^A-Za-z0-9_-]`)
	out := re.ReplaceAllString(value, "")
	if out == "" {
		return "RECARGA"
	}
	if len(out) > 32 {
		return out[:32]
	}
	return out
}

func defaultCustomerEmail(ctx domain.StudentContext) string {
	userPart := sanitizeReferencePart(ctx.UsuarioID)
	return strings.ToLower(userPart) + "@biofood-connect.local"
}

func rechargeStatusMessage(result domain.RechargeResult) string {
	switch result.Status {
	case "APPROVED":
		return fmt.Sprintf(
			"✅ *Recarga aprobada*\n\nTu pago Nequi fue confirmado por Wompi.\nReferencia: *%s*",
			result.Reference,
		)
	case "DECLINED":
		return fmt.Sprintf(
			"❌ *Recarga rechazada*\n\nNequi rechazó la transacción o no fue aceptada.\nReferencia: *%s*",
			result.Reference,
		)
	case "ERROR":
		return fmt.Sprintf(
			"⚠️ *No se pudo completar la recarga*\n\nWompi reportó un error procesando la transacción.\nReferencia: *%s*",
			result.Reference,
		)
	default:
		return fmt.Sprintf(
			"⏳ La recarga sigue pendiente.\n\nReferencia: *%s*\nRevisa la notificación en tu app de Nequi.",
			result.Reference,
		)
	}
}

func (s *Service) processWithLLM(msg domain.IncomingMessage) string {
	start := time.Now()

	tDB := time.Now()
	ctx, fromCache, err := s.getStudentContext(msg.From)
	dbDur := time.Since(tDB)
	if err != nil {
		log.Printf("[whatsapp] sin contexto para from=%s: %v", msg.From, err)
		return "No encontré tu número registrado. Contacta a la cafetería para vincularlo. 📞"
	}

	history, _ := s.repo.GetRecentMessages(msg.From, 10)

	tLLM := time.Now()
	reply, err := s.llm.Chat(context.Background(), buildSystemPrompt(ctx), history, msg.Text)
	llmDur := time.Since(tLLM)

	total := time.Since(start)
	cacheLabel := "miss"
	if fromCache {
		cacheLabel = "hit"
	}

	if err != nil {
		log.Printf("[whatsapp] from=%s cache=%s db=%dms llm=ERROR total=%dms err=%v",
			msg.From, cacheLabel, dbDur.Milliseconds(), total.Milliseconds(), err)
		return fmt.Sprintf(
			"Hola %s 👋\n\n💰 *Saldo:* $%.0f\n📅 *Alcanza:* %d días",
			ctx.Name, ctx.Balance, ctx.DaysRemaining,
		)
	}

	log.Printf("[whatsapp] from=%s cache=%s db=%dms llm=%dms total=%dms q=%q",
		msg.From, cacheLabel, dbDur.Milliseconds(), llmDur.Milliseconds(), total.Milliseconds(), truncate(msg.Text, 40))

	_ = s.repo.AppendMessage(msg.From, "user", msg.Text)
	_ = s.repo.AppendMessage(msg.From, "assistant", reply)

	return reply
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "…"
}

func buildSystemPrompt(ctx domain.StudentContext) string {
	var sb strings.Builder

	sb.WriteString("Eres BioAlert, Asesor Nutricional y Financiero de la cafetería escolar BioFood.\n")
	sb.WriteString("Tu rol es doble: (1) proteger la salud del estudiante alertando sobre alérgenos y hábitos,\n")
	sb.WriteString("y (2) ayudar al padre a gestionar el saldo para evitar quedar sin fondos.\n\n")

	fmt.Fprintf(&sb, "═══ CUENTA DEL ESTUDIANTE ═══\n")
	fmt.Fprintf(&sb, "• Nombre: %s | Colegio: %s\n", ctx.Name, ctx.Colegio)
	fmt.Fprintf(&sb, "• Saldo actual: $%.0f COP\n", ctx.Balance)
	fmt.Fprintf(&sb, "• Gasto promedio diario: $%.0f COP\n", ctx.AvgDailySpend)
	if ctx.DaysRemaining > 0 {
		fmt.Fprintf(&sb, "• Saldo alcanza aprox.: %d días escolares\n", ctx.DaysRemaining)
	}

	if len(ctx.RechargeHistory) > 0 {
		sb.WriteString("\n═══ ÚLTIMAS RECARGAS ═══\n")
		for _, r := range ctx.RechargeHistory {
			fmt.Fprintf(&sb, "• %s → $%.0f COP\n", r.Date, r.Amount)
		}
	}

	if len(ctx.RecentTransactions) > 0 {
		sb.WriteString("\n═══ ÚLTIMAS 5 COMPRAS (análisis nutricional) ═══\n")
		for _, t := range ctx.RecentTransactions {
			fmt.Fprintf(&sb, "• %s: %s x%d ($%.0f)\n", t.Date, t.Product, t.Qty, t.Price*float64(t.Qty))
		}
	}

	if len(ctx.TopProducts) > 0 {
		sb.WriteString("\n═══ PRODUCTOS FAVORITOS ═══\n")
		for _, p := range ctx.TopProducts {
			fmt.Fprintf(&sb, "• %s (%d veces, $%.0f total)\n", p.Name, p.Times, p.Total)
		}
	}

	if len(ctx.Allergens) > 0 {
		fmt.Fprintf(&sb, "\n⚠️  ALERTA CRÍTICA — ALÉRGENOS DEL ESTUDIANTE: %s\n", strings.Join(ctx.Allergens, ", "))
		sb.WriteString("Si el estudiante consumió recientemente algún producto con estos alérgenos, ALERTA INMEDIATAMENTE al padre.\n")
		sb.WriteString("Compara las últimas compras con los alérgenos para detectar coincidencias.\n")
		if len(ctx.SafeAlternatives) > 0 {
			sb.WriteString("ALTERNATIVAS SEGURAS EN CAFETERÍA (sin sus alérgenos):\n")
			for _, a := range ctx.SafeAlternatives {
				fmt.Fprintf(&sb, "  ✅ %s (%s) — $%.0f COP\n", a.Name, a.Category, a.Price)
			}
		}
	}

	if len(ctx.SmartOffers) > 0 {
		sb.WriteString("\n═══ ALERTAS DE INVENTARIO EN CAFETERÍA (HOY) ═══\n")
		for _, o := range ctx.SmartOffers {
			if o.DaysToExpiry > 0 && o.DaysToExpiry <= 3 {
				fmt.Fprintf(&sb, "• %s — vence en %d día(s), oferta: *%s*\n", o.ProductName, o.DaysToExpiry, o.DiscountText)
			} else {
				fmt.Fprintf(&sb, "• %s — stock crítico (%d/%d), acción: *%s*\n", o.ProductName, o.CurrentStock, o.MinimumStock, o.DiscountText)
			}
		}
		sb.WriteString("Menciona estas ofertas si el padre pregunta qué hay disponible o si el saldo está bajo.\n")
	}

	sb.WriteString(`
═══ INSTRUCCIONES ═══
• Español colombiano, tono cálido y cercano
• Formato WhatsApp: *negrita* para datos clave, máx 2 emojis por mensaje
• Respuestas concisas: 5 líneas para consultas simples, hasta 8 para alertas de salud
• Saldo < 5 días: recomendar recarga con monto basado en el historial
• Alérgeno detectado en compras recientes: PRIORIZAR sobre cualquier otro tema
• Nunca inventar datos que no estén en el contexto proporcionado
• Solo responder sobre alimentación escolar, saldo y bienestar nutricional`)

	return sb.String()
}

type SendInput struct {
	To   string
	Text string
}
