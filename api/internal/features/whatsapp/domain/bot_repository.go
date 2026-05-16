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

type BotRepository interface {
	FindStudentByPhone(phoneE164 string) (StudentInfo, error)
	FindRecentPurchases(usuarioID string) ([]RecentPurchase, error)
}
