// Configuración base para las peticiones HTTP de BioFood
const API_BASE_URL = 'http://localhost:8080';

// Interfaz para el cliente HTTP
interface HttpClient {
  get<T>(url: string): Promise<T>;
}

// Implementación del cliente HTTP usando fetch (simplificado sin autenticación como indica la especificación de BioFood)
class ApiClient implements HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errorMessage = errData.error;
          }
        } catch {
          // No JSON error body
        }
        throw new Error(errorMessage);
      }
      
      if (response.status === 204) {
        return {} as T;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async get<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'GET' });
  }
}

// Instancia del cliente HTTP de BioFood
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
