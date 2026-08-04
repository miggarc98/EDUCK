import React from 'react';

interface LoadingOverlayProps {
    isLoading?: boolean;
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    isLoading = true,
    message = 'Cargando...',
}) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-6 shadow-xl">
                {/* Spinner animado en CSS/Tailwind */}
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                {message && (
                    <p className="text-sm font-medium text-gray-700">{message}</p>
                )}
            </div>
        </div>
    );
};

export default LoadingOverlay;