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