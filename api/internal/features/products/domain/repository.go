package domain

// Repository define el puerto de salida (driven) para persistencia de productos.
type Repository interface {
	FindAll() ([]Product, error)
	FindByID(id uint) (Product, error)
	Create(product *Product) error
	Update(product *Product) error
	Delete(id uint) error
}
