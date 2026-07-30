// layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold">Educk</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="text-gray-700 hover:text-gray-900">Perfil</button>
                            <button className="text-gray-700 hover:text-gray-900">Cerrar sesión</button>
                        </div>
                    </div>
                </div>
            </nav>
            <main>
                <Outlet />
            </main>
        </div>
    );
};