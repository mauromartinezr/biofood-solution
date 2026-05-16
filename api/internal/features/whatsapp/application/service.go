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

	sb.WriteString("Eres BioAlert, el asistente de la cafetería escolar BioFood. Ayudas a los PADRES a gestionar la cuenta de alimentación de sus hijos.\n\n")
	fmt.Fprintf(&sb, "DATOS DEL ESTUDIANTE:\n")
	fmt.Fprintf(&sb, "- Nombre: %s\n", ctx.Name)
	fmt.Fprintf(&sb, "- Colegio: %s\n", ctx.Colegio)
	fmt.Fprintf(&sb, "- Saldo actual: $%.0f COP\n", ctx.Balance)
	fmt.Fprintf(&sb, "- Gasto promedio diario: $%.0f COP\n", ctx.AvgDailySpend)
	if ctx.DaysRemaining > 0 {
		fmt.Fprintf(&sb, "- Saldo alcanza aproximadamente: %d días escolares\n", ctx.DaysRemaining)
	}

	if len(ctx.RechargeHistory) > 0 {
		sb.WriteString("\nÚLTIMAS RECARGAS:\n")
		for _, r := range ctx.RechargeHistory {
			fmt.Fprintf(&sb, "- %s: $%.0f COP\n", r.Date, r.Amount)
		}
	}

	if len(ctx.TopProducts) > 0 {
		sb.WriteString("\nPRODUCTOS FAVORITOS DEL ESTUDIANTE:\n")
		for _, p := range ctx.TopProducts {
			fmt.Fprintf(&sb, "- %s (%d veces, total $%.0f)\n", p.Name, p.Times, p.Total)
		}
	}

	sb.WriteString(`
OBJETIVO: Ayudar al padre a mantener el saldo activo y sugerirle recargar con montos adecuados.
Cuando el saldo sea menor a 5 días, recomienda proactivamente una recarga con monto similar al historial.
Menciona los productos favoritos del hijo para personalizar el mensaje.

INSTRUCCIONES:
- Responde SIEMPRE en español colombiano, tono cálido y cercano
- Usa formato WhatsApp: *negrita* para datos importantes, emojis con moderación
- Respuestas concisas (máximo 5 líneas)
- Si el padre pregunta el saldo, dáselo claro con la proyección de días
- Si el saldo es bajo, añade sugerencia de recarga con monto concreto
- No inventes datos que no tengas
- Solo responde sobre alimentación y saldo escolar del estudiante`)

	return sb.String()
}

type SendInput struct {
	To   string
	Text string
}
