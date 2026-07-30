// shared/hooks/useToast.ts
import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback(
        (message: string, type: ToastType = 'info', duration: number = 3000) => {
            const id = Date.now().toString();
            const newToast: Toast = { id, message, type, duration };

            setToasts((prev) => [...prev, newToast]);

            // Auto-eliminar después de la duración
            setTimeout(() => {
                setToasts((prev) => prev.filter((toast) => toast.id !== id));
            }, duration);
        },
        []
    );

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return {
        toasts,
        showToast,
        removeToast,
        clearToasts,
    };
}