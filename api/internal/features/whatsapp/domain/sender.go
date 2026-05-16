package domain

type Sender interface {
	Send(msg OutgoingMessage) error
}
