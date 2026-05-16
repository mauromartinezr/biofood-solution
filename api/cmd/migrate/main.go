package main

import (
	"log"

	"biofood-solution/api/internal/infrastructure/config"
	"biofood-solution/api/internal/infrastructure/database"
)

func main() {
	cfg := config.Load()
	db, err := database.Connect(cfg.DSN)
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	if err := database.Migrate(db); err != nil {
		log.Fatalf("failed to migrate: %v", err)
	}
	log.Println("migrations OK")
}
