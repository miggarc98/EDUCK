export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'superadmin' | 'admin' | 'coordinator' | 'teacher' | 'student' | 'parent';
    is_active?: boolean;
    two_factor_enabled?: boolean;
    current_course?: number | null;
    current_degree?: string | null;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface AuthResponse {
    token?: string;
    refresh?: string;
    user?: User;
    requires_2fa?: boolean;
    '2fa_token'?: string;
    setup_required?: boolean;
    secret?: string;
    qr_code?: string;
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