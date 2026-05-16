package http

import (
	"net/http"

	"biofood-solution/api/internal/features/products/application"
	apperrors "biofood-solution/api/internal/shared/errors"
	"biofood-solution/api/internal/shared/response"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	svc *application.Service
}

func NewHandler(svc *application.Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) List(c echo.Context) error {
	products, err := h.svc.List()
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, products)
}

func (h *Handler) Create(c echo.Context) error {
	var body createRequest
	if err := c.Bind(&body); err != nil {
		return response.Error(c, err)
	}
	p, err := h.svc.Create(application.CreateInput{
		Name:     body.Name,
		Category: body.Category,
		Price:    body.Price,
	})
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusCreated, p)
}

func (h *Handler) Get(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return response.Error(c, apperrors.ErrInvalidInput)
	}
	p, err := h.svc.Get(id)
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, p)
}

func (h *Handler) Update(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return response.Error(c, apperrors.ErrInvalidInput)
	}
	var body updateRequest
	if err := c.Bind(&body); err != nil {
		return response.Error(c, err)
	}
	p, err := h.svc.Update(id, application.UpdateInput{
		Name:     body.Name,
		Category: body.Category,
		Price:    body.Price,
	})
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, p)
}

func (h *Handler) Delete(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return response.Error(c, apperrors.ErrInvalidInput)
	}
	if err := h.svc.Delete(id); err != nil {
		return response.Error(c, err)
	}
	return c.NoContent(http.StatusNoContent)
}

type createRequest struct {
	Name     string  `json:"name"`
	Category string  `json:"category"`
	Price    float64 `json:"price"`
}

type updateRequest struct {
	Name     *string  `json:"name"`
	Category *string  `json:"category"`
	Price    *float64 `json:"price"`
}
