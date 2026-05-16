package http

import (
	"io/fs"
	"net/http"

	producthttp "biofood-solution/api/internal/features/products/adapter/http"
	"biofood-solution/api/internal/features/products/application"
	whatsapphttp "biofood-solution/api/internal/features/whatsapp/adapter/http"
	whatsappapp "biofood-solution/api/internal/features/whatsapp/application"
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
	whatsappSvc := whatsappapp.NewService(evolutionSender, botRepo)
	whatsappHandler := whatsapphttp.NewHandler(whatsappSvc)

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, echo.Map{"status": "healthy"})
	})

	api := e.Group("/api")
	api.GET("/products", handler.List)
	api.POST("/products", handler.Create)
	api.GET("/products/:id", handler.Get)
	api.PUT("/products/:id", handler.Update)
	api.DELETE("/products/:id", handler.Delete)

	api.POST("/whatsapp/send", whatsappHandler.Send)
	api.POST("/whatsapp/webhook", whatsappHandler.Webhook)

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
