import { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/atoms/Button';
import { LoginFormProps } from '../types';

export const LoginForm = ({ onSubmit, onForgotPassword, loading, error: externalError }: LoginFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [touched, setTouched] = useState({ email: false, password: false });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({ email: true, password: true });

        if (!email || !password) return;

        await onSubmit({ email, password });
    };

    const isEmailValid = !touched.email || (email.length > 0 && email.includes('@'));
    const isPasswordValid = !touched.password || password.length >= 6;

    return (
        <>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Iniciar Sesión
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Ingresa tus credenciales para acceder a tu cuenta.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                        Correo Electrónico
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setTouched(prev => ({ ...prev, email: true }));
                            }}
                            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                            placeholder="admin@colegio.edu.co"
                            disabled={loading}
                            className={`
                w-full pl-10 pr-4 py-2.5 
                bg-slate-50 dark:bg-slate-800/50 
                border rounded-xl text-sm 
                focus:outline-none focus:ring-2 
                transition-all 
                text-slate-800 dark:text-slate-200 
                placeholder:text-slate-400
                disabled:opacity-60 disabled:cursor-not-allowed
                ${!isEmailValid
                                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                                    : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500'
                                }
              `}
                            required
                            aria-invalid={!isEmailValid}
                            aria-describedby={!isEmailValid ? "email-error" : undefined}
                        />
                        {!isEmailValid && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                        )}
                    </div>
                    {!isEmailValid && (
                        <p id="email-error" className="mt-1.5 text-xs text-red-500">
                            Ingresa un correo electrónico válido
                        </p>
                    )}
                </div>

                {/* Password Input */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Contraseña
                        </label>
                        <button
                            type="button"
                            onClick={onForgotPassword}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setTouched(prev => ({ ...prev, password: true }));
                            }}
                            onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                            placeholder="••••••••"
                            disabled={loading}
                            className={`
                w-full pl-10 pr-4 py-2.5 
                bg-slate-50 dark:bg-slate-800/50 
                border rounded-xl text-sm 
                focus:outline-none focus:ring-2 
                transition-all 
                text-slate-800 dark:text-slate-200 
                placeholder:text-slate-400
                disabled:opacity-60 disabled:cursor-not-allowed
                ${!isPasswordValid
                                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                                    : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500'
                                }
              `}
                            required
                            minLength={6}
                            aria-invalid={!isPasswordValid}
                            aria-describedby={!isPasswordValid ? "password-error" : undefined}
                        />
                        {!isPasswordValid && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                        )}
                    </div>
                    {!isPasswordValid && (
                        <p id="password-error" className="mt-1.5 text-xs text-red-500">
                            La contraseña debe tener al menos 6 caracteres
                        </p>
                    )}
                </div>

                {/* Error Message */}
                {externalError && (
                    <div
                        className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2"
                        role="alert"
                    >
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-300">
                            {externalError}
                        </p>
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    loading={loading}
                    disabled={loading || (!email || !password)}
                    fullWidth
                    size="lg"
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {!loading && (
                        <>
                            <LogIn className="w-4 h-4" />
                            <span>Ingresar al Sistema</span>
                        </>
                    )}
                </Button>
            </form>
        </>
    );
};