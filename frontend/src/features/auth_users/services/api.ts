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
        const response = await apiClient.post('/auth/login/', credentials);
        return {
            token: response.data.token || response.data.access,
            refresh: response.data.refresh,
            user: response.data.user,
            requires_2fa: response.data.requires_2fa,
            '2fa_token': response.data['2fa_token'],
            setup_required: response.data.setup_required,
            secret: response.data.secret,
            qr_code: response.data.qr_code,
        };
    },

    activate2FA: async (twoFactorToken: string, code: string): Promise<AuthResponse & { backup_codes?: string[] }> => {
        const response = await apiClient.post('/auth/2fa/activate/', {
            '2fa_token': twoFactorToken,
            code
        });
        return {
            token: response.data.token || response.data.access,
            refresh: response.data.refresh,
            user: response.data.user,
            backup_codes: response.data.backup_codes
        };
    },

    verify2FA: async (twoFactorToken: string, code: string): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/2fa/verify/', {
            '2fa_token': twoFactorToken,
            code
        });
        return {
            token: response.data.token || response.data.access,
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
            const refresh = localStorage.getItem('refresh_token');
            if (refresh) {
                await apiClient.post('/auth/logout/', { refresh });
            }
        } catch (error) {
            console.error('Error al cerrar sesión en el servidor:', error);
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