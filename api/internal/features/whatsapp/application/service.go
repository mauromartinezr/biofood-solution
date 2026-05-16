package application

import (
	"fmt"
	"strings"

	"biofood-solution/api/internal/features/whatsapp/domain"
	apperrors "biofood-solution/api/internal/shared/errors"
)

type Service struct {
	sender domain.Sender
	repo   domain.BotRepository
}

func NewService(sender domain.Sender, repo domain.BotRepository) *Service {
	return &Service{sender: sender, repo: repo}
}

func (s *Service) Send(input SendInput) error {
	if input.To == "" || input.Text == "" {
		return apperrors.ErrInvalidInput
	}
	return s.sender.Send(domain.OutgoingMessage{To: input.To, Text: input.Text})
}

func (s *Service) HandleIncoming(msg domain.IncomingMessage) error {
	reply := s.processCommand(msg)
	return s.sender.Send(domain.OutgoingMessage{To: msg.From, Text: reply})
}

func (s *Service) processCommand(msg domain.IncomingMessage) string {
	cmd := strings.TrimSpace(strings.ToLower(msg.Text))

	switch cmd {
	case "saldo", "balance":
		student, err := s.repo.FindStudentByPhone(msg.From)
		if err != nil {
			return "No encontré tu número registrado. Contacta a la cafetería."
		}
		daysLeft := 0
		if student.AvgDailySpend > 0 {
			daysLeft = int(student.Balance / student.AvgDailySpend)
		}
		return fmt.Sprintf(
			"Hola %s 👋\n\n💰 *Saldo disponible:* $%.0f\n📊 *Gasto promedio diario:* $%.0f\n📅 *El saldo alcanza aproximadamente:* %d días",
			student.Name, student.Balance, student.AvgDailySpend, daysLeft,
		)

	case "historial", "compras":
		student, err := s.repo.FindStudentByPhone(msg.From)
		if err != nil {
			return "No encontré tu número registrado. Contacta a la cafetería."
		}
		purchases, err := s.repo.FindRecentPurchases(student.UsuarioID)
		if err != nil || len(purchases) == 0 {
			return "No hay compras registradas recientemente."
		}
		lines := make([]string, 0, len(purchases)+1)
		lines = append(lines, "*Últimas compras:*")
		for _, p := range purchases {
			lines = append(lines, fmt.Sprintf("• %s — %s ($%.0f)", p.Date, p.Product, p.Price))
		}
		return strings.Join(lines, "\n")

	default:
		return "Hola! Puedo ayudarte con:\n• *saldo* — Ver saldo y proyección\n• *historial* — Ver últimas compras"
	}
}

type SendInput struct {
	To   string
	Text string
}
