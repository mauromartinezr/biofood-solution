import {
  getTopSoldProducts,
  getSchoolsPerformance,
  getGlobalMetrics,
  getRechargePatterns
} from './service_dashboard';
import type {
  TopProductDto,
  SchoolPerformanceDto,
  GlobalMetricsDto,
  RechargePatternDto
} from './dto/dto_dashboard';

export interface TopProductsCallbacks {
  onSuccess?: (data: TopProductDto[]) => void;
  onError?: (message: string) => void;
}

export interface SchoolPerformanceCallbacks {
  onSuccess?: (data: SchoolPerformanceDto[]) => void;
  onError?: (message: string) => void;
}

export interface GlobalMetricsCallbacks {
  onSuccess?: (data: GlobalMetricsDto) => void;
  onError?: (message: string) => void;
}

export interface RechargePatternsCallbacks {
  onSuccess?: (data: RechargePatternDto[]) => void;
  onError?: (message: string) => void;
}

/**
 * Caso de uso para obtener los productos más vendidos con soporte de callbacks
 */
export const getTopSoldProductsUseCase = async (
  callbacks?: TopProductsCallbacks
): Promise<TopProductDto[]> => {
  try {
    const response = await getTopSoldProducts();
    const data = response.productos_mas_vendidos || [];
    
    if (callbacks?.onSuccess) {
      callbacks.onSuccess(data);
    }
    return data;
  } catch (error: any) {
    const errorMessage = error.message || 'Error al obtener productos más vendidos';
    if (callbacks?.onError) {
      callbacks.onError(errorMessage);
    }
    throw new Error(errorMessage);
  }
};

/**
 * Caso de uso para obtener el desempeño por colegio con soporte de callbacks
 */
export const getSchoolsPerformanceUseCase = async (
  callbacks?: SchoolPerformanceCallbacks
): Promise<SchoolPerformanceDto[]> => {
  try {
    const response = await getSchoolsPerformance();
    const data = response.desempenio_colegio || [];
    
    if (callbacks?.onSuccess) {
      callbacks.onSuccess(data);
    }
    return data;
  } catch (error: any) {
    const errorMessage = error.message || 'Error al obtener desempeño de colegios';
    if (callbacks?.onError) {
      callbacks.onError(errorMessage);
    }
    throw new Error(errorMessage);
  }
};

/**
 * Caso de uso para obtener las métricas globales con soporte de callbacks
 */
export const getGlobalMetricsUseCase = async (
  callbacks?: GlobalMetricsCallbacks
): Promise<GlobalMetricsDto> => {
  try {
    const response = await getGlobalMetrics();
    const data = response.metricas_globales;
    
    if (callbacks?.onSuccess) {
      callbacks.onSuccess(data);
    }
    return data;
  } catch (error: any) {
    const errorMessage = error.message || 'Error al obtener métricas globales';
    if (callbacks?.onError) {
      callbacks.onError(errorMessage);
    }
    throw new Error(errorMessage);
  }
};

/**
 * Caso de uso para obtener patrones de recarga con soporte de callbacks
 */
export const getRechargePatternsUseCase = async (
  callbacks?: RechargePatternsCallbacks
): Promise<RechargePatternDto[]> => {
  try {
    const response = await getRechargePatterns();
    const data = response.patrones_recarga || [];
    
    if (callbacks?.onSuccess) {
      callbacks.onSuccess(data);
    }
    return data;
  } catch (error: any) {
    const errorMessage = error.message || 'Error al obtener patrones de recarga';
    if (callbacks?.onError) {
      callbacks.onError(errorMessage);
    }
    throw new Error(errorMessage);
  }
};
