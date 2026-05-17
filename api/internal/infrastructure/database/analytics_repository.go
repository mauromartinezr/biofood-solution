package database

import (
	"biofood-solution/api/internal/features/analytics/domain"

	"gorm.io/gorm"
)

type AnalyticsRepository struct {
	hackathonDB *gorm.DB
}

func NewAnalyticsRepository(hackathonDB *gorm.DB) *AnalyticsRepository {
	return &AnalyticsRepository{hackathonDB: hackathonDB}
}

var _ domain.Repository = (*AnalyticsRepository)(nil)

func (r *AnalyticsRepository) GetTopSoldProducts() ([]domain.TopProduct, error) {
	var rows []struct {
		NombreProducto     string  `gorm:"column:nombre_producto"`
		VolumenCantidad    float64 `gorm:"column:volumen_cantidad"`
		TotalTransacciones int64   `gorm:"column:total_transacciones"`
		Ingresos           float64 `gorm:"column:ingresos"`
	}

	if err := r.hackathonDB.Raw(`
		SELECT
			nombre_producto,
			SUM(cantidad::numeric) AS volumen_cantidad,
			COUNT(*) AS total_transacciones,
			SUM(cantidad::numeric * precio::numeric) AS ingresos
		FROM hackaton_ventas
		WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
		GROUP BY nombre_producto
		ORDER BY ingresos DESC
		LIMIT 4
	`).Scan(&rows).Error; err != nil {
		return nil, err
	}

	positions := []string{"TOP1", "TOP2", "TOP3", "TOP4"}
	products := make([]domain.TopProduct, len(rows))
	for i, row := range rows {
		pos := ""
		if i < len(positions) {
			pos = positions[i]
		}
		products[i] = domain.TopProduct{
			NombreProducto:     row.NombreProducto,
			VolumenCantidad:    row.VolumenCantidad,
			TotalTransacciones: row.TotalTransacciones,
			Ingresos:           row.Ingresos,
			Posicion:           pos,
		}
	}
	return products, nil
}

func (r *AnalyticsRepository) GetSchoolPerformance() ([]domain.SchoolPerformance, error) {
	var rows []struct {
		Colegio               string  `gorm:"column:colegio"`
		TotalIngresos         float64 `gorm:"column:total_ingresos"`
		Transacciones         int64   `gorm:"column:transacciones"`
		TicketPromedio        float64 `gorm:"column:ticket_promedio"`
		TotalUnidades         float64 `gorm:"column:total_unidades"`
		CrecimientoPorcentaje float64 `gorm:"column:crecimiento_porcentaje"`
	}

	if err := r.hackathonDB.Raw(`
		WITH school_data AS (
			SELECT
				colegio,
				SUM(precio::numeric * cantidad::numeric) AS total_ingresos,
				COUNT(*) AS transacciones,
				SUM(cantidad::numeric) AS total_unidades,
				ROUND((SUM(precio::numeric * cantidad::numeric) / NULLIF(COUNT(*), 0))::numeric, 2) AS ticket_promedio
			FROM hackaton_ventas
			WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
			GROUP BY colegio
		)
		SELECT
			colegio,
			total_ingresos,
			transacciones,
			ticket_promedio,
			total_unidades,
			COALESCE(ROUND(((total_ingresos - LAG(total_ingresos) OVER (ORDER BY colegio)) /
				NULLIF(LAG(total_ingresos) OVER (ORDER BY colegio), 0) * 100)::numeric, 1), 0) AS crecimiento_porcentaje
		FROM school_data
		ORDER BY total_ingresos DESC
	`).Scan(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]domain.SchoolPerformance, len(rows))
	for i, row := range rows {
		result[i] = domain.SchoolPerformance{
			Colegio:               row.Colegio,
			TotalIngresos:         row.TotalIngresos,
			Transacciones:         row.Transacciones,
			TicketPromedio:        row.TicketPromedio,
			TotalUnidades:         row.TotalUnidades,
			CrecimientoPorcentaje: row.CrecimientoPorcentaje,
		}
	}
	return result, nil
}

func (r *AnalyticsRepository) GetGlobalMetrics() (*domain.GlobalMetrics, error) {
	var row struct {
		IngresosTotales      float64 `gorm:"column:ingresos_totales"`
		TotalTransacciones   int64   `gorm:"column:total_transacciones"`
		TicketPromedio       float64 `gorm:"column:ticket_promedio"`
		MontoRecargaPromedio float64 `gorm:"column:monto_recarga_promedio"`
		TotalRecarga         float64 `gorm:"column:total_recarga"`
	}

	if err := r.hackathonDB.Raw(`
		SELECT
			COALESCE(SUM(cantidad::numeric * precio::numeric), 0) AS ingresos_totales,
			COUNT(*) AS total_transacciones,
			COALESCE(ROUND(AVG(cantidad::numeric * precio::numeric)::numeric, 2), 0) AS ticket_promedio,
			COALESCE(AVG(CASE WHEN cantidad::numeric > 0 THEN cantidad::numeric * precio::numeric END), 0) AS monto_recarga_promedio,
			COALESCE(SUM(CASE WHEN cantidad::numeric > 0 THEN cantidad::numeric * precio::numeric ELSE 0 END), 0) AS total_recarga
		FROM hackaton_ventas
		WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
	`).Scan(&row).Error; err != nil {
		return nil, err
	}

	return &domain.GlobalMetrics{
		IngresosTotales:      row.IngresosTotales,
		TotalTransacciones:   row.TotalTransacciones,
		TicketPromedio:       row.TicketPromedio,
		MontoRecargaPromedio: row.MontoRecargaPromedio,
		TotalRecarga:         row.TotalRecarga,
	}, nil
}

func (r *AnalyticsRepository) GetRechargePatterns() ([]domain.RechargePattern, error) {
	var rows []struct {
		Patron     string  `gorm:"column:patron"`
		Cantidad   int64   `gorm:"column:total_recargas"`
		Porcentaje float64 `gorm:"column:porcentaje"`
	}

	if err := r.hackathonDB.Raw(`
		SELECT
			CASE
				WHEN EXTRACT(DOW FROM fecha::date) IN (1, 2) THEN 'Lunes a Martes'
				WHEN EXTRACT(DOW FROM fecha::date) IN (3, 4) THEN 'Miércoles a Jueves'
				ELSE 'Viernes a Domingo'
			END AS patron,
			COUNT(*) AS total_recargas,
			ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER())::numeric, 0) AS porcentaje
		FROM hackaton_ventas
		WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
		GROUP BY patron
		ORDER BY total_recargas DESC
	`).Scan(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]domain.RechargePattern, len(rows))
	for i, row := range rows {
		result[i] = domain.RechargePattern{
			Patron:     row.Patron,
			Porcentaje: row.Porcentaje,
			Cantidad:   row.Cantidad,
		}
	}
	return result, nil
}

func (r *AnalyticsRepository) GetStudentsSummary() (*domain.StudentsSummary, error) {
	var row struct {
		TotalEstudiantes int64   `gorm:"column:total_estudiantes"`
		GastoPromedio    float64 `gorm:"column:gasto_promedio"`
		SaldosBajosCount int64   `gorm:"column:saldos_bajos_count"`
	}

	if err := r.hackathonDB.Raw(`
		SELECT
			COUNT(DISTINCT usuario_identificacion) AS total_estudiantes,
			COALESCE(ROUND(AVG(cantidad::numeric * precio::numeric)::numeric, 2), 0) AS gasto_promedio,
			COUNT(*) FILTER (WHERE cantidad::numeric * precio::numeric < 0) AS saldos_bajos_count
		FROM hackaton_ventas
		WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
	`).Scan(&row).Error; err != nil {
		return nil, err
	}

	return &domain.StudentsSummary{
		TotalEstudiantes: row.TotalEstudiantes,
		GastoPromedio:    row.GastoPromedio,
		SaldosBajosCount: row.SaldosBajosCount,
	}, nil
}

func (r *AnalyticsRepository) GetSchoolConsumption() ([]domain.SchoolConsumption, error) {
	var rows []struct {
		Colegio            string  `gorm:"column:colegio"`
		EstudiantesActivos int64   `gorm:"column:estudiantes_activos"`
		Porcentaje         float64 `gorm:"column:porcentaje"`
	}

	if err := r.hackathonDB.Raw(`
		SELECT
			colegio,
			COUNT(DISTINCT usuario_identificacion) AS estudiantes_activos,
			ROUND((COUNT(DISTINCT usuario_identificacion) * 100.0 /
				SUM(COUNT(DISTINCT usuario_identificacion)) OVER())::numeric, 0) AS porcentaje
		FROM hackaton_ventas
		WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
		GROUP BY colegio
		ORDER BY estudiantes_activos DESC
		LIMIT 3
	`).Scan(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]domain.SchoolConsumption, len(rows))
	for i, row := range rows {
		result[i] = domain.SchoolConsumption{
			Colegio:            row.Colegio,
			EstudiantesActivos: row.EstudiantesActivos,
			Porcentaje:         row.Porcentaje,
		}
	}
	return result, nil
}

func (r *AnalyticsRepository) GetRechargeTrend() ([]domain.RechargeTrend, error) {
	var rows []struct {
		Mes              string  `gorm:"column:mes"`
		MontoTotal       float64 `gorm:"column:monto_total"`
		NumTransacciones int64   `gorm:"column:num_transacciones"`
	}

	if err := r.hackathonDB.Raw(`
		SELECT
			DATE_TRUNC('month', fecha::date)::text AS mes,
			SUM(cantidad::numeric * precio::numeric) AS monto_total,
			COUNT(*) AS num_transacciones
		FROM hackaton_ventas
		WHERE fecha >= CURRENT_DATE - INTERVAL '6 months'
		GROUP BY DATE_TRUNC('month', fecha::date)
		ORDER BY mes ASC
	`).Scan(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]domain.RechargeTrend, len(rows))
	for i, row := range rows {
		result[i] = domain.RechargeTrend{
			Mes:              row.Mes,
			MontoTotal:       row.MontoTotal,
			NumTransacciones: row.NumTransacciones,
		}
	}
	return result, nil
}
