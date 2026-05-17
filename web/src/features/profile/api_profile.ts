export const API_PROFILE = {
  GET_STUDENT_PROFILE: (id: string) => `/api/students/${id}/profile`,
  GET_STUDENT_TRANSACTIONS: (id: string) => `/api/students/${id}/transactions`,
  GET_STUDENT_TOP_PRODUCTS: (id: string) => `/api/students/${id}/top-products`,
  GET_STUDENT_NUTRITION: (id: string) => `/api/students/${id}/nutrition`,
  GET_STUDENT_ANALYSIS: (id: string) => `/api/students/${id}/analysis`,
};
