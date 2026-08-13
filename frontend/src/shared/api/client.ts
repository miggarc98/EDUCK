// shared/api/client.ts
import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Configuración base
const API_URL = (import.meta as any).env.VITE_API_URL || `${window.location.origin}/api`;



export const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar errores
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const isLoginRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('login');
        if (error.response?.status === 401 && !isLoginRequest) {
            // Token expirado o inválido (no redireccionar si es la petición de login)
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);