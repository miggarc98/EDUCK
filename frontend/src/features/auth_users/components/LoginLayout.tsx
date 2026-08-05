import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { RecoverySentMessage } from './RecoverySentMessage';
import { LoginBranding } from './LoginBranding';
import { useLogin } from '../hooks/useLogin';
import { usePasswordRecovery } from '../hooks/usePasswordRecovery';
import { LoadingOverlay } from '@/shared/components/molecules/LoadingOverlay';
import { AuthView } from '../types';
import { useNavigate } from 'react-router-dom';

export const LoginLayout = () => {
    const [currentView, setCurrentView] = useState<AuthView>('login');
    const [recoveryEmail, setRecoveryEmail] = useState('');

    const { login, loading: loginLoading, error: loginError } = useLogin();
    const { recoverPassword, loading: recoveryLoading, error: recoveryError } = usePasswordRecovery();

    const isLoading = loginLoading || recoveryLoading;

    const navigate = useNavigate();

    const handleLogin = async (credentials: { email: string; password: string }) => {
        const success = await login(credentials);

        if (success) {
            navigate('/dashboard');
            console.log('Login exitoso');
        }
    };

    const handlePasswordRecovery = async (data: { email: string }) => {
        const success = await recoverPassword(data);

        if (success) {
            setRecoveryEmail(data.email);
            setCurrentView('recovery_sent');
        }
    };

    const handleBackToLogin = () => {
        setCurrentView('login');
        setRecoveryEmail('');
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-50 dark:bg-slate-950">
            {isLoading && <LoadingOverlay message="Autenticando usuario..." />}

            {/* Abstract Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="absolute left-10 top-10 -z-10 h-[300px] w-[300px] rounded-full bg-blue-500 opacity-20 blur-[100px]" />
                <div className="absolute right-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-500 opacity-20 blur-[120px]" />
            </div>

            {/* Main Card */}
            <div className="max-w-4xl w-full relative z-10 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                <LoginBranding />

                {/* Right Column: Dynamic Content */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-slate-900">
                    <div className="max-w-sm w-full mx-auto">
                        {/* Conditional Rendering based on view */}
                        {currentView === 'login' && (
                            <LoginForm
                                onSubmit={handleLogin}
                                onForgotPassword={() => setCurrentView('forgot_password')}
                                loading={loginLoading}
                                error={loginError}
                            />
                        )}

                        {currentView === 'forgot_password' && (
                            <ForgotPasswordForm
                                onSubmit={handlePasswordRecovery}
                                onBack={handleBackToLogin}
                                loading={recoveryLoading}
                                error={recoveryError}
                            />
                        )}

                        {currentView === 'recovery_sent' && (
                            <RecoverySentMessage
                                email={recoveryEmail}
                                onBack={handleBackToLogin}
                            />
                        )}

                        {/* Footer */}
                        <div className="mt-8 text-center flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Sistema asegurado. Tu información está protegida.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};