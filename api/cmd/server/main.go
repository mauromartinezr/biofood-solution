package main

import (
	"io/fs"
	"net/http"

	"biofood-solution/api/internal/handler"
	"biofood-solution/api/internal/model"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

//go:generate go run github.com/a-h/templ/cmd/templ@latest generate

func main() {
	db, err := gorm.Open(sqlite.Open("biofood.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database: " + err.Error())
	}

	if err := db.AutoMigrate(&model.Product{}); err != nil {
		panic("failed to migrate: " + err.Error())
	}

	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// API routes
	api := e.Group("/api")
	h := handler.NewProductHandler(db)
	api.GET("/products", h.List)
	api.POST("/products", h.Create)
	api.GET("/products/:id", h.Get)
	api.PUT("/products/:id", h.Update)
	api.DELETE("/products/:id", h.Delete)

	// Serve embedded React assets — populated at build time via embedFS
	e.GET("/*", echo.WrapHandler(staticHandler()))

	e.Logger.Fatal(e.Start(":8080"))
}

// staticHandler returns an http.Handler that serves the embedded web assets.
// The embedFS variable is declared in embed.go and populated during build.
func staticHandler() http.Handler {
	sub, err := fs.Sub(embedFS, "dist")
	if err != nil {
		// dist not embedded (dev mode) — serve nothing
		return http.NotFoundHandler()
	}
	return http.FileServer(http.FS(sub))
}
