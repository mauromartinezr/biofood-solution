package http

import (
	"net/http"

	"biofood-solution/api/internal/features/analytics/application"
	"biofood-solution/api/internal/shared/response"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	svc *application.Service
}

func NewHandler(svc *application.Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) TopSoldProducts(c echo.Context) error {
	products, err := h.svc.GetTopSoldProducts()
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, echo.Map{"productos_mas_vendidos": products})
}

func (h *Handler) SchoolPerformance(c echo.Context) error {
	data, err := h.svc.GetSchoolPerformance()
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, echo.Map{"desempenio_colegio": data})
}

func (h *Handler) GlobalMetrics(c echo.Context) error {
	metrics, err := h.svc.GetGlobalMetrics()
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, echo.Map{"metricas_globales": metrics})
}

func (h *Handler) RechargePatterns(c echo.Context) error {
	patterns, err := h.svc.GetRechargePatterns()
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, echo.Map{"patrones_recarga": patterns})
}

func (h *Handler) StudentsSummary(c echo.Context) error {
	summary, err := h.svc.GetStudentsSummary()
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, echo.Map{"resumen_estudiantes": summary})
}

func (h *Handler) SchoolConsumption(c echo.Context) error {
	data, err := h.svc.GetSchoolConsumption()
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, echo.Map{"consumo_colegio": data})
}

func (h *Handler) RechargeTrend(c echo.Context) error {
	trend, err := h.svc.GetRechargeTrend()
	if err != nil {
		return response.Error(c, err)
	}
	return response.JSON(c, http.StatusOK, echo.Map{"tendencia_recargas": trend})
}
