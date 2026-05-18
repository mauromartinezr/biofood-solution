package wompi

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
)

type EventPayload struct {
	Event       string          `json:"event"`
	Data        map[string]any  `json:"data"`
	Environment string          `json:"environment"`
	Signature   EventSignature  `json:"signature"`
	Timestamp   json.RawMessage `json:"timestamp"`
	SentAt      string          `json:"sent_at"`
}

type EventSignature struct {
	Properties []string `json:"properties"`
	Checksum   string   `json:"checksum"`
}

func ParseEventPayload(raw []byte) (EventPayload, error) {
	var payload EventPayload
	if err := json.Unmarshal(raw, &payload); err != nil {
		return EventPayload{}, err
	}
	return payload, nil
}

func VerifyEventChecksum(raw []byte, headerChecksum, eventsSecret string) (EventPayload, error) {
	payload, err := ParseEventPayload(raw)
	if err != nil {
		return EventPayload{}, err
	}
	if eventsSecret == "" {
		return payload, nil
	}

	expected, err := eventChecksum(payload, eventsSecret)
	if err != nil {
		return EventPayload{}, err
	}

	checksum := headerChecksum
	if checksum == "" {
		checksum = payload.Signature.Checksum
	}
	if checksum == "" || !strings.EqualFold(checksum, expected) {
		return EventPayload{}, fmt.Errorf("invalid wompi event checksum")
	}
	return payload, nil
}

func eventChecksum(payload EventPayload, eventsSecret string) (string, error) {
	var sb strings.Builder
	for _, property := range payload.Signature.Properties {
		value, err := eventPropertyValue(payload.Data, property)
		if err != nil {
			return "", err
		}
		sb.WriteString(value)
	}
	sb.WriteString(strings.Trim(string(payload.Timestamp), `"`))
	sb.WriteString(eventsSecret)

	sum := sha256.Sum256([]byte(sb.String()))
	return hex.EncodeToString(sum[:]), nil
}

func eventPropertyValue(data map[string]any, property string) (string, error) {
	var current any = data
	for _, part := range strings.Split(property, ".") {
		obj, ok := current.(map[string]any)
		if !ok {
			return "", fmt.Errorf("invalid wompi event property %q", property)
		}
		current, ok = obj[part]
		if !ok {
			return "", fmt.Errorf("missing wompi event property %q", property)
		}
	}
	return eventValueToString(current), nil
}

func eventValueToString(value any) string {
	switch v := value.(type) {
	case string:
		return v
	case float64:
		if v == float64(int64(v)) {
			return strconv.FormatInt(int64(v), 10)
		}
		return strconv.FormatFloat(v, 'f', -1, 64)
	case bool:
		return strconv.FormatBool(v)
	case nil:
		return ""
	default:
		return fmt.Sprint(v)
	}
}
