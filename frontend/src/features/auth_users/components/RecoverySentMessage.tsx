import { CheckCircle, ArrowLeft } from 'lucide-react';
import { RecoverySentMessageProps } from '../types';

export const RecoverySentMessage = ({ email, onBack }: RecoverySentMessageProps) => {
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>

            {/* Message */}
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                Correo Enviado
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Hemos enviado un enlace de recuperación a{' '}
                <strong className="text-slate-700 dark:text-slate-300">{email}</strong>
                . Revisa tu bandeja de entrada o la carpeta de spam.
            </p>

            {/* Back Button */}
            <button
                type="button"
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a inicio de sesión</span>
            </button>
        </div>
    );
};