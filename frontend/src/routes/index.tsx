// routes/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginPage } from '@/features/auth_users/pages/LoginPage';
import { NotFoundPage } from '@/shared/pages/NotFoundPage';
import { UsersListPage } from '@/features/platform_admin';
import { SettingsPage } from '@/features/institution';
import { CoursesModule } from '@/features/curriculum';
import { StudentsDirectory } from '@/features/enrollment';
import { TeachersModule, ScheduleModule } from '@/features/academics';

// Componente temporal para dashboard
const DashboardPage = () => (
    <div className="p-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-4">Bienvenido a Educk</p>
    </div>
);

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
    },
    {
        path: '/',
        element: <AuthLayout />,
        children: [
            {
                path: 'login',
                element: <LoginPage />,
            },
        ],
    },
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                path: 'dashboard',
                element: <DashboardPage />,
            },
            {
                path: 'users',
                element: <UsersListPage />,
            },
            {
                path: 'courses',
                element: <CoursesModule />,
            },
            {
                path: 'students',
                element: <StudentsDirectory />,
            },
            {
                path: 'teachers',
                element: <TeachersModule />,
            },
            {
                path: 'schedule',
                element: <ScheduleModule />,
            },
            {
                path: 'settings',
                element: <SettingsPage />,
            },
        ],
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
]);