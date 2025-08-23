import { apiClient } from './apiClient';


interface AuthResponse {
  success: boolean;
  error?: string;
}
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken');
};


export const login = (login: string, password: string) => {
  const formData = new FormData();
  formData.append('login', login);
  formData.append('password', password);

  return apiClient.post('/login', formData);
};