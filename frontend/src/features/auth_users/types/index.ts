// features/auth_users/types/index.ts
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'teacher' | 'student' | 'institution_admin';
    institutionId?: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: User['role'];
    institutionId?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    refreshToken?: string;
}