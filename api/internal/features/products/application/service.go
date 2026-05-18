package application

import (
	apperrors "biofood-solution/api/internal/shared/errors"

	"biofood-solution/api/internal/features/products/domain"
)

type Service struct {
	repo domain.Repository
}

func NewService(repo domain.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) List() ([]domain.Product, error) {
	return s.repo.FindAll()
}

func (s *Service) Get(id string) (domain.Product, error) {
	return s.repo.FindByID(id)
}

func (s *Service) Create(input CreateInput) (domain.Product, error) {
	if input.Name == "" || input.Price <= 0 {
		return domain.Product{}, apperrors.ErrInvalidInput
	}
	p := domain.Product{
		Name:     input.Name,
		Category: input.Category,
		Price:    input.Price,
	}
	if err := s.repo.Create(&p); err != nil {
		return domain.Product{}, err
	}
	return p, nil
}

func (s *Service) Update(id string, input UpdateInput) (domain.Product, error) {
	p, err := s.repo.FindByID(id)
	if err != nil {
		return domain.Product{}, err
	}
	if input.Name != nil {
		p.Name = *input.Name
	}
	if input.Category != nil {
		p.Category = *input.Category
	}
	if input.Price != nil {
		if *input.Price <= 0 {
			return domain.Product{}, apperrors.ErrInvalidInput
		}
		p.Price = *input.Price
	}
	if err := s.repo.Update(&p); err != nil {
		return domain.Product{}, err
	}
	return p, nil
}

func (s *Service) Delete(id string) error {
	return s.repo.Delete(id)
}

type CreateInput struct {
	Name     string
	Category string
	Price    float64
}

type UpdateInput struct {
	Name     *string
	Category *string
	Price    *float64
}
