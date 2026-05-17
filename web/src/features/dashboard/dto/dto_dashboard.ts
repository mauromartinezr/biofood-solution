export interface TopProductDto {
  nombre_producto: string;
  volumen_cantidad: number;
  total_transacciones: number;
  ingresos: number;
  posicion: string;
}

export interface TopProductsResponse {
  productos_mas_vendidos: TopProductDto[];
}

export interface SchoolPerformanceDto {
  colegio: string;
  total_ingresos: number;
  transacciones: number;
  ticket_promedio: number;
  crecimiento_porcentaje: number;
  total_unidades: number;
}

export interface SchoolPerformanceResponse {
  desempenio_colegio: SchoolPerformanceDto[];
}

export interface GlobalMetricsDto {
  ingresos_totales: number;
  total_transacciones: number;
  ticket_promedio: number;
  monto_recarga_promedio: number;
  total_recarga: number;
}

export interface GlobalMetricsResponse {
  metricas_globales: GlobalMetricsDto;
}

export interface RechargePatternDto {
  patron: string;
  porcentaje: number;
  cantidad: number;
}

export interface RechargePatternsResponse {
  patrones_recarga: RechargePatternDto[];
}
