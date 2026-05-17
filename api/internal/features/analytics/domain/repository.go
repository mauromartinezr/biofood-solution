package domain

type Repository interface {
	GetTopSoldProducts() ([]TopProduct, error)
	GetSchoolPerformance() ([]SchoolPerformance, error)
	GetGlobalMetrics() (*GlobalMetrics, error)
	GetRechargePatterns() ([]RechargePattern, error)
	GetStudentsSummary() (*StudentsSummary, error)
	GetSchoolConsumption() ([]SchoolConsumption, error)
	GetRechargeTrend() ([]RechargeTrend, error)
}
