export interface StudentSummaryDto {
  total_estudiantes: number;
  gasto_promedio: number;
  saldos_bajos_count: number;
}

export interface StudentSummaryResponse {
  resumen_estudiantes: StudentSummaryDto;
}

export interface SchoolConsumptionDto {
  colegio: string;
  estudiantes_activos: number;
  porcentaje: number;
}

export interface SchoolConsumptionResponse {
  consumo_colegio: SchoolConsumptionDto[];
}

export interface RechargeTrendDto {
  mes: string;
  monto_total: number;
  num_transacciones: number;
}

export interface RechargeTrendResponse {
  tendencia_recargas: RechargeTrendDto[];
}

export interface StudentDirectoryItemDto {
  id: string;
  nombre_estudiante: string;
  nombre_padre: string;
  saldo_actual: number;
  total_compras: number;
  nivel_actividad: 'Alto' | 'Medio' | 'Bajo';
  colegio: string;
}

export interface PaginationDto {
  total_registros: number;
  pagina_actual: number;
  registros_por_pagina: number;
}

export interface StudentDirectoryResponse {
  directorio: StudentDirectoryItemDto[];
  paginacion: PaginationDto;
}
