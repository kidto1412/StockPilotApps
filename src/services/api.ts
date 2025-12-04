// src/api/client.ts
import { useAuthStore } from '@/stores/auth.store';
import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@env';

const apiUrl = API_URL;

const api = axios.create({
  baseURL: apiUrl,
  timeout: 15000,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  console.log(apiUrl);
  console.log(token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,

  async error => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || 'Terjadi kesalahan';
    // --- 401 Unauthorized ---
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();

      logout();
    }

    return Promise.reject({ status, message, originalError: error });
  },
);

export default api;
