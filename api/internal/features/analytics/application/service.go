package application

import "biofood-solution/api/internal/features/analytics/domain"

type Service struct {
	repo domain.Repository
}

func NewService(repo domain.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetTopSoldProducts() ([]domain.TopProduct, error) {
	return s.repo.GetTopSoldProducts()
}

func (s *Service) GetSchoolPerformance() ([]domain.SchoolPerformance, error) {
	return s.repo.GetSchoolPerformance()
}

func (s *Service) GetGlobalMetrics() (*domain.GlobalMetrics, error) {
	return s.repo.GetGlobalMetrics()
}

func (s *Service) GetRechargePatterns() ([]domain.RechargePattern, error) {
	return s.repo.GetRechargePatterns()
}

func (s *Service) GetStudentsSummary() (*domain.StudentsSummary, error) {
	return s.repo.GetStudentsSummary()
}

func (s *Service) GetSchoolConsumption() ([]domain.SchoolConsumption, error) {
	return s.repo.GetSchoolConsumption()
}

func (s *Service) GetRechargeTrend() ([]domain.RechargeTrend, error) {
	return s.repo.GetRechargeTrend()
}
