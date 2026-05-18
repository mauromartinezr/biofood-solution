import { apiClient } from '../../utils/service';
import { API_PROFILE } from './api_profile';
import type {
  StudentProfileResponse,
  StudentTransactionsResponse,
  StudentTopProductsResponse,
  StudentNutritionResponse,
  StudentAnalysisResponse
} from './dto/dto_profile';

/**
 * Obtiene el perfil de un estudiante por su ID
 */
export const getStudentProfile = async (id: string): Promise<StudentProfileResponse> => {
  try {
    const response = await apiClient.get<StudentProfileResponse>(API_PROFILE.GET_STUDENT_PROFILE(id));
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene el historial de transacciones de un estudiante
 */
export const getStudentTransactions = async (id: string): Promise<StudentTransactionsResponse> => {
  try {
    const response = await apiClient.get<StudentTransactionsResponse>(API_PROFILE.GET_STUDENT_TRANSACTIONS(id));
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene los productos más comprados de un estudiante
 */
export const getStudentTopProducts = async (id: string): Promise<StudentTopProductsResponse> => {
  try {
    const response = await apiClient.get<StudentTopProductsResponse>(API_PROFILE.GET_STUDENT_TOP_PRODUCTS(id));
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene el consumo nutricional semanal de un estudiante
 */
export const getStudentNutrition = async (id: string): Promise<StudentNutritionResponse> => {
  try {
    const response = await apiClient.get<StudentNutritionResponse>(API_PROFILE.GET_STUDENT_NUTRITION(id));
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene el análisis transaccional diario de un estudiante
 */
export const getStudentAnalysis = async (id: string): Promise<StudentAnalysisResponse> => {
  try {
    const response = await apiClient.get<StudentAnalysisResponse>(API_PROFILE.GET_STUDENT_ANALYSIS(id));
    return response;
  } catch (error) {
    throw error;
  }
};
