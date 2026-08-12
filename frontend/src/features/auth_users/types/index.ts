export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'coordinator' | 'teacher' | 'student' | 'parent';
    is_active?: boolean;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface RegisterData {
    email: string;
    password?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    [key: string]: any;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface PasswordRecoveryData {
    email: string;
}

export interface LoginFormProps {
    onSubmit: (credentials: LoginCredentials) => Promise<void>;
    onForgotPassword: () => void;
    loading?: boolean;
    error?: string | null;
}

export interface ForgotPasswordFormProps {
    onSubmit: (data: PasswordRecoveryData) => Promise<void>;
    onBack: () => void;
    loading?: boolean;
    error?: string | null;
}

export interface RecoverySentMessageProps {
    email: string;
    onBack: () => void;
}

export type AuthView = 'login' | 'forgot_password' | 'recovery_sent';