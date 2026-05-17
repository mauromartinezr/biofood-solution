package domain

type DirectoryEntry struct {
	ID               string  `json:"id"`
	NombreEstudiante string  `json:"nombre_estudiante"`
	NombrePadre      string  `json:"nombre_padre"`
	SaldoActual      float64 `json:"saldo_actual"`
	TotalCompras     int64   `json:"total_compras"`
	NivelActividad   string  `json:"nivel_actividad"`
	Colegio          string  `json:"colegio"`
}

type DirectoryPagination struct {
	TotalRegistros     int64 `json:"total_registros"`
	PaginaActual       int   `json:"pagina_actual"`
	RegistrosPorPagina int   `json:"registros_por_pagina"`
}

type StudentProfile struct {
	ID               string  `json:"id"`
	Nombre           string  `json:"nombre"`
	Colegio          string  `json:"colegio"`
	BilleteraDigital float64 `json:"billetera_digital"`
	TicketPromedio   float64 `json:"ticket_promedio"`
	DiasActividad    int64   `json:"dias_actividad"`
}

type Transaction struct {
	Fecha    string  `json:"fecha"`
	Producto string  `json:"producto"`
	Cantidad float64 `json:"cantidad"`
	Monto    float64 `json:"monto"`
	Tipo     string  `json:"tipo"`
}

type TopStudentProduct struct {
	Nombre        string  `json:"nombre"`
	VecesComprado int64   `json:"veces_comprado"`
	Porcentaje    float64 `json:"porcentaje"`
}

type NutritionItem struct {
	NombreProducto string  `json:"nombre_producto"`
	TotalUnidades  float64 `json:"total_unidades"`
}

type DailyAnalysis struct {
	Dia   string  `json:"dia"`
	Gasto float64 `json:"gasto"`
}
