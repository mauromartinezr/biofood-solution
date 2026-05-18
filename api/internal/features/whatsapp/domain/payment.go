package domain

import "context"

type RechargeRequest struct {
	PhoneE164      string
	PhoneNumber    string
	AmountInCents  int
	CustomerEmail  string
	CustomerName   string
	StudentName    string
	StudentID      string
	Reference      string
	TimeoutSeconds int
}

type RechargeResult struct {
	TransactionID string
	Reference     string
	Status        string
	StatusMessage string
	AmountInCents int
}

type PaymentGateway interface {
	CreateNequiRecharge(ctx context.Context, req RechargeRequest) (RechargeResult, error)
	PollTransactionStatus(ctx context.Context, transactionID string, timeoutSeconds int) (RechargeResult, error)
}
