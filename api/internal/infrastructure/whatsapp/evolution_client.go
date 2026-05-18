package whatsapp

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

type EvolutionClient struct {
	baseURL    string
	instance   string
	apiKey     string
	httpClient *http.Client
}

func NewEvolutionClient(baseURL, instance, apiKey string) *EvolutionClient {
	return &EvolutionClient{
		baseURL:    strings.TrimRight(strings.TrimSpace(baseURL), "/"),
		instance:   strings.TrimSpace(instance),
		apiKey:     apiKey,
		httpClient: &http.Client{},
	}
}

type sendTextRequest struct {
	Number string `json:"number"`
	Text   string `json:"text"`
}

func (c *EvolutionClient) SendText(to, text string) error {
	payload := sendTextRequest{Number: normalizeWhatsAppNumber(to), Text: text}
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("%s/message/sendText/%s", c.baseURL, c.instance)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		raw, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("evolution api error %d: %s", resp.StatusCode, string(raw))
	}
	return nil
}

// normalizeWhatsAppNumber strips + and @suffix for Evolution API (expects country code digits only).
func normalizeWhatsAppNumber(to string) string {
	to = strings.TrimSpace(to)
	to = strings.TrimPrefix(to, "+")
	if local, _, ok := strings.Cut(to, "@"); ok {
		to = local
	}
	return to
}
