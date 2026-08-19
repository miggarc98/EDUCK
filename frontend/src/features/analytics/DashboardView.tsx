import { useEffect, useState } from 'react';
import { Users, GraduationCap, ShieldAlert, BookOpen } from 'lucide-react';
import { getDashboardSummary } from '../../shared/api/dashboard.service';

interface DashboardData {
  students: { total_active: number };
  teachers: { total_active: number };
  behavior: { open_cases: number; cases_this_month: number };
  academics: { active_classes: number };
}

export default function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getDashboardSummary();
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Tablero de Control</h1>
          <p className="text-surface-500 mt-1">Resumen general de la institución educativa</p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer">
          Descargar Reporte
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI Cards */}
        <div className="glass p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-500">Estudiantes Activos</p>
              <h3 className="text-2xl font-bold text-surface-900">{data?.students.total_active}</h3>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-500">Cuerpo Docente</p>
              <h3 className="text-2xl font-bold text-surface-900">{data?.teachers.total_active}</h3>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-500">Clases Programadas</p>
              <h3 className="text-2xl font-bold text-surface-900">{data?.academics.active_classes}</h3>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl shadow-sm border-l-4 border-l-red-500 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10 text-red-500">
            <ShieldAlert size={100} />
          </div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-500">Casos Abiertos</p>
              <h3 className="text-2xl font-bold text-red-600">{data?.behavior.open_cases}</h3>
              <p className="text-xs text-red-500 mt-1 font-medium">{data?.behavior.cases_this_month} nuevos este mes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 glass p-6 rounded-2xl shadow-sm min-h-[300px]">
          <h3 className="font-semibold text-lg text-surface-900 mb-4">Actividad Reciente</h3>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-surface-200 rounded-lg">
             <p className="text-surface-500">El gráfico de barras se cargará aquí</p>
          </div>
        </div>
        
        <div className="glass p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-lg text-surface-900 mb-4">Alertas Rápidas</h3>
          <div className="space-y-4">
             <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg flex items-start space-x-3">
               <ShieldAlert size={16} className="text-orange-500 mt-0.5" />
               <div>
                 <p className="text-sm font-medium text-surface-900">3 Faltas Tipo II Reportadas</p>
                 <p className="text-xs text-surface-500">Grado 10-A requiere atención</p>
               </div>
             </div>
             <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start space-x-3">
               <Users size={16} className="text-blue-500 mt-0.5" />
               <div>
                 <p className="text-sm font-medium text-surface-900">Citación de padres pendiente</p>
                 <p className="text-xs text-surface-500">Acudiente de Luis Mendoza</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
