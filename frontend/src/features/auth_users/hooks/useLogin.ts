import { useState } from 'react';
import { LoginCredentials, AuthResponse } from '../types';
import { useAuthStore } from '@/store/auth.store';

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [twoFactorInfo, setTwoFactorInfo] = useState<{
        requires_2fa: boolean;
        '2fa_token'?: string;
        setup_required?: boolean;
        secret?: string;
        qr_code?: string;
    } | null>(null);

    const storeLogin = useAuthStore((state) => state.login);

    const login = async (credentials: LoginCredentials): Promise<AuthResponse | null> => {
        setLoading(true);
        setError(null);
        setTwoFactorInfo(null);

        try {
            const response = await storeLogin(credentials.email, credentials.password);
            if (response.requires_2fa) {
                setTwoFactorInfo({
                    requires_2fa: true,
                    '2fa_token': response['2fa_token'],
                    setup_required: response.setup_required,
                    secret: response.secret,
                    qr_code: response.qr_code,
                });
            }
            return response;
        } catch (err: any) {
            let message = 'Ocurrió un error inesperado al iniciar sesión.';
            
            if (err.response) {
                const status = err.response.status;
                const data = err.response.data;

                if (status === 401) {
                    if (data && data.detail) {
                        message = data.detail;
                    } else {
                        message = 'Correo electrónico o contraseña incorrectos.';
                    }
                } else if (status === 403) {
                    message = 'Tu cuenta no está activa o no tienes permisos para acceder. Contacta al administrador.';
                } else if (status === 400) {
                    if (data && data.non_field_errors) {
                        message = data.non_field_errors.join(', ');
                    } else {
                        message = 'Datos de ingreso inválidos. Por favor verifica los campos.';
                    }
                } else if (status >= 500) {
                    message = 'Error en el servidor. Por favor, inténtalo más tarde.';
                } else if (data && data.detail) {
                    message = data.detail;
                }
            } else if (err.code === 'ERR_NETWORK' || !err.response) {
                message = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
            } else if (err instanceof Error) {
                message = err.message;
            }
            
            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { login, loading, error, twoFactorInfo, setTwoFactorInfo };
};