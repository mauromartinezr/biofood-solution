export const API_STUDENTS = {
  GET_STUDENTS_SUMMARY: '/api/students/summary',
  GET_SCHOOLS_CONSUMPTION: '/api/schools/consumption',
  GET_RECHARGE_TREND: '/api/recharge/trend',
  GET_STUDENTS_DIRECTORY: (page: number = 1, limit: number = 10) => `/api/students/directory?page=${page}&limit=${limit}`,
};
