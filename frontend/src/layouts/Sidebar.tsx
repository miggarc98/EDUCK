import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldAlert, MessageSquare, BookOpen } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Convivencia', path: '/convivencia', icon: <ShieldAlert size={20} /> },
    { name: 'Comunicaciones', path: '/comunicaciones', icon: <MessageSquare size={20} /> },
    { name: 'Académico', path: '/academico', icon: <BookOpen size={20} /> },
    { name: 'Estudiantes', path: '/estudiantes', icon: <Users size={20} /> },
  ];

  return (
    <aside className="w-64 glass shadow-lg hidden md:flex flex-col z-10 border-r border-surface-200">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-xl shadow-md">
          E
        </div>
        <span className="font-bold text-2xl tracking-tight text-brand-900">Educk</span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-surface-800 hover:bg-surface-100 hover:text-brand-600'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-surface-200">
        <div className="glass rounded-lg p-4 text-sm text-surface-800 flex items-center space-x-3">
           <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
             IE
           </div>
           <div>
             <p className="font-semibold text-xs uppercase text-surface-500">Institución</p>
             <p className="font-medium truncate max-w-[120px]">Liceo Colombia</p>
           </div>
        </div>
      </div>
    </aside>
  );
}
