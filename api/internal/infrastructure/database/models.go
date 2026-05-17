package database

import "time"

// students
type studentModel struct {
	ID       string  `gorm:"type:uuid;primaryKey"`
	Name     string  `gorm:"not null"`
	Grade    string
	SchoolID string  `gorm:"type:uuid;column:school_id;not null"`
	Balance  float64 `gorm:"type:numeric(12,2);column:balance;not null;default:0"`
}

func (studentModel) TableName() string { return "students" }

// products
type productModel struct {
	ID       string  `gorm:"type:uuid;primaryKey"`
	Name     string  `gorm:"not null"`
	Category string
	Price    float64 `gorm:"type:numeric(10,2);not null"`
}

func (productModel) TableName() string { return "products" }

// transactions
type transactionModel struct {
	ID        string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	StudentID string    `gorm:"type:uuid;column:student_id;not null"`
	ProductID string    `gorm:"type:uuid;column:product_id;not null"`
	Amount    float64   `gorm:"type:numeric(10,2);not null"`
	CreatedAt time.Time `gorm:"column:created_at;not null"`
}

func (transactionModel) TableName() string { return "transactions" }

// student_allergens
type studentAllergenModel struct {
	StudentID    string `gorm:"type:uuid;primaryKey;column:student_id"`
	AllergenName string `gorm:"primaryKey;column:allergen_name"`
}

func (studentAllergenModel) TableName() string { return "student_allergens" }

// product_allergens
type productAllergenModel struct {
	ProductID    string `gorm:"type:uuid;primaryKey;column:product_id"`
	AllergenName string `gorm:"primaryKey;column:allergen_name"`
}

func (productAllergenModel) TableName() string { return "product_allergens" }

// parent_phone_map
type parentPhoneMapModel struct {
	PhoneE164 string `gorm:"primaryKey;column:phone_e164"`
	StudentID string `gorm:"type:uuid;column:student_id;not null"`
}

func (parentPhoneMapModel) TableName() string { return "parent_phone_map" }

// cafeteria_admins
type cafeteriaAdminModel struct {
	PhoneE164 string `gorm:"primaryKey;column:phone_e164"`
	SchoolID  string `gorm:"type:uuid;primaryKey;column:school_id"`
}

func (cafeteriaAdminModel) TableName() string { return "cafeteria_admins" }

// inventory
type inventoryModel struct {
	ProductID    string `gorm:"type:uuid;primaryKey;column:product_id"`
	SchoolID     string `gorm:"type:uuid;primaryKey;column:school_id"`
	CurrentStock int    `gorm:"column:current_stock;not null;default:0"`
	MinimumStock int    `gorm:"column:minimum_stock;not null;default:0"`
	DaysToExpiry int    `gorm:"column:days_to_expiry;default:30"`
}

func (inventoryModel) TableName() string { return "inventory" }

// phone_biofood_map maps a WhatsApp phone to a Biofood usuario_identificacion (no FK constraint).
type phoneBiofoodMapModel struct {
	PhoneE164             string `gorm:"primaryKey;column:phone_e164"`
	UsuarioIdentificacion string `gorm:"column:usuario_identificacion;not null"`
}

func (phoneBiofoodMapModel) TableName() string { return "phone_biofood_map" }
