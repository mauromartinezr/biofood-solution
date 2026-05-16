package http

import (
	"net/http"
	"strconv"

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
		Name:        body.Name,
		Description: body.Description,
		Price:       body.Price,
		Stock:       body.Stock,
	})
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusCreated, p)
}

func (h *Handler) Get(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return response.Error(c, err)
	}
	p, err := h.svc.Get(id)
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, p)
}

func (h *Handler) Update(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return response.Error(c, err)
	}
	var body updateRequest
	if err := c.Bind(&body); err != nil {
		return response.Error(c, err)
	}
	p, err := h.svc.Update(id, application.UpdateInput{
		Name:        body.Name,
		Description: body.Description,
		Price:       body.Price,
		Stock:       body.Stock,
	})
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, p)
}

func (h *Handler) Delete(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return response.Error(c, err)
	}
	if err := h.svc.Delete(id); err != nil {
		return response.Error(c, err)
	}
	return c.NoContent(http.StatusNoContent)
}

type createRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
}

type updateRequest struct {
	Name        *string  `json:"name"`
	Description *string  `json:"description"`
	Price       *float64 `json:"price"`
	Stock       *int     `json:"stock"`
}

func parseID(c echo.Context) (uint, error) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil || id == 0 {
		return 0, apperrors.ErrInvalidInput
	}
	return uint(id), nil
}
