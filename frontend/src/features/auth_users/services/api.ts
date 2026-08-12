// features/auth_users/services/api.ts
import { apiClient } from '@/shared/api/client';
import type {
    LoginCredentials,
    RegisterData,
    AuthResponse,
    User
} from '../types';

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse & { refresh?: string }> => {
        const response = await apiClient.post('/auth/login/', credentials);
        return {
            token: response.data.access,
            refresh: response.data.refresh,
            user: response.data.user
        };
    },

    register: async (data: RegisterData): Promise<AuthResponse & { refresh?: string }> => {
        const response = await apiClient.post('/auth/register/', data);
        return {
            token: response.data.access,
            refresh: response.data.refresh,
            user: response.data.user
        };
    },

    logout: async (): Promise<void> => {
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get('/auth/profile/');
        return response.data;
    },

    refreshToken: async (): Promise<{ token: string }> => {
        const refresh = localStorage.getItem('refresh_token');
        const response = await apiClient.post('/auth/token/refresh/', { refresh });
        return {
            token: response.data.access
        };
    },

    forgotPassword: async (email: string): Promise<void> => {
        await apiClient.post('/auth/forgot-password/', { email });
    },

    resetPassword: async (token: string, newPassword: string): Promise<void> => {
        await apiClient.post('/auth/reset-password/', { token, newPassword });
    },
};