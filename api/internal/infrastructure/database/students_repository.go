package database

import (
	"biofood-solution/api/internal/features/students/domain"
	apperrors "biofood-solution/api/internal/shared/errors"

	"gorm.io/gorm"
)

type StudentsRepository struct {
	hackathonDB *gorm.DB
}

func NewStudentsRepository(hackathonDB *gorm.DB) *StudentsRepository {
	return &StudentsRepository{hackathonDB: hackathonDB}
}

var _ domain.Repository = (*StudentsRepository)(nil)

func (r *StudentsRepository) GetDirectory(page, limit int) ([]domain.DirectoryEntry, int64, error) {
	offset := (page - 1) * limit

	var total int64
	if err := r.hackathonDB.Raw(`
		SELECT COUNT(DISTINCT usuario_identificacion)
		FROM hackaton_ventas
		WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
	`).Scan(&total).Error; err != nil {
		return nil, 0, err
	}

	var rows []struct {
		UsuarioIdentificacion string  `gorm:"column:usuario_identificacion"`
		NombreEstudiante      string  `gorm:"column:nombre_estudiante"`
		NombrePadre           string  `gorm:"column:nombre_padre"`
		SaldoActual           float64 `gorm:"column:saldo_actual"`
		TotalCompras          int64   `gorm:"column:total_compras"`
		NivelActividad        string  `gorm:"column:nivel_actividad"`
		Colegio               string  `gorm:"column:colegio"`
	}

	if err := r.hackathonDB.Raw(`
		SELECT
			usuario_identificacion,
			MAX(nombre_estudiante) AS nombre_estudiante,
			COALESCE(MAX(nombre_padre), '') AS nombre_padre,
			SUM(CASE WHEN cantidad::numeric * precio::numeric > 0 THEN cantidad::numeric * precio::numeric ELSE 0 END) AS saldo_actual,
			COUNT(*) AS total_compras,
			CASE
				WHEN SUM(CASE WHEN cantidad::numeric * precio::numeric > 0 THEN cantidad::numeric * precio::numeric ELSE 0 END) > 1000 THEN 'Alto'
				WHEN SUM(CASE WHEN cantidad::numeric * precio::numeric > 0 THEN cantidad::numeric * precio::numeric ELSE 0 END) > 500  THEN 'Medio'
				ELSE 'Bajo'
			END AS nivel_actividad,
			MAX(colegio) AS colegio
		FROM hackaton_ventas
		WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
		GROUP BY usuario_identificacion
		ORDER BY saldo_actual DESC
		LIMIT ? OFFSET ?
	`, limit, offset).Scan(&rows).Error; err != nil {
		return nil, 0, err
	}

	entries := make([]domain.DirectoryEntry, len(rows))
	for i, row := range rows {
		entries[i] = domain.DirectoryEntry{
			ID:               row.UsuarioIdentificacion,
			NombreEstudiante: row.NombreEstudiante,
			NombrePadre:      row.NombrePadre,
			SaldoActual:      row.SaldoActual,
			TotalCompras:     row.TotalCompras,
			NivelActividad:   row.NivelActividad,
			Colegio:          row.Colegio,
		}
	}
	return entries, total, nil
}

func (r *StudentsRepository) GetProfile(id string) (*domain.StudentProfile, error) {
	var row struct {
		NombreEstudiante string  `gorm:"column:nombre_estudiante"`
		Colegio          string  `gorm:"column:colegio"`
		BilleteraDigital float64 `gorm:"column:billetera_digital"`
		TicketPromedio   float64 `gorm:"column:ticket_promedio"`
		DiasActividad    int64   `gorm:"column:dias_actividad"`
	}

	if err := r.hackathonDB.Raw(`
		SELECT
			MAX(nombre_estudiante) AS nombre_estudiante,
			MAX(colegio) AS colegio,
			COALESCE(SUM(CASE WHEN cantidad::numeric > 0 THEN cantidad::numeric * precio::numeric ELSE 0 END), 0) AS billetera_digital,
			COALESCE(ROUND(AVG(CASE WHEN cantidad::numeric > 0 THEN cantidad::numeric * precio::numeric END)::numeric, 2), 0) AS ticket_promedio,
			COUNT(DISTINCT fecha::date) AS dias_actividad
		FROM hackaton_ventas
		WHERE usuario_identificacion = ?
			AND fecha >= CURRENT_DATE - INTERVAL '30 days'
	`, id).Scan(&row).Error; err != nil {
		return nil, err
	}

	if row.NombreEstudiante == "" {
		return nil, apperrors.ErrNotFound
	}

	return &domain.StudentProfile{
		ID:               id,
		Nombre:           row.NombreEstudiante,
		Colegio:          row.Colegio,
		BilleteraDigital: row.BilleteraDigital,
		TicketPromedio:   row.TicketPromedio,
		DiasActividad:    row.DiasActividad,
	}, nil
}

func (r *StudentsRepository) GetTransactions(id string) ([]domain.Transaction, error) {
	var rows []struct {
		Fecha          string  `gorm:"column:fecha"`
		NombreProducto string  `gorm:"column:nombre_producto"`
		Cantidad       float64 `gorm:"column:cantidad"`
		Precio         float64 `gorm:"column:precio"`
		Monto          float64 `gorm:"column:monto"`
		Tipo           string  `gorm:"column:tipo"`
	}

	if err := r.hackathonDB.Raw(`
		SELECT
			fecha::text AS fecha,
			nombre_producto,
			cantidad::numeric AS cantidad,
			precio::numeric AS precio,
			(cantidad::numeric * precio::numeric) AS monto,
			CASE WHEN cantidad::numeric > 0 THEN 'Compra' ELSE 'Recarga' END AS tipo
		FROM hackaton_ventas
		WHERE usuario_identificacion = ?
		ORDER BY fecha DESC
		LIMIT 20
	`, id).Scan(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]domain.Transaction, len(rows))
	for i, row := range rows {
		result[i] = domain.Transaction{
			Fecha:    row.Fecha,
			Producto: row.NombreProducto,
			Cantidad: row.Cantidad,
			Monto:    row.Monto,
			Tipo:     row.Tipo,
		}
	}
	return result, nil
}

func (r *StudentsRepository) GetTopProducts(id string) ([]domain.TopStudentProduct, error) {
	var rows []struct {
		NombreProducto string  `gorm:"column:nombre_producto"`
		VecesComprado  int64   `gorm:"column:veces_comprado"`
		Porcentaje     float64 `gorm:"column:porcentaje"`
	}

	if err := r.hackathonDB.Raw(`
		SELECT
			nombre_producto,
			COUNT(*) AS veces_comprado,
			ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER())::numeric, 0) AS porcentaje
		FROM hackaton_ventas
		WHERE usuario_identificacion = ?
			AND cantidad::numeric > 0
		GROUP BY nombre_producto
		ORDER BY veces_comprado DESC
		LIMIT 3
	`, id).Scan(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]domain.TopStudentProduct, len(rows))
	for i, row := range rows {
		result[i] = domain.TopStudentProduct{
			Nombre:        row.NombreProducto,
			VecesComprado: row.VecesComprado,
			Porcentaje:    row.Porcentaje,
		}
	}
	return result, nil
}

func (r *StudentsRepository) GetNutrition(id string) ([]domain.NutritionItem, error) {
	var rows []struct {
		NombreProducto string  `gorm:"column:nombre_producto"`
		TotalUnidades  float64 `gorm:"column:total_unidades"`
	}

	if err := r.hackathonDB.Raw(`
		SELECT
			nombre_producto,
			SUM(cantidad::numeric) AS total_unidades
		FROM hackaton_ventas
		WHERE usuario_identificacion = ?
			AND cantidad::numeric > 0
			AND fecha >= CURRENT_DATE - INTERVAL '7 days'
		GROUP BY nombre_producto
		ORDER BY total_unidades DESC
	`, id).Scan(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]domain.NutritionItem, len(rows))
	for i, row := range rows {
		result[i] = domain.NutritionItem{
			NombreProducto: row.NombreProducto,
			TotalUnidades:  row.TotalUnidades,
		}
	}
	return result, nil
}

func (r *StudentsRepository) GetDailyAnalysis(id string) ([]domain.DailyAnalysis, error) {
	var rows []struct {
		Dia   string  `gorm:"column:dia"`
		Gasto float64 `gorm:"column:gasto"`
	}

	if err := r.hackathonDB.Raw(`
		SELECT
			DATE_TRUNC('day', fecha::date)::text AS dia,
			SUM(CASE WHEN cantidad::numeric > 0 THEN cantidad::numeric * precio::numeric ELSE 0 END) AS gasto
		FROM hackaton_ventas
		WHERE usuario_identificacion = ?
			AND fecha >= CURRENT_DATE - INTERVAL '30 days'
		GROUP BY DATE_TRUNC('day', fecha::date)
		ORDER BY dia ASC
	`, id).Scan(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]domain.DailyAnalysis, len(rows))
	for i, row := range rows {
		result[i] = domain.DailyAnalysis{
			Dia:   row.Dia,
			Gasto: row.Gasto,
		}
	}
	return result, nil
}
