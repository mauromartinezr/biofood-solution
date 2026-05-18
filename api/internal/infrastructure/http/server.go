package http

import (
	"io"
	"io/fs"
	"log"
	"net/http"

	analyticshttp "biofood-solution/api/internal/features/analytics/adapter/http"
	analyticsapp "biofood-solution/api/internal/features/analytics/application"
	producthttp "biofood-solution/api/internal/features/products/adapter/http"
	"biofood-solution/api/internal/features/products/application"
	studentshttp "biofood-solution/api/internal/features/students/adapter/http"
	studentsapp "biofood-solution/api/internal/features/students/application"
	whatsapphttp "biofood-solution/api/internal/features/whatsapp/adapter/http"
	whatsappapp "biofood-solution/api/internal/features/whatsapp/application"
	claudeinfra "biofood-solution/api/internal/infrastructure/claude"
	"biofood-solution/api/internal/infrastructure/config"
	"biofood-solution/api/internal/infrastructure/database"
	whatsappinfra "biofood-solution/api/internal/infrastructure/whatsapp"
	wompiinfra "biofood-solution/api/internal/infrastructure/wompi"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gorm.io/gorm"
)

type Server struct {
	echo *echo.Echo
}

func NewServer(localDB, hackathonDB *gorm.DB, staticFS fs.FS, cfg config.Config) *Server {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.BodyLimit("64K"))
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
		AllowHeaders: []string{echo.HeaderContentType, "X-API-Key"},
	}))

	// Products
	repo := database.NewProductRepository(localDB)
	svc := application.NewService(repo)
	handler := producthttp.NewHandler(svc)

	// WhatsApp / Evolution API
	evolutionClient := whatsappinfra.NewEvolutionClient(cfg.EvolutionBaseURL, cfg.EvolutionInstance, cfg.EvolutionAPIKey)
	evolutionSender := whatsappinfra.NewEvolutionSender(evolutionClient)
	botRepo := database.NewWhatsAppBotRepository(localDB, hackathonDB)
	claudeClient := claudeinfra.NewClient(cfg.AnthropicAPIKey)
	wompiClient := wompiinfra.NewClient(cfg.WompiBaseURL, cfg.WompiPublicKey, cfg.WompiPrivateKey, cfg.WompiIntegrityKey)
	whatsappSvc := whatsappapp.NewService(evolutionSender, botRepo, claudeClient, wompiClient)
	whatsappHandler := whatsapphttp.NewHandler(whatsappSvc, cfg.WebhookSecret)

	// Analytics (dashboard)
	analyticsRepo := database.NewAnalyticsRepository(hackathonDB)
	analyticsSvc := analyticsapp.NewService(analyticsRepo)
	analyticsHandler := analyticshttp.NewHandler(analyticsSvc)

	// Students
	studentsRepo := database.NewStudentsRepository(hackathonDB)
	studentsSvc := studentsapp.NewService(studentsRepo)
	studentsHandler := studentshttp.NewHandler(studentsSvc)

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, echo.Map{"status": "healthy"})
	})

	// dashAuth protects dashboard/admin endpoints with an optional API key.
	// If DASHBOARD_API_KEY is not set, all requests pass through (dev mode).
	dashAuth := func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if cfg.DashboardAPIKey != "" && c.Request().Header.Get("X-API-Key") != cfg.DashboardAPIKey {
				return c.JSON(http.StatusUnauthorized, echo.Map{"error": "unauthorized"})
			}
			return next(c)
		}
	}

	api := e.Group("/api")

	// Products CRUD — protected
	api.GET("/products/top-sold", analyticsHandler.TopSoldProducts, dashAuth)
	api.GET("/products", handler.List, dashAuth)
	api.POST("/products", handler.Create, dashAuth)
	api.GET("/products/:id", handler.Get, dashAuth)
	api.PUT("/products/:id", handler.Update, dashAuth)
	api.DELETE("/products/:id", handler.Delete, dashAuth)

	// WhatsApp — rate-limited, webhook verified via token query param
	whatsappGroup := api.Group("/whatsapp")
	whatsappGroup.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(30)))
	whatsappGroup.POST("/send", whatsappHandler.Send)
	whatsappGroup.POST("/webhook", whatsappHandler.Webhook)

	api.POST("/wompi/webhook", func(c echo.Context) error {
		raw, err := io.ReadAll(c.Request().Body)
		if err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid body"})
		}
		event, err := wompiinfra.VerifyEventChecksum(raw, c.Request().Header.Get("X-Event-Checksum"), cfg.WompiEventsSecret)
		if err != nil {
			log.Printf("[wompi] invalid webhook: %v", err)
			return c.JSON(http.StatusUnauthorized, echo.Map{"status": "ignored"})
		}
		log.Printf("[wompi] webhook event=%s env=%s", event.Event, event.Environment)
		return c.JSON(http.StatusOK, echo.Map{"status": "ok"})
	})

	// Analytics — dashboard, protected
	api.GET("/schools/performance", analyticsHandler.SchoolPerformance, dashAuth)
	api.GET("/metrics/global", analyticsHandler.GlobalMetrics, dashAuth)
	api.GET("/recharge/patterns", analyticsHandler.RechargePatterns, dashAuth)
	api.GET("/recharge/trend", analyticsHandler.RechargeTrend, dashAuth)

	// Students — directory view, protected
	api.GET("/students/summary", analyticsHandler.StudentsSummary, dashAuth)
	api.GET("/schools/consumption", analyticsHandler.SchoolConsumption, dashAuth)
	api.GET("/students/directory", studentsHandler.Directory, dashAuth)

	// Students — profile view, protected
	api.GET("/students/:id/profile", studentsHandler.Profile, dashAuth)
	api.GET("/students/:id/transactions", studentsHandler.Transactions, dashAuth)
	api.GET("/students/:id/top-products", studentsHandler.TopProducts, dashAuth)
	api.GET("/students/:id/nutrition", studentsHandler.Nutrition, dashAuth)
	api.GET("/students/:id/analysis", studentsHandler.DailyAnalysis, dashAuth)

	e.GET("/*", echo.WrapHandler(staticHandler(staticFS)))

	return &Server{echo: e}
}

func (s *Server) Start(addr string) error {
	return s.echo.Start(addr)
}

func (s *Server) Echo() *echo.Echo { return s.echo }

func staticHandler(embedFS fs.FS) http.Handler {
	sub, err := fs.Sub(embedFS, "dist")
	if err != nil {
		return http.NotFoundHandler()
	}
	return http.FileServer(http.FS(sub))
}
