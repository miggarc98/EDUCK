import { useState } from 'react';
import { PasswordRecoveryData } from '../types';

export const usePasswordRecovery = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const recoverPassword = async (data: PasswordRecoveryData): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            // Aquí iría la llamada real a la API
            // await authService.recoverPassword(data.email);

            // Simulación
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Validación básica
            if (!data.email.includes('@')) {
                throw new Error('Correo electrónico inválido');
            }

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al enviar el correo de recuperación');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { recoverPassword, loading, error };
};