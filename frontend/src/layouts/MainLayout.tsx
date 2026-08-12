// layouts/MainLayout.tsx
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '@/shared/components/Sidebar';
import { useLogout } from '@/features/auth_users/hooks/useLogout';

export const MainLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useLogout();

    // Determinar la vista actual basada en la ruta activa o por defecto 'dashboard'
    const currentPath = location.pathname.substring(1) || 'dashboard';
    const currentView = currentPath.split('/')[0];

    const handleViewChange = (view: string) => {
        navigate(`/${view}`);
    };

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden">
            <Sidebar
                currentView={currentView}
                setCurrentView={handleViewChange}
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed((prev) => !prev)}
                onLogout={logout}
            />
            <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
                <Outlet />
            </main>
        </div>
    );
};