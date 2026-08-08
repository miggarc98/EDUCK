import { useState } from 'react';
import { authApi } from '../services/api';

export const useLogout = () => {
    const [loading, setLoading] = useState(false);

    const logout = async () => {
        setLoading(true);
        try {
            await authApi.logout();
        } finally {
            // Asegurar la limpieza inmediata de almacenamiento local y de sesión
            localStorage.clear();
            sessionStorage.clear();
            setLoading(false);
            // Redireccionar al usuario a la página de login / inicio
            window.location.href = '/login';
        }
    };

    return { logout, loading };
};
