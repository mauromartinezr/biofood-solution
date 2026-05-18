import {
  getStudentsSummary,
  getSchoolsConsumption,
  getRechargeTrend,
  getStudentsDirectory
} from './service_students';
import type {
  StudentSummaryDto,
  SchoolConsumptionDto,
  RechargeTrendDto,
  StudentDirectoryItemDto,
  PaginationDto
} from './dto/dto_students';

export interface StudentSummaryCallbacks {
  onSuccess?: (data: StudentSummaryDto) => void;
  onError?: (message: string) => void;
}

export interface SchoolConsumptionCallbacks {
  onSuccess?: (data: SchoolConsumptionDto[]) => void;
  onError?: (message: string) => void;
}

export interface RechargeTrendCallbacks {
  onSuccess?: (data: RechargeTrendDto[]) => void;
  onError?: (message: string) => void;
}

export interface StudentDirectoryCallbacks {
  onSuccess?: (data: StudentDirectoryItemDto[], pagination: PaginationDto) => void;
  onError?: (message: string) => void;
}

/**
 * Caso de uso para obtener el resumen global de estudiantes
 */
export const getStudentsSummaryUseCase = async (
  callbacks?: StudentSummaryCallbacks
): Promise<StudentSummaryDto> => {
  try {
    const response = await getStudentsSummary();
    const data = response.resumen_estudiantes;
    
    if (callbacks?.onSuccess) {
      callbacks.onSuccess(data);
    }
    return data;
  } catch (error: any) {
    const errorMessage = error.message || 'Error al obtener resumen de estudiantes';
    if (callbacks?.onError) {
      callbacks.onError(errorMessage);
    }
    throw new Error(errorMessage);
  }
};

/**
 * Caso de uso para obtener el consumo por colegio
 */
export const getSchoolsConsumptionUseCase = async (
  callbacks?: SchoolConsumptionCallbacks
): Promise<SchoolConsumptionDto[]> => {
  try {
    const response = await getSchoolsConsumption();
    const data = response.consumo_colegio || [];
    
    if (callbacks?.onSuccess) {
      callbacks.onSuccess(data);
    }
    return data;
  } catch (error: any) {
    const errorMessage = error.message || 'Error al obtener consumo por colegio';
    if (callbacks?.onError) {
      callbacks.onError(errorMessage);
    }
    throw new Error(errorMessage);
  }
};

/**
 * Caso de uso para obtener la tendencia de recargas
 */
export const getRechargeTrendUseCase = async (
  callbacks?: RechargeTrendCallbacks
): Promise<RechargeTrendDto[]> => {
  try {
    const response = await getRechargeTrend();
    const data = response.tendencia_recargas || [];
    
    if (callbacks?.onSuccess) {
      callbacks.onSuccess(data);
    }
    return data;
  } catch (error: any) {
    const errorMessage = error.message || 'Error al obtener tendencia de recargas';
    if (callbacks?.onError) {
      callbacks.onError(errorMessage);
    }
    throw new Error(errorMessage);
  }
};

/**
 * Caso de uso para obtener el directorio de estudiantes
 */
export const getStudentsDirectoryUseCase = async (
  page: number = 1,
  limit: number = 100,
  callbacks?: StudentDirectoryCallbacks
): Promise<{ directorio: StudentDirectoryItemDto[]; paginacion: PaginationDto }> => {
  try {
    const response = await getStudentsDirectory(page, limit);
    const result = {
      directorio: response.directorio || [],
      paginacion: response.paginacion || { total_registros: 0, pagina_actual: 1, registros_por_pagina: 10 }
    };
    
    if (callbacks?.onSuccess) {
      callbacks.onSuccess(result.directorio, result.paginacion);
    }
    return result;
  } catch (error: any) {
    const errorMessage = error.message || 'Error al obtener directorio de estudiantes';
    if (callbacks?.onError) {
      callbacks.onError(errorMessage);
    }
    throw new Error(errorMessage);
  }
};
