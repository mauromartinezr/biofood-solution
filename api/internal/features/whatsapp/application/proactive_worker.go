package application

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"biofood-solution/api/internal/features/whatsapp/domain"
)

// colombiaLoc is UTC-5 (Colombia Time, no DST).
var colombiaLoc = time.FixedZone("COT", -5*60*60)

type ProactiveWorker struct {
	repo          domain.BotRepository
	sender        domain.Sender
	stockInterval time.Duration
}

func NewProactiveWorker(repo domain.BotRepository, sender domain.Sender, interval time.Duration) *ProactiveWorker {
	return &ProactiveWorker{repo: repo, sender: sender, stockInterval: interval}
}

// Start launches three independent background jobs. Call with `go worker.Start(ctx)`.
func (w *ProactiveWorker) Start(ctx context.Context) {
	log.Printf("[proactive] worker iniciado (stock cada %s)", w.stockInterval)

	stockTicker := time.NewTicker(w.stockInterval)
	allergenTicker := time.NewTicker(60 * time.Second)
	absenceTicker := time.NewTicker(30 * time.Second)
	defer stockTicker.Stop()
	defer allergenTicker.Stop()
	defer absenceTicker.Stop()

	lastAllergenCheck := time.Now().UTC()
	lastAbsenceDay := -1

	for {
		select {
		case <-ctx.Done():
			log.Println("[proactive] worker detenido")
			return

		case <-stockTicker.C:
			w.runSmartOffersAlert()

		case t := <-allergenTicker.C:
			newCheck := t.UTC()
			w.runAllergenPolling(lastAllergenCheck)
			lastAllergenCheck = newCheck

		case <-absenceTicker.C:
			now := time.Now().In(colombiaLoc)
			// Fire once per day at 12:00–12:09 COT
			if now.Hour() == 12 && now.Minute() < 10 && lastAbsenceDay != now.YearDay() {
				lastAbsenceDay = now.YearDay()
				go w.runAbsenceAlert()
			}
		}
	}
}

// ── Stock alerts ─────────────────────────────────────────────────────────────

func (w *ProactiveWorker) runSmartOffersAlert() {
	offers, err := w.repo.GetSmartOffers()
	if err != nil || len(offers) == 0 {
		return
	}
	admins, err := w.repo.GetCafeteriaAdminPhones()
	if err != nil || len(admins) == 0 {
		log.Println("[proactive] sin admins registrados, saltando alerta")
		return
	}
	msg := buildSmartOffersMessage(offers)
	for _, phone := range admins {
		if err := w.sender.Send(domain.OutgoingMessage{To: phone, Text: msg}); err != nil {
			log.Printf("[proactive] error enviando a %s: %v", phone, err)
		}
	}
	log.Printf("[proactive] alertas de inventario enviadas a %d admin(s)", len(admins))
}

func buildSmartOffersMessage(offers []domain.SmartOffer) string {
	var sb strings.Builder
	sb.WriteString("🔔 *BioAlert — Alerta de Inventario*\n\n")
	for _, o := range offers {
		if o.DaysToExpiry > 0 && o.DaysToExpiry <= 3 {
			fmt.Fprintf(&sb, "⚠️ *%s*: vence en %d día(s) — *%s*\n", o.ProductName, o.DaysToExpiry, o.DiscountText)
		} else {
			fmt.Fprintf(&sb, "📦 *%s*: stock %d/%d mínimo — *%s*\n", o.ProductName, o.CurrentStock, o.MinimumStock, o.DiscountText)
		}
	}
	sb.WriteString("\n_Gestiona desde la app BioFood_ 🌿")
	return sb.String()
}

// ── US-02: Absence alert at 12:00 COT ────────────────────────────────────────

// RunAbsenceAlert is exported so debug endpoints can trigger it manually.
func (w *ProactiveWorker) RunAbsenceAlert() {
	w.runAbsenceAlert()
}

func (w *ProactiveWorker) runAbsenceAlert() {
	log.Println("[proactive] ejecutando alerta de inasistencia 12:00 COT")

	mappings, err := w.repo.GetAllParentMappings()
	if err != nil || len(mappings) == 0 {
		return
	}

	alerted := 0
	for _, m := range mappings {
		hasActivity, err := w.repo.HasTransactionsToday(m.UsuarioIdentificacion)
		if err != nil {
			continue
		}
		if !hasActivity {
			msg := "⚠️ *BioAlert — Posible Inasistencia*\n\nHola, hasta las 12:00 del mediodía tu hijo(a) no ha registrado compras en la cafetería hoy. Si esto es inesperado, verifica con la institución. 🏫"
			if err := w.sender.Send(domain.OutgoingMessage{To: m.PhoneE164, Text: msg}); err != nil {
				log.Printf("[proactive/ausencia] error enviando a %s: %v", m.PhoneE164, err)
			} else {
				alerted++
			}
		}
	}
	log.Printf("[proactive/ausencia] alertas enviadas: %d/%d padres", alerted, len(mappings))
}

// ── US-03: Real-time allergen detection ──────────────────────────────────────

// RunAllergenCheckSince is exported for manual debug triggers.
func (w *ProactiveWorker) RunAllergenCheckSince(since time.Time) {
	w.runAllergenPolling(since)
}

// SimulateAllergenCheck runs the detection pipeline for a single (usuarioID, productName)
// pair without querying hackathonDB — useful when the shared DB is read-only.
func (w *ProactiveWorker) SimulateAllergenCheck(usuarioID, productName string) (sent bool, matched []string) {
	productAllergens, err := w.repo.GetProductAllergensByName(productName)
	if err != nil || len(productAllergens) == 0 {
		log.Printf("[simulate/alergeno] producto '%s' sin alérgenos en localDB", productName)
		return false, nil
	}

	phone, err := w.repo.GetParentPhoneByUsuarioID(usuarioID)
	if err != nil {
		log.Printf("[simulate/alergeno] usuarioID '%s' no mapeado en phone_biofood_map", usuarioID)
		return false, nil
	}

	studentAllergens, _ := w.repo.GetStudentAllergens(phone)
	matched = intersect(productAllergens, studentAllergens)
	if len(matched) == 0 {
		log.Printf("[simulate/alergeno] sin coincidencia: producto=%v estudiante=%v", productAllergens, studentAllergens)
		return false, nil
	}

	msg := fmt.Sprintf(
		"🚨 *ALERTA ALÉRGENO — BioAlert*\n\nTu hijo(a) acaba de consumir *%s* en la cafetería.\n\n⚠️ Este producto contiene: *%s*\nQue coincide con sus alérgenos registrados: *%s*\n\nSi presenta síntomas, contacta al colegio inmediatamente. 📞",
		productName,
		strings.Join(matched, ", "),
		strings.Join(studentAllergens, ", "),
	)
	if err := w.sender.Send(domain.OutgoingMessage{To: phone, Text: msg}); err != nil {
		log.Printf("[simulate/alergeno] error enviando a %s: %v", phone, err)
		return false, matched
	}
	log.Printf("[simulate/alergeno] ALERTA enviada a %s — producto: %s, alérgenos: %v", phone, productName, matched)
	return true, matched
}

func (w *ProactiveWorker) runAllergenPolling(since time.Time) {
	txs, err := w.repo.GetNewTransactionsSince(since)
	if err != nil || len(txs) == 0 {
		return
	}

	for _, tx := range txs {
		productAllergens, err := w.repo.GetProductAllergensByName(tx.ProductName)
		if err != nil || len(productAllergens) == 0 {
			continue
		}

		phone, err := w.repo.GetParentPhoneByUsuarioID(tx.UsuarioID)
		if err != nil {
			continue
		}

		studentAllergens, err := w.repo.GetStudentAllergens(phone)
		if err != nil || len(studentAllergens) == 0 {
			continue
		}

		matched := intersect(productAllergens, studentAllergens)
		if len(matched) == 0 {
			continue
		}

		msg := fmt.Sprintf(
			"🚨 *ALERTA ALÉRGENO — BioAlert*\n\nTu hijo(a) acaba de consumir *%s* en la cafetería.\n\n⚠️ Este producto contiene: *%s*\nQue coincide con sus alérgenos registrados: *%s*\n\nSi presenta síntomas, contacta al colegio inmediatamente. 📞",
			tx.ProductName,
			strings.Join(matched, ", "),
			strings.Join(studentAllergens, ", "),
		)
		if err := w.sender.Send(domain.OutgoingMessage{To: phone, Text: msg}); err != nil {
			log.Printf("[proactive/alergeno] error enviando a %s: %v", phone, err)
		} else {
			log.Printf("[proactive/alergeno] ALERTA enviada a %s — producto: %s, alérgenos: %v", phone, tx.ProductName, matched)
		}
	}
}

func intersect(a, b []string) []string {
	set := make(map[string]struct{}, len(b))
	for _, v := range b {
		set[strings.ToLower(v)] = struct{}{}
	}
	var result []string
	for _, v := range a {
		if _, ok := set[strings.ToLower(v)]; ok {
			result = append(result, v)
		}
	}
	return result
}
