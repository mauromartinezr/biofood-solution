package database

import (
	"strings"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func Connect(dsn string) (*gorm.DB, error) {
	if isPostgresDSN(dsn) {
		return gorm.Open(postgres.Open(dsn), &gorm.Config{})
	}
	return gorm.Open(sqlite.Open(dsn), &gorm.Config{})
}

func isPostgresDSN(dsn string) bool {
	lower := strings.ToLower(dsn)
	return strings.HasPrefix(lower, "postgres://") ||
		strings.HasPrefix(lower, "postgresql://") ||
		strings.Contains(lower, "host=")
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&studentModel{},
		&productModel{},
		&transactionModel{},
		&studentAllergenModel{},
		&productAllergenModel{},
		&parentPhoneMapModel{},
		&cafeteriaAdminModel{},
		&inventoryModel{},
	)
}
