package response

import (
	"errors"
	"net/http"

	apperrors "biofood-solution/api/internal/shared/errors"

	"github.com/labstack/echo/v4"
)

func JSON(c echo.Context, status int, data any) error {
	return c.JSON(status, data)
}

func Error(c echo.Context, err error) error {
	switch {
	case errors.Is(err, apperrors.ErrNotFound):
		return c.JSON(http.StatusNotFound, echo.Map{"error": err.Error()})
	case errors.Is(err, apperrors.ErrInvalidInput):
		return c.JSON(http.StatusBadRequest, echo.Map{"error": err.Error()})
	default:
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
}
