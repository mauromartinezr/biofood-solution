export interface StudentProfileDto {
  id: string;
  nombre: string;
  colegio: string;
  billetera_digital: number;
  ticket_promedio: number;
  dias_actividad: number;
}

export interface StudentProfileResponse {
  estudiante: StudentProfileDto;
}

export interface StudentTransactionDto {
  fecha: string;
  producto: string;
  cantidad: number;
  monto: number;
  tipo: 'Compra' | 'Recarga';
}

export interface StudentTransactionsResponse {
  historial: StudentTransactionDto[];
}

export interface StudentTopProductDto {
  nombre: string;
  veces_comprado: number;
  porcentaje: number;
}

export interface StudentTopProductsResponse {
  top_productos: StudentTopProductDto[];
}

export interface StudentNutritionProductDto {
  nombre_producto: string;
  total_unidades: number;
}

export interface StudentNutritionResponse {
  resumen_nutricional: {
    periodo: string;
    consumo: StudentNutritionProductDto[];
  };
}

export interface StudentAnalysisDto {
  dia: string;
  gasto: number;
}

export interface StudentAnalysisResponse {
  analisis_transaccional: StudentAnalysisDto[];
}
