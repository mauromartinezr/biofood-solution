package domain

type TopProduct struct {
	NombreProducto     string  `json:"nombre_producto"`
	VolumenCantidad    float64 `json:"volumen_cantidad"`
	TotalTransacciones int64   `json:"total_transacciones"`
	Ingresos           float64 `json:"ingresos"`
	Posicion           string  `json:"posicion"`
}

type SchoolPerformance struct {
	Colegio               string  `json:"colegio"`
	TotalIngresos         float64 `json:"total_ingresos"`
	Transacciones         int64   `json:"transacciones"`
	TicketPromedio        float64 `json:"ticket_promedio"`
	CrecimientoPorcentaje float64 `json:"crecimiento_porcentaje"`
	TotalUnidades         float64 `json:"total_unidades"`
}

type GlobalMetrics struct {
	IngresosTotales      float64 `json:"ingresos_totales"`
	TotalTransacciones   int64   `json:"total_transacciones"`
	TicketPromedio       float64 `json:"ticket_promedio"`
	MontoRecargaPromedio float64 `json:"monto_recarga_promedio"`
	TotalRecarga         float64 `json:"total_recarga"`
}

type RechargePattern struct {
	Patron     string  `json:"patron"`
	Porcentaje float64 `json:"porcentaje"`
	Cantidad   int64   `json:"cantidad"`
}

type StudentsSummary struct {
	TotalEstudiantes int64   `json:"total_estudiantes"`
	GastoPromedio    float64 `json:"gasto_promedio"`
	SaldosBajosCount int64   `json:"saldos_bajos_count"`
}

type SchoolConsumption struct {
	Colegio            string  `json:"colegio"`
	EstudiantesActivos int64   `json:"estudiantes_activos"`
	Porcentaje         float64 `json:"porcentaje"`
}

type RechargeTrend struct {
	Mes              string  `json:"mes"`
	MontoTotal       float64 `json:"monto_total"`
	NumTransacciones int64   `json:"num_transacciones"`
}
