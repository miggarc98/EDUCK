import { Search, Bell, User, Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuthStore } from '@/store/auth.store';

interface TopbarProps {
  onMenuClick?: () => void;
}

const roleMap: Record<string, string> = {
  superadmin: 'Superadministrador/a',
  admin: 'Administrador/a',
  coordinator: 'Coordinador/a',
  teacher: 'Docente',
  student: 'Estudiante',
  parent: 'Acudiente',
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();

  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : 'Usuario';
  const roleName = user ? (roleMap[user.role] || user.role) : 'Invitado';

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        {onMenuClick && (
          <button 
            onClick={onMenuClick} 
            className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        
        <div className="flex-1 max-w-xl relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar estudiantes, docentes o reportes..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 pl-4">
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="relative p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        
        <button className="relative p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors hidden sm:block">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
        
        <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
        
        <button className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 flex items-center justify-center overflow-hidden border border-blue-200 dark:border-blue-800/50 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">{fullName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{roleName}</p>
          </div>
        </button>
      </div>
    </header>
  );
}
