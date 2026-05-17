package application

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"biofood-solution/api/internal/features/whatsapp/domain"
)

type ProactiveWorker struct {
	repo     domain.BotRepository
	sender   domain.Sender
	interval time.Duration
}

func NewProactiveWorker(repo domain.BotRepository, sender domain.Sender, interval time.Duration) *ProactiveWorker {
	return &ProactiveWorker{repo: repo, sender: sender, interval: interval}
}

// Start lanza el ticker de Smart Offers. Invocar con `go worker.Start(ctx)` desde main.
func (w *ProactiveWorker) Start(ctx context.Context) {
	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()
	log.Printf("[proactive] worker iniciado (intervalo: %s)", w.interval)
	for {
		select {
		case <-ctx.Done():
			log.Println("[proactive] worker detenido")
			return
		case <-ticker.C:
			w.runSmartOffersAlert()
		}
	}
}

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
