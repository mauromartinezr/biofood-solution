package domain

type OutgoingMessage struct {
	To   string
	Text string
}

type IncomingMessage struct {
	From string
	Text string
}
