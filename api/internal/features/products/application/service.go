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

func (s *Service) Get(id uint) (domain.Product, error) {
	return s.repo.FindByID(id)
}

func (s *Service) Create(input CreateInput) (domain.Product, error) {
	if input.Name == "" || input.Price <= 0 {
		return domain.Product{}, apperrors.ErrInvalidInput
	}
	p := domain.Product{
		Name:        input.Name,
		Description: input.Description,
		Price:       input.Price,
		Stock:       input.Stock,
	}
	if err := s.repo.Create(&p); err != nil {
		return domain.Product{}, err
	}
	return p, nil
}

func (s *Service) Update(id uint, input UpdateInput) (domain.Product, error) {
	p, err := s.repo.FindByID(id)
	if err != nil {
		return domain.Product{}, err
	}
	if input.Name != nil {
		p.Name = *input.Name
	}
	if input.Description != nil {
		p.Description = *input.Description
	}
	if input.Price != nil {
		if *input.Price <= 0 {
			return domain.Product{}, apperrors.ErrInvalidInput
		}
		p.Price = *input.Price
	}
	if input.Stock != nil {
		p.Stock = *input.Stock
	}
	if err := s.repo.Update(&p); err != nil {
		return domain.Product{}, err
	}
	return p, nil
}

func (s *Service) Delete(id uint) error {
	return s.repo.Delete(id)
}

type CreateInput struct {
	Name        string
	Description string
	Price       float64
	Stock       int
}

type UpdateInput struct {
	Name        *string
	Description *string
	Price       *float64
	Stock       *int
}
