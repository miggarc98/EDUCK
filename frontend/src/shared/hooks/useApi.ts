// shared/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';
import type { ApiResponse } from '../types/api.types';

export function useApi<T = any>() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<T | null>(null);

    const execute = useCallback(async (endpoint: string, options?: any) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.request<ApiResponse<T>>({
                url: endpoint,
                ...options,
            });

            setData(response.data.data);
            return response.data;
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Error desconocido';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, execute };
}

// shared/hooks/useToast.ts
import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export function useToast() {
    const [toasts, setToasts] = useState<Array<{
        id: string;
        message: string;
        type: ToastType;
    }>>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    return { toasts, showToast };
}