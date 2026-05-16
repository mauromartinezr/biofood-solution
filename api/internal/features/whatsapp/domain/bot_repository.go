package domain

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

type StudentContext struct {
	StudentInfo
	RechargeHistory []RechargeRecord
	TopProducts     []ProductSummary
	DaysRemaining   int
}

type BotRepository interface {
	FindStudentByPhone(phoneE164 string) (StudentInfo, error)
	FindRecentPurchases(usuarioID string) ([]RecentPurchase, error)
	GetStudentContext(usuarioID string) (StudentContext, error)
	GetStudentContextByPhone(phoneE164 string) (StudentContext, error)
}
