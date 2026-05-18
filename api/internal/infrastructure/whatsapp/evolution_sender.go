package whatsapp

import (
	"biofood-solution/api/internal/features/whatsapp/domain"
)

type EvolutionSender struct {
	client *EvolutionClient
}

var _ domain.Sender = (*EvolutionSender)(nil)

func NewEvolutionSender(client *EvolutionClient) *EvolutionSender {
	return &EvolutionSender{client: client}
}

func (s *EvolutionSender) Send(msg domain.OutgoingMessage) error {
	return s.client.SendText(msg.To, msg.Text)
}
