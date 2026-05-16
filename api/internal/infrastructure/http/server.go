package http

import (
	"io/fs"
	"net/http"

	producthttp "biofood-solution/api/internal/features/products/adapter/http"
	"biofood-solution/api/internal/features/products/application"
	"biofood-solution/api/internal/infrastructure/database"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gorm.io/gorm"
)

type Server struct {
	echo *echo.Echo
}

func NewServer(db *gorm.DB, staticFS fs.FS) *Server {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	repo := database.NewProductRepository(db)
	svc := application.NewService(repo)
	handler := producthttp.NewHandler(svc)

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, echo.Map{"status": "healthy"})
	})

	api := e.Group("/api")
	api.GET("/products", handler.List)
	api.POST("/products", handler.Create)
	api.GET("/products/:id", handler.Get)
	api.PUT("/products/:id", handler.Update)
	api.DELETE("/products/:id", handler.Delete)

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
