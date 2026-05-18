package domain

import "time"

type StudentInfo struct {
	UsuarioID     string
	Name          string
	Colegio       string
	Balance       float64
	AvgDailySpend float64
}

type RecentPurchase struct {
	Date    string
	Product string
	Price   float64
	Qty     int
}

type RechargeRecord struct {
	Date   string
	Amount float64
}

type ProductSummary struct {
	Name  string
	Times int
	Total float64
}

type SafeAlternative struct {
	Name     string
	Category string
	Price    float64
}

type SmartOffer struct {
	ProductName  string
	CurrentStock int
	MinimumStock int
	DaysToExpiry int
	DiscountText string
}

type RecentTransaction struct {
	Date    string
	Product string
	Price   float64
	Qty     int
}

type StudentContext struct {
	StudentInfo
	RechargeHistory    []RechargeRecord
	TopProducts        []ProductSummary
	DaysRemaining      int
	Allergens          []string
	SafeAlternatives   []SafeAlternative
	RecentTransactions []RecentTransaction
	SmartOffers        []SmartOffer
}

// ParentMapping links a WhatsApp phone to a hackathon usuario_identificacion.
type ParentMapping struct {
	PhoneE164             string
	UsuarioIdentificacion string
}

// HackathonTransaction is a lightweight row used for allergen polling.
type HackathonTransaction struct {
	UsuarioID   string
	ProductName string
}

type BotRepository interface {
	FindStudentByPhone(phoneE164 string) (StudentInfo, error)
	FindRecentPurchases(usuarioID string) ([]RecentPurchase, error)
	GetStudentContext(usuarioID string) (StudentContext, error)
	GetStudentContextByPhone(phoneE164 string) (StudentContext, error)
	GetStudentAllergens(phoneE164 string) ([]string, error)
	GetSafeAlternatives(allergens []string) ([]SafeAlternative, error)
	GetLastTransactions(usuarioID string) ([]RecentTransaction, error)
	GetSmartOffers() ([]SmartOffer, error)
	GetCafeteriaAdminPhones() ([]string, error)
	// US-02 — absence alert
	GetAllParentMappings() ([]ParentMapping, error)
	HasTransactionsToday(usuarioID string) (bool, error)
	// US-03 — allergen polling
	GetNewTransactionsSince(since time.Time) ([]HackathonTransaction, error)
	GetParentPhoneByUsuarioID(usuarioID string) (string, error)
	GetProductAllergensByName(productName string) ([]string, error)
	// Conversation memory (TTL 1 hour, last 10 messages)
	GetRecentMessages(phoneE164 string, limit int) ([]ConversationMessage, error)
	AppendMessage(phoneE164, role, content string) error
}
