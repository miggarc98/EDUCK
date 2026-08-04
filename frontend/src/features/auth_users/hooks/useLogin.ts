import { useState } from 'react';
import { LoginCredentials } from '../types';

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            // Aquí iría la llamada real a la API
            // await authService.login(credentials);

            // Simulación
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simular validación
            if (!credentials.email.includes('@')) {
                throw new Error('Correo electrónico inválido');
            }

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { login, loading, error };
};