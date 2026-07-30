// features/auth_users/pages/LoginPage.tsx
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { LoginForm } from '../components/LoginForm';
import { useToast } from '@/shared/hooks/useToast';

export const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const { showToast } = useToast();

    const handleLogin = async (email: string, password: string) => {
        setLoading(true);
        try {
            await login(email, password);
            showToast('Inicio de sesión exitoso', 'success');
            // Redirigir al dashboard
            window.location.href = '/dashboard';
        } catch (error) {
            showToast('Credenciales incorrectas', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Educk</h2>
                    <p className="mt-2 text-gray-600">Inicia sesión en tu cuenta</p>
                </div>

                <LoginForm
                    onSubmit={handleLogin}
                    loading={loading}
                />
            </div>
        </div>
    );
};