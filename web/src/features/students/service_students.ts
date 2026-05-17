import { apiClient } from '../../utils/service';
import { API_STUDENTS } from './api_students';
import type {
  StudentSummaryResponse,
  SchoolConsumptionResponse,
  RechargeTrendResponse,
  StudentDirectoryResponse
} from './dto/dto_students';

/**
 * Obtiene el resumen global de estudiantes
 */
export const getStudentsSummary = async (): Promise<StudentSummaryResponse> => {
  try {
    const response = await apiClient.get<StudentSummaryResponse>(API_STUDENTS.GET_STUDENTS_SUMMARY);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene el consumo por colegio
 */
export const getSchoolsConsumption = async (): Promise<SchoolConsumptionResponse> => {
  try {
    const response = await apiClient.get<SchoolConsumptionResponse>(API_STUDENTS.GET_SCHOOLS_CONSUMPTION);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene la tendencia de recargas
 */
export const getRechargeTrend = async (): Promise<RechargeTrendResponse> => {
  try {
    const response = await apiClient.get<RechargeTrendResponse>(API_STUDENTS.GET_RECHARGE_TREND);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene el directorio de estudiantes (paginado)
 */
export const getStudentsDirectory = async (page: number = 1, limit: number = 100): Promise<StudentDirectoryResponse> => {
  try {
    const response = await apiClient.get<StudentDirectoryResponse>(API_STUDENTS.GET_STUDENTS_DIRECTORY(page, limit));
    return response;
  } catch (error) {
    throw error;
  }
};
