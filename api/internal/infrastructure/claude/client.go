package claude

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

const (
	apiURL = "https://api.anthropic.com/v1/messages"
	model  = "claude-haiku-4-5-20251001"
)

type Client struct {
	apiKey     string
	httpClient *http.Client
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey:     apiKey,
		httpClient: &http.Client{},
	}
}

type messagesRequest struct {
	Model     string    `json:"model"`
	MaxTokens int       `json:"max_tokens"`
	System    string    `json:"system"`
	Messages  []message `json:"messages"`
}

type message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type messagesResponse struct {
	Content []struct {
		Text string `json:"text"`
	} `json:"content"`
	Error *struct {
		Type    string `json:"type"`
		Message string `json:"message"`
	} `json:"error"`
}

func (c *Client) Chat(ctx context.Context, systemPrompt, userMessage string) (string, error) {
	body, err := json.Marshal(messagesRequest{
		Model:     model,
		MaxTokens: 1024,
		System:    systemPrompt,
		Messages:  []message{{Role: "user", Content: userMessage}},
	})
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, apiURL, bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("x-api-key", c.apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")
	req.Header.Set("content-type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	rawBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("anthropic HTTP %d: %s", resp.StatusCode, string(rawBody))
	}

	var result messagesResponse
	if err := json.Unmarshal(rawBody, &result); err != nil {
		return "", fmt.Errorf("anthropic decode error: %w (body: %s)", err, string(rawBody))
	}

	if result.Error != nil {
		return "", fmt.Errorf("anthropic API [%s]: %s", result.Error.Type, result.Error.Message)
	}
	if len(result.Content) == 0 {
		return "", fmt.Errorf("empty response from Claude")
	}

	return result.Content[0].Text, nil
}
