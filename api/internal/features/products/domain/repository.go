package domain

type Repository interface {
	FindAll() ([]Product, error)
	FindByID(id string) (Product, error)
	Create(product *Product) error
	Update(product *Product) error
	Delete(id string) error
}
