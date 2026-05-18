package wompi

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"biofood-solution/api/internal/features/whatsapp/domain"
)

const (
	currencyCOP    = "COP"
	paymentNequi   = "NEQUI"
	pollInterval   = 3 * time.Second
	defaultTimeout = 60
)

type Client struct {
	baseURL      string
	publicKey    string
	privateKey   string
	integrityKey string
	httpClient   *http.Client
}

func NewClient(baseURL, publicKey, privateKey, integrityKey string) *Client {
	return &Client{
		baseURL:      strings.TrimRight(baseURL, "/"),
		publicKey:    publicKey,
		privateKey:   privateKey,
		integrityKey: integrityKey,
		httpClient:   &http.Client{Timeout: 15 * time.Second},
	}
}

type merchantResponse struct {
	Data struct {
		PresignedAcceptance struct {
			AcceptanceToken string `json:"acceptance_token"`
		} `json:"presigned_acceptance"`
		PresignedPersonalDataAuth struct {
			AcceptanceToken string `json:"acceptance_token"`
		} `json:"presigned_personal_data_auth"`
	} `json:"data"`
}

type createTransactionRequest struct {
	AcceptanceToken    string        `json:"acceptance_token"`
	AcceptPersonalAuth string        `json:"accept_personal_auth"`
	AmountInCents      int           `json:"amount_in_cents"`
	Currency           string        `json:"currency"`
	CustomerEmail      string        `json:"customer_email"`
	CustomerData       customerData  `json:"customer_data"`
	PaymentMethod      paymentMethod `json:"payment_method"`
	PaymentMethodType  string        `json:"payment_method_type"`
	Reference          string        `json:"reference"`
	Signature          string        `json:"signature"`
}

type customerData struct {
	FullName    string `json:"full_name,omitempty"`
	PhoneNumber string `json:"phone_number,omitempty"`
}

type paymentMethod struct {
	Type        string `json:"type"`
	PhoneNumber string `json:"phone_number"`
}

type transactionResponse struct {
	Data  transactionData `json:"data"`
	Error *struct {
		Type     string          `json:"type"`
		Messages json.RawMessage `json:"messages"`
		Reason   string          `json:"reason"`
	} `json:"error"`
}

type transactionData struct {
	ID                string `json:"id"`
	Reference         string `json:"reference"`
	Status            string `json:"status"`
	StatusMessage     string `json:"status_message"`
	AmountInCents     int    `json:"amount_in_cents"`
	PaymentMethodType string `json:"payment_method_type"`
}

func (c *Client) CreateNequiRecharge(ctx context.Context, input domain.RechargeRequest) (domain.RechargeResult, error) {
	if err := c.validateConfig(); err != nil {
		return domain.RechargeResult{}, err
	}

	tokens, err := c.acceptanceTokens(ctx)
	if err != nil {
		return domain.RechargeResult{}, err
	}

	payload := createTransactionRequest{
		AcceptanceToken:    tokens.PresignedAcceptance.AcceptanceToken,
		AcceptPersonalAuth: tokens.PresignedPersonalDataAuth.AcceptanceToken,
		AmountInCents:      input.AmountInCents,
		Currency:           currencyCOP,
		CustomerEmail:      input.CustomerEmail,
		CustomerData: customerData{
			FullName:    input.CustomerName,
			PhoneNumber: "57" + input.PhoneNumber,
		},
		PaymentMethod: paymentMethod{
			Type:        paymentNequi,
			PhoneNumber: input.PhoneNumber,
		},
		PaymentMethodType: paymentNequi,
		Reference:         input.Reference,
		Signature:         c.signature(input.Reference, input.AmountInCents),
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return domain.RechargeResult{}, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/v1/transactions", bytes.NewReader(body))
	if err != nil {
		return domain.RechargeResult{}, err
	}
	req.Header.Set("Authorization", "Bearer "+c.privateKey)
	req.Header.Set("Content-Type", "application/json")

	var result transactionResponse
	if err := c.do(req, http.StatusCreated, &result); err != nil {
		return domain.RechargeResult{}, err
	}
	return toRechargeResult(result.Data), nil
}

func (c *Client) PollTransactionStatus(ctx context.Context, transactionID string, timeoutSeconds int) (domain.RechargeResult, error) {
	if err := c.validateConfig(); err != nil {
		return domain.RechargeResult{}, err
	}
	if timeoutSeconds <= 0 {
		timeoutSeconds = defaultTimeout
	}

	ctx, cancel := context.WithTimeout(ctx, time.Duration(timeoutSeconds)*time.Second)
	defer cancel()

	ticker := time.NewTicker(pollInterval)
	defer ticker.Stop()

	for {
		result, err := c.GetTransaction(ctx, transactionID)
		if err != nil {
			return domain.RechargeResult{}, err
		}
		if isFinalStatus(result.Status) {
			return result, nil
		}

		select {
		case <-ctx.Done():
			return result, fmt.Errorf("wompi transaction %s polling timeout: %w", transactionID, ctx.Err())
		case <-ticker.C:
		}
	}
}

func (c *Client) GetTransaction(ctx context.Context, transactionID string) (domain.RechargeResult, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+"/v1/transactions/"+transactionID, nil)
	if err != nil {
		return domain.RechargeResult{}, err
	}
	req.Header.Set("Authorization", "Bearer "+c.publicKey)

	var result transactionResponse
	if err := c.do(req, http.StatusOK, &result); err != nil {
		return domain.RechargeResult{}, err
	}
	return toRechargeResult(result.Data), nil
}

func (c *Client) acceptanceTokens(ctx context.Context) (merchantResponseData, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+"/v1/merchants/"+c.publicKey, nil)
	if err != nil {
		return merchantResponseData{}, err
	}

	var result merchantResponse
	if err := c.do(req, http.StatusOK, &result); err != nil {
		return merchantResponseData{}, err
	}
	if result.Data.PresignedAcceptance.AcceptanceToken == "" ||
		result.Data.PresignedPersonalDataAuth.AcceptanceToken == "" {
		return merchantResponseData{}, fmt.Errorf("wompi merchant response missing acceptance tokens")
	}
	return merchantResponseData(result.Data), nil
}

type merchantResponseData struct {
	PresignedAcceptance struct {
		AcceptanceToken string `json:"acceptance_token"`
	} `json:"presigned_acceptance"`
	PresignedPersonalDataAuth struct {
		AcceptanceToken string `json:"acceptance_token"`
	} `json:"presigned_personal_data_auth"`
}

func (c *Client) do(req *http.Request, expectedStatus int, out any) error {
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if resp.StatusCode != expectedStatus {
		return fmt.Errorf("wompi HTTP %d: %s", resp.StatusCode, string(raw))
	}
	if err := json.Unmarshal(raw, out); err != nil {
		return fmt.Errorf("wompi decode error: %w (body: %s)", err, string(raw))
	}
	return nil
}

func (c *Client) signature(reference string, amountInCents int) string {
	input := fmt.Sprintf("%s%d%s%s", reference, amountInCents, currencyCOP, c.integrityKey)
	sum := sha256.Sum256([]byte(input))
	return hex.EncodeToString(sum[:])
}

func (c *Client) validateConfig() error {
	if c.baseURL == "" || c.publicKey == "" || c.privateKey == "" || c.integrityKey == "" {
		return fmt.Errorf("wompi client is not configured")
	}
	return nil
}

func isFinalStatus(status string) bool {
	switch status {
	case "APPROVED", "DECLINED", "VOIDED", "ERROR":
		return true
	default:
		return false
	}
}

func toRechargeResult(data transactionData) domain.RechargeResult {
	return domain.RechargeResult{
		TransactionID: data.ID,
		Reference:     data.Reference,
		Status:        data.Status,
		StatusMessage: data.StatusMessage,
		AmountInCents: data.AmountInCents,
	}
}
