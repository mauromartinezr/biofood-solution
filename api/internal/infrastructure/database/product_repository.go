package database

import (
	"errors"

	"biofood-solution/api/internal/features/products/domain"
	apperrors "biofood-solution/api/internal/shared/errors"

	"gorm.io/gorm"
)

type productModel struct {
	gorm.Model
	Name        string  `gorm:"not null"`
	Description string
	Price       float64 `gorm:"not null"`
	Stock       int
}

type ProductRepository struct {
	db *gorm.DB
}

var _ domain.Repository = (*ProductRepository)(nil)

func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) FindAll() ([]domain.Product, error) {
	var models []productModel
	if err := r.db.Find(&models).Error; err != nil {
		return nil, err
	}
	out := make([]domain.Product, len(models))
	for i, m := range models {
		out[i] = toDomain(m)
	}
	return out, nil
}

func (r *ProductRepository) FindByID(id uint) (domain.Product, error) {
	var m productModel
	if err := r.db.First(&m, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.Product{}, apperrors.ErrNotFound
		}
		return domain.Product{}, err
	}
	return toDomain(m), nil
}

func (r *ProductRepository) Create(product *domain.Product) error {
	m := fromDomain(*product)
	if err := r.db.Create(&m).Error; err != nil {
		return err
	}
	*product = toDomain(m)
	return nil
}

func (r *ProductRepository) Update(product *domain.Product) error {
	m := fromDomain(*product)
	m.ID = product.ID
	if err := r.db.Save(&m).Error; err != nil {
		return err
	}
	*product = toDomain(m)
	return nil
}

func (r *ProductRepository) Delete(id uint) error {
	res := r.db.Delete(&productModel{}, id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func toDomain(m productModel) domain.Product {
	return domain.Product{
		ID:          m.ID,
		Name:        m.Name,
		Description: m.Description,
		Price:       m.Price,
		Stock:       m.Stock,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}

func fromDomain(p domain.Product) productModel {
	return productModel{
		Model: gorm.Model{
			ID:        p.ID,
			CreatedAt: p.CreatedAt,
			UpdatedAt: p.UpdatedAt,
		},
		Name:        p.Name,
		Description: p.Description,
		Price:       p.Price,
		Stock:       p.Stock,
	}
}
