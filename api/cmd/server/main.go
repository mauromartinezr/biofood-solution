package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"

	whatsappapp "biofood-solution/api/internal/features/whatsapp/application"
	"biofood-solution/api/internal/infrastructure/config"
	"biofood-solution/api/internal/infrastructure/database"
	infrahttp "biofood-solution/api/internal/infrastructure/http"
	whatsappinfra "biofood-solution/api/internal/infrastructure/whatsapp"
)

//go:generate go run github.com/a-h/templ/cmd/templ@latest generate

func main() {
	// Load local env files when running without Docker; real environment variables win.
	_ = godotenv.Load(".env.local", ".env.dev", ".env")

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

	// Debug endpoints — trigger proactive jobs on demand (safe: only mapped phones receive msgs)
	dbg := server.Echo().Group("/debug")
	dbg.POST("/test-absence", func(c echo.Context) error {
		go worker.RunAbsenceAlert()
		return c.JSON(http.StatusOK, echo.Map{"triggered": "absence-alert"})
	})
	dbg.POST("/test-allergen", func(c echo.Context) error {
		lookback := 1 * time.Hour
		go worker.RunAllergenCheckSince(time.Now().UTC().Add(-lookback))
		return c.JSON(http.StatusOK, echo.Map{"triggered": "allergen-check", "lookback": "1h"})
	})
	dbg.POST("/simulate-allergen", func(c echo.Context) error {
		var body struct {
			UsuarioID   string `json:"usuario_id"`
			ProductName string `json:"producto"`
		}
		if err := c.Bind(&body); err != nil || body.UsuarioID == "" || body.ProductName == "" {
			return c.JSON(http.StatusBadRequest, echo.Map{"error": "se requieren usuario_id y producto"})
		}
		sent, matched := worker.SimulateAllergenCheck(body.UsuarioID, body.ProductName)
		return c.JSON(http.StatusOK, echo.Map{
			"usuario_id":      body.UsuarioID,
			"producto":        body.ProductName,
			"alergenos_match": matched,
			"mensaje_enviado": sent,
		})
	})

	addr := ":" + cfg.Port
	log.Printf("server listening on %s", addr)
	if err := server.Start(addr); err != nil {
		log.Fatal(err)
	}
}
