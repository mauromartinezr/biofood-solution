import { apiClient } from '../../utils/service';
import { API_DASHBOARD } from './api_dashboard';
import type {
  TopProductsResponse,
  SchoolPerformanceResponse,
  GlobalMetricsResponse,
  RechargePatternsResponse
} from './dto/dto_dashboard';

/**
 * Obtiene el top 4 de productos más vendidos
 */
export const getTopSoldProducts = async (): Promise<TopProductsResponse> => {
  try {
    const response = await apiClient.get<TopProductsResponse>(API_DASHBOARD.GET_TOP_SOLD_PRODUCTS);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene el desempeño por colegio
 */
export const getSchoolsPerformance = async (): Promise<SchoolPerformanceResponse> => {
  try {
    const response = await apiClient.get<SchoolPerformanceResponse>(API_DASHBOARD.GET_SCHOOLS_PERFORMANCE);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene las métricas globales del negocio
 */
export const getGlobalMetrics = async (): Promise<GlobalMetricsResponse> => {
  try {
    const response = await apiClient.get<GlobalMetricsResponse>(API_DASHBOARD.GET_GLOBAL_METRICS);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene los patrones de recarga
 */
export const getRechargePatterns = async (): Promise<RechargePatternsResponse> => {
  try {
    const response = await apiClient.get<RechargePatternsResponse>(API_DASHBOARD.GET_RECHARGE_PATTERNS);
    return response;
  } catch (error) {
    throw error;
  }
};
