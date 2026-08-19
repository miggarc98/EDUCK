import { Bell, Search, UserCircle, Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-20 glass border-b border-surface-200 flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center">
        <button className="md:hidden mr-4 text-surface-800 hover:text-brand-600">
          <Menu size={24} />
        </button>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar estudiantes, reportes..." 
            className="pl-10 pr-4 py-2 bg-surface-100 border-none rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-surface-800 hover:bg-surface-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-surface-200"></div>
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-surface-100 p-2 rounded-lg transition-colors">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-surface-900 leading-tight">Admin Demo</p>
            <p className="text-xs text-surface-500">Coordinador</p>
          </div>
          <UserCircle size={36} className="text-brand-600" />
        </div>
      </div>
    </header>
  );
}
