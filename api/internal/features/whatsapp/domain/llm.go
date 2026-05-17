package domain

import "context"

type LLMClient interface {
	Chat(ctx context.Context, systemPrompt, userMessage string) (string, error)
}
