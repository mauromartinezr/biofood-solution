package http

import (
	"net/http"
	"strconv"

	"biofood-solution/api/internal/features/students/application"
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

func (h *Handler) Directory(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	entries, total, err := h.svc.GetDirectory(page, limit)
	if err != nil {
		return response.Error(c, err)
	}

	return response.JSON(c, http.StatusOK, echo.Map{
		"directorio": entries,
		"paginacion": echo.Map{
			"total_registros":      total,
			"pagina_actual":        page,
			"registros_por_pagina": limit,
		},
	})
}

func (h *Handler) Profile(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return response.Error(c, apperrors.ErrInvalidInput)
	}
	profile, err := h.svc.GetProfile(id)
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, echo.Map{"estudiante": profile})
}

func (h *Handler) Transactions(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return response.Error(c, apperrors.ErrInvalidInput)
	}
	txs, err := h.svc.GetTransactions(id)
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, echo.Map{"historial": txs})
}

func (h *Handler) TopProducts(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return response.Error(c, apperrors.ErrInvalidInput)
	}
	products, err := h.svc.GetTopProducts(id)
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, echo.Map{"top_productos": products})
}

func (h *Handler) Nutrition(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return response.Error(c, apperrors.ErrInvalidInput)
	}
	items, err := h.svc.GetNutrition(id)
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, echo.Map{
		"resumen_nutricional": echo.Map{
			"periodo": "Semanal",
			"consumo": items,
		},
	})
}

func (h *Handler) DailyAnalysis(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return response.Error(c, apperrors.ErrInvalidInput)
	}
	analysis, err := h.svc.GetDailyAnalysis(id)
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, echo.Map{"analisis_transaccional": analysis})
}
