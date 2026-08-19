import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from '@/shared/components/Sidebar';
import { Topbar } from '@/shared/components/Topbar';
import { useLogout } from '@/features/auth_users/hooks/useLogout';
import { useAuthStore } from '@/store/auth.store';

export const MainLayout = () => {
    const { isAuthenticated, checkAuth, isCheckingAuth } = useAuthStore();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useLogout();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Determinar la vista actual basada en la ruta activa o por defecto 'dashboard'
    const currentPath = location.pathname.substring(1) || 'dashboard';
    const currentView = currentPath.split('/')[0];

    const handleViewChange = (view: string) => {
        navigate(`/${view}`);
    };

    if (isCheckingAuth) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
                <div className="text-gray-400">Cargando...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
            <Sidebar
                currentView={currentView}
                setCurrentView={handleViewChange}
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed((prev) => !prev)}
                onLogout={logout}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar onMenuClick={() => setIsCollapsed((prev) => !prev)} />
                <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 transition-colors">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};