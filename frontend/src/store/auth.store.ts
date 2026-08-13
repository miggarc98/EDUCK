// store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '@/features/auth_users/types';
import { authApi } from '@/features/auth_users/services/api';

interface AuthStore extends AuthState {
    tenantHost: string | null;
    isCheckingAuth: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            tenantHost: null,
            isCheckingAuth: true,

            login: async (email: string, password: string) => {
                set({ isLoading: true });
                try {
                    const response = await authApi.login({ email, password });
                    localStorage.setItem('auth_token', response.token);
                    if (response.refresh) {
                        localStorage.setItem('refresh_token', response.refresh);
                    }
                    set({
                        user: response.user,
                        isAuthenticated: true,
                        isLoading: false,
                        tenantHost: window.location.hostname
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            register: async (data: any) => {
                set({ isLoading: true });
                try {
                    const response = await authApi.register(data);
                    localStorage.setItem('auth_token', response.token);
                    if (response.refresh) {
                        localStorage.setItem('refresh_token', response.refresh);
                    }
                    set({
                        user: response.user,
                        isAuthenticated: true,
                        isLoading: false,
                        tenantHost: window.location.hostname
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await authApi.logout();
                } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                } finally {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('refresh_token');
                    set({ user: null, isAuthenticated: false, isLoading: false, tenantHost: null });
                }
            },

            checkAuth: async () => {
                const currentHost = window.location.hostname;
                const storedHost = get().tenantHost;

                if (storedHost && storedHost !== currentHost) {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('refresh_token');
                    set({ user: null, isAuthenticated: false, tenantHost: currentHost, isCheckingAuth: false });
                    return;
                }

                const token = localStorage.getItem('auth_token');
                if (!token) {
                    set({ isAuthenticated: false, user: null, tenantHost: currentHost, isCheckingAuth: false });
                    return;
                }

                set({ isCheckingAuth: true });
                try {
                    const user = await authApi.getCurrentUser();
                    set({ user, isAuthenticated: true, isCheckingAuth: false, tenantHost: currentHost });
                } catch (error) {
                    localStorage.removeItem('auth_token');
                    set({ user: null, isAuthenticated: false, isCheckingAuth: false, tenantHost: currentHost });
                }
            },

            updateUser: (user: User) => {
                set({ user });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                tenantHost: state.tenantHost
            }),
        }
    )
);