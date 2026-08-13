import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
            <div className="z-10 flex flex-col items-center text-center max-w-2xl w-full space-y-8">
                {/* 404 Image */}
                <div className="relative w-full max-w-md mx-auto animate-fade-in-up" style={{ animationDuration: '0.8s' }}>
                    <img
                        src="/404.png"
                        alt="404 No Encontrado"
                        className="w-full h-auto max-h-96 object-contain mix-blend-multiply"
                    />
                </div>

                <div className="space-y-4 animate-fade-in-up" style={{ animationDuration: '1s' }}>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                        ¡Ups! Te has perdido
                    </h1>
                    <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
                        La página que estás buscando no existe, ha sido movida o está temporalmente indisponible.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4 animate-fade-in-up" style={{ animationDuration: '1.2s' }}>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 transition-all duration-300 font-medium active:scale-95 shadow-sm cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Volver Atrás</span>
                    </button>
                    <Link
                        to="/dashboard"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium shadow-lg shadow-indigo-200 transition-all duration-300 active:scale-95"
                    >
                        <Home className="w-5 h-5" />
                        <span>Ir al Inicio</span>
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 left-0 right-0 text-center text-sm font-medium text-slate-400">
                Educk &copy; {new Date().getFullYear()}
            </div>
        </div>
    );
};
