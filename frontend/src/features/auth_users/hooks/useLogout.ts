import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';

export const useLogout = () => {
    const [loading, setLoading] = useState(false);
    const storeLogout = useAuthStore((state) => state.logout);

    const logout = async () => {
        setLoading(true);
        try {
            await storeLogout();
        } finally {
            setLoading(false);
            window.location.href = '/login';
        }
    };

    return { logout, loading };
};
