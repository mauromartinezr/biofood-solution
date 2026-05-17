package domain

type Repository interface {
	GetDirectory(page, limit int) ([]DirectoryEntry, int64, error)
	GetProfile(id string) (*StudentProfile, error)
	GetTransactions(id string) ([]Transaction, error)
	GetTopProducts(id string) ([]TopStudentProduct, error)
	GetNutrition(id string) ([]NutritionItem, error)
	GetDailyAnalysis(id string) ([]DailyAnalysis, error)
}
