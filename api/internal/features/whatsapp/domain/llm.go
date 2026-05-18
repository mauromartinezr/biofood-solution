package domain

import "context"

type ConversationMessage struct {
	Role    string // "user" or "assistant"
	Content string
}

type LLMClient interface {
	Chat(ctx context.Context, systemPrompt string, history []ConversationMessage, userMessage string) (string, error)
}
