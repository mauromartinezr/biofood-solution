package http

import (
	"net/http"
	"strings"

	"biofood-solution/api/internal/features/whatsapp/application"
	"biofood-solution/api/internal/features/whatsapp/domain"
	apperrors "biofood-solution/api/internal/shared/errors"
	"biofood-solution/api/internal/shared/response"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	svc *application.Service
}

func NewHandler(svc *application.Service) *Handler {
	return &Handler{svc: svc}
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

// Webhook receives events pushed by Evolution API.
// Always returns 200 to prevent Evolution API from retrying.
func (h *Handler) Webhook(c echo.Context) error {
	var payload webhookPayload
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusOK, echo.Map{"status": "ignored"})
	}

	if payload.Event != "messages.upsert" || payload.Data.Key.FromMe {
		return c.JSON(http.StatusOK, echo.Map{"status": "ignored"})
	}

	text := payload.Data.Message.Conversation
	if text == "" {
		text = payload.Data.Message.ExtendedTextMessage.Text
	}
	if text == "" {
		return c.JSON(http.StatusOK, echo.Map{"status": "ignored"})
	}

	from := toE164(stripJID(payload.Data.Key.RemoteJid))
	if from == "+" {
		return response.Error(c, apperrors.ErrInvalidInput)
	}

	_ = h.svc.HandleIncoming(domain.IncomingMessage{From: from, Text: text})

	return c.JSON(http.StatusOK, echo.Map{"status": "ok"})
}

func stripJID(jid string) string {
	if local, _, found := strings.Cut(jid, "@"); found {
		return local
	}
	return jid
}

// toE164 ensures the phone number has the '+' prefix required by parent_phone_map.
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

// webhookPayload mirrors the Evolution API v2 webhook event structure.
type webhookPayload struct {
	Event    string `json:"event"`
	Instance string `json:"instance"`
	Data     struct {
		Key struct {
			RemoteJid string `json:"remoteJid"`
			FromMe    bool   `json:"fromMe"`
			ID        string `json:"id"`
		} `json:"key"`
		PushName string `json:"pushName"`
		Message  struct {
			Conversation        string `json:"conversation"`
			ExtendedTextMessage struct {
				Text string `json:"text"`
			} `json:"extendedTextMessage"`
		} `json:"message"`
		MessageType string `json:"messageType"`
	} `json:"data"`
}
