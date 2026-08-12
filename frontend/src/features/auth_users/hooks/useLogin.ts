import { useState } from 'react';
import { LoginCredentials } from '../types';
import { useAuthStore } from '@/store/auth.store';

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const storeLogin = useAuthStore((state) => state.login);

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            await storeLogin(credentials.email, credentials.password);
            return true;
        } catch (err: any) {
            let message = 'Error al iniciar sesión';
            if (err.response && err.response.data) {
                if (err.response.data.detail) {
                    message = err.response.data.detail;
                } else if (err.response.data.non_field_errors) {
                    message = err.response.data.non_field_errors.join(', ');
                }
            } else if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { login, loading, error };
};