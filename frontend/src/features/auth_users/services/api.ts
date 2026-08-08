// features/auth_users/services/api.ts
import { apiClient } from '@/shared/api/client';
import type {
    LoginCredentials,
    RegisterData,
    AuthResponse,
    User
} from '../types';

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Error al notificar cierre de sesión al servidor:', error);
        } finally {
            localStorage.clear();
            sessionStorage.clear();
        }
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    refreshToken: async (): Promise<{ token: string }> => {
        const response = await apiClient.post('/auth/refresh');
        return response.data;
    },

    forgotPassword: async (email: string): Promise<void> => {
        await apiClient.post('/auth/forgot-password', { email });
    },

    resetPassword: async (token: string, newPassword: string): Promise<void> => {
        await apiClient.post('/auth/reset-password', { token, newPassword });
    },
};