package application

import (
	"context"
	"fmt"
	"log"
	"strings"

	"biofood-solution/api/internal/features/whatsapp/domain"
	apperrors "biofood-solution/api/internal/shared/errors"
)

type Service struct {
	sender domain.Sender
	repo   domain.BotRepository
	llm    domain.LLMClient
}

func NewService(sender domain.Sender, repo domain.BotRepository, llm domain.LLMClient) *Service {
	return &Service{sender: sender, repo: repo, llm: llm}
}

func (s *Service) Send(input SendInput) error {
	if input.To == "" || input.Text == "" {
		return apperrors.ErrInvalidInput
	}
	return s.sender.Send(domain.OutgoingMessage{To: input.To, Text: input.Text})
}

func (s *Service) HandleIncoming(msg domain.IncomingMessage) error {
	reply := s.processWithLLM(msg)
	return s.sender.Send(domain.OutgoingMessage{To: msg.From, Text: reply})
}

func (s *Service) processWithLLM(msg domain.IncomingMessage) string {
	ctx, err := s.repo.GetStudentContextByPhone(msg.From)
	if err != nil {
		return "No encontré tu número registrado. Contacta a la cafetería para vincularlo. 📞"
	}

	reply, err := s.llm.Chat(context.Background(), buildSystemPrompt(ctx), msg.Text)
	if err != nil {
		log.Printf("[whatsapp] LLM error: %v", err)
		// Fallback: saldo básico sin LLM
		return fmt.Sprintf(
			"Hola %s 👋\n\n💰 *Saldo:* $%.0f\n📅 *Alcanza:* %d días",
			ctx.Name, ctx.Balance, ctx.DaysRemaining,
		)
	}

	return reply
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
