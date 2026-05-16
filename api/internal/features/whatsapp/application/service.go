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
		return fmt.Sprintf("Hola %s, tu saldo disponible es: $%.2f", student.Name, student.Balance)

	case "menu":
		items, err := s.repo.FindMenuItems()
		if err != nil || len(items) == 0 {
			return "No hay productos disponibles en este momento."
		}
		lines := make([]string, 0, len(items)+1)
		lines = append(lines, "*Menú disponible:*")
		for _, item := range items {
			lines = append(lines, fmt.Sprintf("• %s - $%.2f", item.Name, item.Price))
		}
		return strings.Join(lines, "\n")

	default:
		return "Hola! Puedo ayudarte con:\n• *saldo* - Ver tu saldo disponible\n• *menu* - Ver productos disponibles"
	}
}

type SendInput struct {
	To   string
	Text string
}
