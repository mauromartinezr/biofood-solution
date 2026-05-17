package main

import (
	"context"
	"log"
	"time"

	"github.com/joho/godotenv"

	whatsappapp "biofood-solution/api/internal/features/whatsapp/application"
	"biofood-solution/api/internal/infrastructure/config"
	"biofood-solution/api/internal/infrastructure/database"
	infrahttp "biofood-solution/api/internal/infrastructure/http"
	whatsappinfra "biofood-solution/api/internal/infrastructure/whatsapp"
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

	// Smart Offers: alerta proactiva de inventario a admins de cafetería
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	botRepo := database.NewWhatsAppBotRepository(localDB, hackathonDB)
	evolutionClient := whatsappinfra.NewEvolutionClient(cfg.EvolutionBaseURL, cfg.EvolutionInstance, cfg.EvolutionAPIKey)
	sender := whatsappinfra.NewEvolutionSender(evolutionClient)
	// Producción: 6*time.Hour (alineado con turnos de cafetería)
	// Demo/pitch: 3*time.Minute (suficiente para mostrar sin esperar)
	worker := whatsappapp.NewProactiveWorker(botRepo, sender, 3*time.Minute)
	go worker.Start(ctx)

	server := infrahttp.NewServer(localDB, hackathonDB, embedFS, cfg)
	addr := ":" + cfg.Port
	log.Printf("server listening on %s", addr)
	if err := server.Start(addr); err != nil {
		log.Fatal(err)
	}
}
