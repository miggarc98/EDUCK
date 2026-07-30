// features/auth_users/components/LoginForm.tsx
import { useState } from 'react';
import { Input } from '@/shared/components/atoms/Input';
import { Button } from '@/shared/components/atoms/Button';

interface LoginFormProps {
    onSubmit: (email: string, password: string) => Promise<void>;
    loading?: boolean;
}

export const LoginForm = ({ onSubmit, loading }: LoginFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await onSubmit(email, password);
        } catch (err) {
            setError('Error al iniciar sesión');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                type="email"
                label="Correo electrónico"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
            />

            <Input
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
            />

            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}

            <Button
                type="submit"
                loading={loading}
                fullWidth
            >
                Iniciar Sesión
            </Button>

            <div className="text-sm text-center">
                <a href="/auth/register" className="text-blue-600 hover:underline">
                    ¿No tienes cuenta? Regístrate
                </a>
            </div>
        </form>
    );
};