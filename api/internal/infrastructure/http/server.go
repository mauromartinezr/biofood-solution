package http

import (
	"io/fs"
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
	e.Use(middleware.CORS())

	// Products
	repo := database.NewProductRepository(localDB)
	svc := application.NewService(repo)
	handler := producthttp.NewHandler(svc)

	// WhatsApp / Evolution API
	evolutionClient := whatsappinfra.NewEvolutionClient(cfg.EvolutionBaseURL, cfg.EvolutionInstance, cfg.EvolutionAPIKey)
	evolutionSender := whatsappinfra.NewEvolutionSender(evolutionClient)
	botRepo := database.NewWhatsAppBotRepository(localDB, hackathonDB)
	claudeClient := claudeinfra.NewClient(cfg.AnthropicAPIKey)
	whatsappSvc := whatsappapp.NewService(evolutionSender, botRepo, claudeClient)
	whatsappHandler := whatsapphttp.NewHandler(whatsappSvc)

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

	api := e.Group("/api")

	// Products CRUD
	api.GET("/products/top-sold", analyticsHandler.TopSoldProducts)
	api.GET("/products", handler.List)
	api.POST("/products", handler.Create)
	api.GET("/products/:id", handler.Get)
	api.PUT("/products/:id", handler.Update)
	api.DELETE("/products/:id", handler.Delete)

	// WhatsApp
	api.POST("/whatsapp/send", whatsappHandler.Send)
	api.POST("/whatsapp/webhook", whatsappHandler.Webhook)

	// Analytics — dashboard
	api.GET("/schools/performance", analyticsHandler.SchoolPerformance)
	api.GET("/metrics/global", analyticsHandler.GlobalMetrics)
	api.GET("/recharge/patterns", analyticsHandler.RechargePatterns)
	api.GET("/recharge/trend", analyticsHandler.RechargeTrend)

	// Students — directory view
	api.GET("/students/summary", analyticsHandler.StudentsSummary)
	api.GET("/schools/consumption", analyticsHandler.SchoolConsumption)
	api.GET("/students/directory", studentsHandler.Directory)

	// Students — profile view
	api.GET("/students/:id/profile", studentsHandler.Profile)
	api.GET("/students/:id/transactions", studentsHandler.Transactions)
	api.GET("/students/:id/top-products", studentsHandler.TopProducts)
	api.GET("/students/:id/nutrition", studentsHandler.Nutrition)
	api.GET("/students/:id/analysis", studentsHandler.DailyAnalysis)

	e.GET("/*", echo.WrapHandler(staticHandler(staticFS)))

	return &Server{echo: e}
}

func (s *Server) Start(addr string) error {
	return s.echo.Start(addr)
}

func staticHandler(embedFS fs.FS) http.Handler {
	sub, err := fs.Sub(embedFS, "dist")
	if err != nil {
		return http.NotFoundHandler()
	}
	return http.FileServer(http.FS(sub))
}
