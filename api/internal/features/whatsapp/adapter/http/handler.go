package http

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"biofood-solution/api/internal/features/whatsapp/application"
	"biofood-solution/api/internal/features/whatsapp/domain"
	"biofood-solution/api/internal/shared/response"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	svc           *application.Service
	webhookSecret string
}

func NewHandler(svc *application.Service, webhookSecret string) *Handler {
	return &Handler{svc: svc, webhookSecret: webhookSecret}
}

func (h *Handler) Send(c echo.Context) error {
	var body sendRequest
	if err := c.Bind(&body); err != nil {
		return response.Error(c, err)
	}
	if err := h.svc.Send(application.SendInput{
		To:   body.To,
		Text: body.Text,
	}); err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, echo.Map{"status": "sent"})
}

const maxIncomingLen = 1000

// Webhook receives events pushed by Evolution API.
// Always returns 200 to prevent Evolution API from retrying.
func (h *Handler) Webhook(c echo.Context) error {
	if h.webhookSecret != "" && c.QueryParam("token") != h.webhookSecret {
		log.Printf("[whatsapp] webhook ignored: invalid token")
		return c.JSON(http.StatusOK, echo.Map{"status": "ignored", "reason": "invalid_token"})
	}

	var payload webhookPayload
	if err := c.Bind(&payload); err != nil {
		log.Printf("[whatsapp] webhook ignored: bind error: %v", err)
		return c.JSON(http.StatusOK, echo.Map{"status": "ignored", "reason": "invalid_payload"})
	}

	if !isMessagesUpsert(payload.Event) {
		log.Printf("[whatsapp] webhook ignored: event=%q", payload.Event)
		return c.JSON(http.StatusOK, echo.Map{"status": "ignored", "reason": "event"})
	}

	remoteJid := payload.Data.Key.RemoteJid
	if alt := payload.Data.Key.RemoteJidAlt; strings.Contains(remoteJid, "@lid") && alt != "" {
		remoteJid = alt
	}

	if payload.Data.Key.FromMe {
		return c.JSON(http.StatusOK, echo.Map{"status": "ignored", "reason": "from_me"})
	}

	if strings.Contains(remoteJid, "@g.us") {
		return c.JSON(http.StatusOK, echo.Map{"status": "ignored", "reason": "group"})
	}

	text := extractMessageText(payload.Data.Message)
	if text == "" || len(text) > maxIncomingLen {
		log.Printf("[whatsapp] webhook ignored: empty/unsupported message type=%q", payload.Data.MessageType)
		return c.JSON(http.StatusOK, echo.Map{"status": "ignored", "reason": "no_text"})
	}

	from := toE164(stripJID(remoteJid))
	if from == "+" || len(strings.TrimPrefix(from, "+")) < 8 {
		log.Printf("[whatsapp] webhook ignored: invalid jid=%q", remoteJid)
		return c.JSON(http.StatusOK, echo.Map{"status": "ignored", "reason": "invalid_phone"})
	}

	if err := h.svc.HandleIncoming(domain.IncomingMessage{From: from, Text: text}); err != nil {
		log.Printf("[whatsapp] HandleIncoming error from=%s: %v", from, err)
		return c.JSON(http.StatusOK, echo.Map{"status": "ok", "reply": "failed", "error": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{"status": "ok"})
}

func isMessagesUpsert(event string) bool {
	n := strings.ToLower(strings.ReplaceAll(event, "_", "."))
	return n == "messages.upsert"
}

func extractMessageText(msg messagePayload) string {
	if msg.Conversation != "" {
		return msg.Conversation
	}
	if msg.ExtendedTextMessage.Text != "" {
		return msg.ExtendedTextMessage.Text
	}
	if msg.EphemeralMessage.Message.Conversation != "" {
		return msg.EphemeralMessage.Message.Conversation
	}
	if msg.EphemeralMessage.Message.ExtendedTextMessage.Text != "" {
		return msg.EphemeralMessage.Message.ExtendedTextMessage.Text
	}
	if msg.ButtonsResponseMessage.SelectedDisplayText != "" {
		return msg.ButtonsResponseMessage.SelectedDisplayText
	}
	if msg.ListResponseMessage.Title != "" {
		return msg.ListResponseMessage.Title
	}
	// Fallback: some Evolution versions send slightly different shapes
	if raw, err := json.Marshal(msg); err == nil {
		return findTextInJSON(raw)
	}
	return ""
}

func findTextInJSON(raw []byte) string {
	var v any
	if json.Unmarshal(raw, &v) != nil {
		return ""
	}
	return findTextValue(v)
}

func findTextValue(v any) string {
	switch t := v.(type) {
	case map[string]any:
		if s, ok := t["conversation"].(string); ok && s != "" {
			return s
		}
		if etm, ok := t["extendedTextMessage"].(map[string]any); ok {
			if s, ok := etm["text"].(string); ok && s != "" {
				return s
			}
		}
		for _, child := range t {
			if s := findTextValue(child); s != "" {
				return s
			}
		}
	case []any:
		for _, item := range t {
			if s := findTextValue(item); s != "" {
				return s
			}
		}
	}
	return ""
}

func stripJID(jid string) string {
	if local, _, found := strings.Cut(jid, "@"); found {
		return local
	}
	return jid
}

func toE164(phone string) string {
	if strings.HasPrefix(phone, "+") {
		return phone
	}
	return "+" + phone
}

type sendRequest struct {
	To   string `json:"to"`
	Text string `json:"text"`
}

type messagePayload struct {
	Conversation        string `json:"conversation"`
	ExtendedTextMessage struct {
		Text string `json:"text"`
	} `json:"extendedTextMessage"`
	EphemeralMessage struct {
		Message struct {
			Conversation        string `json:"conversation"`
			ExtendedTextMessage struct {
				Text string `json:"text"`
			} `json:"extendedTextMessage"`
		} `json:"message"`
	} `json:"ephemeralMessage"`
	ButtonsResponseMessage struct {
		SelectedDisplayText string `json:"selectedDisplayText"`
	} `json:"buttonsResponseMessage"`
	ListResponseMessage struct {
		Title string `json:"title"`
	} `json:"listResponseMessage"`
}

// webhookPayload mirrors Evolution API v2 webhook POST body.
type webhookPayload struct {
	Event    string `json:"event"`
	Instance string `json:"instance"`
	Data     struct {
		Key struct {
			RemoteJid    string `json:"remoteJid"`
			RemoteJidAlt string `json:"remoteJidAlt"`
			FromMe       bool   `json:"fromMe"`
			ID           string `json:"id"`
		} `json:"key"`
		PushName    string         `json:"pushName"`
		Message     messagePayload `json:"message"`
		MessageType string         `json:"messageType"`
	} `json:"data"`
}
