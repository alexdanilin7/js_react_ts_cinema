const API_BASE = 'https://shfe-diplom.neto-server.ru';

interface ApiResponse<T> {
  success: boolean;
  result: T;
  error?: string;
}

export const apiClient = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message || 'Network error',
        result: null as unknown as T,
      };
    }
  },

  async post<T>(
    endpoint: string,
    body: FormData | Record<string, any>
  ): Promise<ApiResponse<T>> {
    const isFormData = body instanceof FormData;

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        body: isFormData ? body : JSON.stringify(body),
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message || 'Network error',
        result: null as unknown as T,
      };
    }
  },

   async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message || 'Network error',
        result: null as unknown as T,
      };
    }
  }
};