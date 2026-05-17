import {
  getStudentProfile,
  getStudentTransactions,
  getStudentTopProducts,
  getStudentNutrition,
  getStudentAnalysis
} from './service_profile';
import type {
  StudentProfileDto,
  StudentTransactionDto,
  StudentTopProductDto,
  StudentNutritionProductDto,
  StudentAnalysisDto
} from './dto/dto_profile';

export interface StudentProfileCallbacks {
  onSuccess?: (data: StudentProfileDto) => void;
  onError?: (message: string) => void;
}

export interface StudentTransactionsCallbacks {
  onSuccess?: (data: StudentTransactionDto[]) => void;
  onError?: (message: string) => void;
}

export interface StudentTopProductsCallbacks {
  onSuccess?: (data: StudentTopProductDto[]) => void;
  onError?: (message: string) => void;
}

export interface StudentNutritionCallbacks {
  onSuccess?: (data: StudentNutritionProductDto[], periodo: string) => void;
  onError?: (message: string) => void;
}

export interface StudentAnalysisCallbacks {
  onSuccess?: (data: StudentAnalysisDto[]) => void;
  onError?: (message: string) => void;
}

/**
 * Caso de uso para obtener el perfil de un estudiante
 */
export const getStudentProfileUseCase = async (
  id: string,
  callbacks?: StudentProfileCallbacks
): Promise<StudentProfileDto> => {
  try {
    const response = await getStudentProfile(id);
    const data = response.estudiante;
    
    if (callbacks?.onSuccess) {
      callbacks.onSuccess(data);
    }
    return data;
  } catch (error: any) {
    const errorMessage = error.message || 'Error al obtener perfil del estudiante';
    if (callbacks?.onError) {
      callbacks.onError(errorMessage);
    }
    throw new Error(errorMessage);
  }
};

/**
 * Caso de uso para obtener las transacciones de un estudiante
 */
export const getStudentTransactionsUseCase = async (
  id: string,
  callbacks?: StudentTransactionsCallbacks
): Promise<StudentTransactionDto[]> => {
  try {
    const response = await getStudentTransactions(id);
    const data = response.historial || [];
    
    if (callbacks?.onSuccess) {
      callbacks.onSuccess(data);
    }
    return data;
  } catch (error: any) {
    const errorMessage = error.message || 'Error al obtener transacciones del estudiante';
    if (callbacks?.onError) {
      callbacks.onError(errorMessage);
    }
    throw new Error(errorMessage);
  }
};

/**
 * Caso de uso para obtener los productos estrella de un estudiante
 */
export const getStudentTopProductsUseCase = async (
  id: string,
  callbacks?: StudentTopProductsCallbacks
): Promise<StudentTopProductDto[]> => {
  try {
    const response = await getStudentTopProducts(id);
    const data = response.top_productos || [];
    
    if (callbacks?.onSuccess) {
      callbacks.onSuccess(data);
    }
    return data;
  } catch (error: any) {
    const errorMessage = error.message || 'Error al obtener productos estrella del estudiante';
    if (callbacks?.onError) {
      callbacks.onError(errorMessage);
    }
    throw new Error(errorMessage);
  }
};

/**
 * Caso de uso para obtener el consumo clínico/nutricional de un estudiante
 */
export const getStudentNutritionUseCase = async (
  id: string,
  callbacks?: StudentNutritionCallbacks
): Promise<StudentNutritionProductDto[]> => {
  try {
    const response = await getStudentNutrition(id);
    const data = response.resumen_nutricional?.consumo || [];
    const periodo = response.resumen_nutricional?.periodo || 'Semanal';
    
    if (callbacks?.onSuccess) {
      callbacks.onSuccess(data, periodo);
    }
    return data;
  } catch (error: any) {
    const errorMessage = error.message || 'Error al obtener reporte nutricional';
    if (callbacks?.onError) {
      callbacks.onError(errorMessage);
    }
    throw new Error(errorMessage);
  }
};

/**
 * Caso de uso para obtener el análisis transaccional diario de un estudiante
 */
export const getStudentAnalysisUseCase = async (
  id: string,
  callbacks?: StudentAnalysisCallbacks
): Promise<StudentAnalysisDto[]> => {
  try {
    const response = await getStudentAnalysis(id);
    const data = response.analisis_transaccional || [];
    
    if (callbacks?.onSuccess) {
      callbacks.onSuccess(data);
    }
    return data;
  } catch (error: any) {
    const errorMessage = error.message || 'Error al obtener análisis transaccional';
    if (callbacks?.onError) {
      callbacks.onError(errorMessage);
    }
    throw new Error(errorMessage);
  }
};
