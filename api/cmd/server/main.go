package main

import (
	"log"

	"biofood-solution/api/internal/infrastructure/config"
	"biofood-solution/api/internal/infrastructure/database"
	infrahttp "biofood-solution/api/internal/infrastructure/http"
)

//go:generate go run github.com/a-h/templ/cmd/templ@latest generate

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg.DSN)
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	if err := database.Migrate(db); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	server := infrahttp.NewServer(db, embedFS, cfg)
	addr := ":" + cfg.Port
	log.Printf("server listening on %s", addr)
	if err := server.Start(addr); err != nil {
		log.Fatal(err)
	}
}
