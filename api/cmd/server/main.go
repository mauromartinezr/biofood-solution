package main

import (
	"log"

	"github.com/joho/godotenv"

	"biofood-solution/api/internal/infrastructure/config"
	"biofood-solution/api/internal/infrastructure/database"
	infrahttp "biofood-solution/api/internal/infrastructure/http"
)

//go:generate go run github.com/a-h/templ/cmd/templ@latest generate

func main() {
	// Load .env.local if present (dev); silently ignored in prod where env vars are injected directly.
	_ = godotenv.Load(".env.local")

	cfg := config.Load()

	localDB, err := database.Connect(cfg.DSN)
	if err != nil {
		log.Fatalf("failed to connect local database: %v", err)
	}
	if err := database.Migrate(localDB); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	hackathonDB, err := database.Connect(cfg.HackathonDSN)
	if err != nil {
		log.Fatalf("failed to connect hackathon database: %v", err)
	}

	server := infrahttp.NewServer(localDB, hackathonDB, embedFS, cfg)
	addr := ":" + cfg.Port
	log.Printf("server listening on %s", addr)
	if err := server.Start(addr); err != nil {
		log.Fatal(err)
	}
}
