package application

import "biofood-solution/api/internal/features/students/domain"

type Service struct {
	repo domain.Repository
}

func NewService(repo domain.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetDirectory(page, limit int) ([]domain.DirectoryEntry, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	return s.repo.GetDirectory(page, limit)
}

func (s *Service) GetProfile(id string) (*domain.StudentProfile, error) {
	return s.repo.GetProfile(id)
}

func (s *Service) GetTransactions(id string) ([]domain.Transaction, error) {
	return s.repo.GetTransactions(id)
}

func (s *Service) GetTopProducts(id string) ([]domain.TopStudentProduct, error) {
	return s.repo.GetTopProducts(id)
}

func (s *Service) GetNutrition(id string) ([]domain.NutritionItem, error) {
	return s.repo.GetNutrition(id)
}

func (s *Service) GetDailyAnalysis(id string) ([]domain.DailyAnalysis, error) {
	return s.repo.GetDailyAnalysis(id)
}
