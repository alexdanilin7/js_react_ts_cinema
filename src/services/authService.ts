import { apiClient } from './apiClient';

export const login = (login: string, password: string) => {
  const formData = new FormData();
  formData.append('login', login);
  formData.append('password', password);

  return apiClient.post('/login', formData);
};