import { useState } from 'react';
import { Mail, Send, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/atoms/Button';
import { ForgotPasswordFormProps } from '../types';

export const ForgotPasswordForm = ({ onSubmit, onBack, loading, error: externalError }: ForgotPasswordFormProps) => {
    const [email, setEmail] = useState('');
    const [touched, setTouched] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);

        if (!email) return;

        await onSubmit({ email });
    };

    const isEmailValid = !touched || (email.length > 0 && email.includes('@'));

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Back Button */}
            <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a inicio de sesión</span>
            </button>

            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Recuperar Contraseña
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label
                        htmlFor="recovery-email"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                        Correo Electrónico
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            id="recovery-email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setTouched(true);
                            }}
                            onBlur={() => setTouched(true)}
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
                            aria-describedby={!isEmailValid ? "recovery-email-error" : undefined}
                        />
                        {!isEmailValid && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                        )}
                    </div>
                    {!isEmailValid && (
                        <p id="recovery-email-error" className="mt-1.5 text-xs text-red-500">
                            Ingresa un correo electrónico válido
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
                    disabled={loading || !email || !isEmailValid}
                    fullWidth
                    size="lg"
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {!loading && (
                        <>
                            <Send className="w-4 h-4" />
                            <span>Enviar enlace de recuperación</span>
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
};