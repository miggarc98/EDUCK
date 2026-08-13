import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ShieldAlert,
  FileBarChart,
  MessageSquare,
  Settings,
  LogOut,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  FileQuestion,
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  onLogout?: () => void;
}

export function Sidebar({
  currentView,
  setCurrentView,
  isCollapsed = false,
  toggleCollapse,
  onLogout,
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Tablero" },
    { id: "courses", icon: BookOpen, label: "Cursos" },
    { id: "schedule", icon: Calendar, label: "Horarios" },
    { id: "students", icon: Users, label: "Estudiantes" },
    { id: "teachers", icon: GraduationCap, label: "Docentes" },
    { id: "discipline", icon: ShieldAlert, label: "Convivencia" },
    { id: "reporting", icon: FileBarChart, label: "Reportes" },
    { id: "communications", icon: MessageSquare, label: "Comunicaciones" },
    { id: "settings", icon: Settings, label: "Configuración" },
    { id: "mobile", icon: Smartphone, label: "Modo Offline (App)" },
    { id: "test404", icon: FileQuestion, label: "Test 404" },
  ];

  return (
    <aside
      className={`h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 relative transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"
        }`}
    >
      {toggleCollapse && (
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-8 bg-slate-800 text-slate-300 rounded-full p-1 border border-slate-700 hover:bg-slate-700 z-20 hidden md:flex "
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      )}

      <div
        className={`p-6 flex items-center ${isCollapsed ? "justify-center px-4" : "gap-3"}`}
      >
        <img
          src="/LogoSinTexto.png"
          alt="Educk Icon"
          className={`rounded-xl object-cover ${isCollapsed ? "w-8 h-8" : "w-10 h-10"}`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove(
              "hidden",
            );
          }}
        />
        <div
          className={`hidden rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-xl ${isCollapsed ? "w-8 h-8" : "w-10 h-10"}`}
        >
          E
        </div>
        {!isCollapsed && (
          <span className="text-white text-2xl font-bold tracking-tight">
            Educk
          </span>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {!isCollapsed && (
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
            Menú Principal
          </div>
        )}
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center rounded-lg transition-colors ${isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"} ${currentView === item.id
              ? "bg-blue-600 text-white shadow-sm"
              : "hover:bg-slate-800 hover:text-white"
              }`}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className={isCollapsed ? "w-6 h-6" : "w-5 h-5"} />
            {!isCollapsed && (
              <span className="font-medium text-left flex-1">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      <div
        className={`p-4 border-t border-slate-800 space-y-1 ${isCollapsed ? "flex flex-col items-center" : ""}`}
      >
        <button
          onClick={() => setCurrentView("settings")}
          className={`w-full flex items-center rounded-lg hover:bg-slate-800 hover:text-white transition-colors ${isCollapsed ? "p-3 justify-center" : "gap-3 px-3 py-2.5"}`}
          title={isCollapsed ? "Configuración" : undefined}
        >
          <Settings className={isCollapsed ? "w-6 h-6" : "w-5 h-5"} />
          {!isCollapsed && <span className="font-medium">Configuración</span>}
        </button>
        <button
          onClick={onLogout}
          className={`w-full flex items-center rounded-lg hover:bg-slate-800 text-rose-400 hover:text-rose-300 transition-colors ${isCollapsed ? "p-3 justify-center" : "gap-3 px-3 py-2.5"}`}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
        >
          <LogOut className={isCollapsed ? "w-6 h-6" : "w-5 h-5"} />
          {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
