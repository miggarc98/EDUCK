import { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Briefcase, Mail, Plus, X, GraduationCap } from 'lucide-react';
import { TeacherProfile } from './TeacherProfile';
import type { Teacher } from '../types';
import { academicsApi } from '../services/api';
import { curriculumApi } from '../../curriculum/services/api';
import { institutionApi } from '../../institution/services/api';
import type { Area } from '../../curriculum/types';
import type { InstitutionSettingData } from '../../institution/types';

export function TeachersModule() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  
  const [areasList, setAreasList] = useState<Area[]>([]);
  const [settings, setSettings] = useState<InstitutionSettingData | null>(null);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  // New Teacher Modal
  const [isAdding, setIsAdding] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newLoad, setNewLoad] = useState(22);
  const [newStatus, setNewStatus] = useState<'active' | 'on_leave'>('active');
  const [newAdditionalAreas, setNewAdditionalAreas] = useState<string[]>([]);
  const [newMaxHours, setNewMaxHours] = useState(22);
  const [newAvailableShifts, setNewAvailableShifts] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const [data, areasData, settingsData] = await Promise.all([
        academicsApi.getTeachers(),
        curriculumApi.getAreas(),
        institutionApi.getSettings()
      ]);
      setTeachers(data);
      setAreasList(areasData);
      setSettings(settingsData);
      setNewMaxHours(settingsData?.default_teacher_max_hours || 22);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newFirstName || !newLastName) {
      setModalError('Por favor complete los campos obligatorios (Nombres, Apellidos y Correo).');
      return;
    }

    setIsSaving(true);
    setModalError(null);
    try {
      const created = await academicsApi.createTeacher({
        first_name: newFirstName,
        last_name: newLastName,
        email: newEmail,
        area: newArea,
        load: Number(newLoad),
        status: newStatus,
        additional_areas: newAdditionalAreas,
        max_hours: newMaxHours,
        available_shifts: newAvailableShifts,
        password: 'Educk2026!' // Default password for new teachers
      });
      setTeachers((prev) => [...prev, created]);
      setIsAdding(false);
      resetNewForm();
    } catch (err: any) {
      console.error(err);
      setModalError('Error al crear el docente. Puede que el correo electrónico ya esté registrado.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetNewForm = () => {
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');
    setNewArea('');
    setNewLoad(22);
    setNewStatus('active');
    setNewAdditionalAreas([]);
    setNewMaxHours(settings?.default_teacher_max_hours || 22);
    setNewAvailableShifts([]);
    setModalError(null);
  };

  const handleUpdateTeacher = (updated: Teacher) => {
    setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTeacher(updated);
  };

  const handleDeleteTeacher = (id: number) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    setSelectedTeacher(null);
  };

  // Derived filter list
  const filteredTeachers = teachers.filter((teacher) => {
    const fullName = `${teacher.first_name} ${teacher.last_name}`.toLowerCase();
    const searchMatch =
      fullName.includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.area && teacher.area.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (teacher.employee_id && teacher.employee_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const areaMatch = selectedArea === '' || teacher.area === selectedArea;

    return searchMatch && areaMatch;
  });

  // Get unique areas for filter
  const uniqueAreas = Array.from(
    new Set(teachers.map((t) => t.area).filter(Boolean))
  );

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      {selectedTeacher && (
        <TeacherProfile
          teacher={selectedTeacher}
          onBack={() => setSelectedTeacher(null)}
          onUpdate={handleUpdateTeacher}
          onDelete={handleDeleteTeacher}
          areasList={areasList}
          settings={settings}
        />
      )}

      {/* Main Listing Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-emerald-600" />
            Planta Docente
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gestión de profesores, especialidades académicas y asignación de carga de horas.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm w-fit flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Nuevo Docente
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, correo, área o ID..." 
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 dark:text-slate-100"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowAreaDropdown(!showAreaDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors w-full sm:w-auto justify-between"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                {selectedArea ? `Área: ${selectedArea}` : 'Filtrar por Área'}
              </span>
            </button>
            {showAreaDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-20 overflow-hidden">
                <button
                  onClick={() => { setSelectedArea(''); setShowAreaDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  Todas las Áreas
                </button>
                {uniqueAreas.map((area: any) => (
                  <button
                    key={area}
                    onClick={() => { setSelectedArea(area); setShowAreaDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    {area}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-450">
            Cargando docentes...
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-450">
            No se encontraron docentes.
          </div>
        ) : (
          <>
            {/* Mobile View (Cards) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTeachers.map((teacher) => (
                <div 
                  key={teacher.id} 
                  onClick={() => setSelectedTeacher(teacher)}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm border border-emerald-200 dark:border-emerald-800">
                        {teacher.first_name ? teacher.first_name.charAt(0) : '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                          {teacher.first_name} {teacher.last_name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-450">{teacher.employee_id || 'DOC-000'}</p>
                      </div>
                    </div>
                    <div>
                      {teacher.status === 'active' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          En Licencia
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300 mb-2">
                    <div>
                      <span className="text-xs text-slate-450 block mb-0.5">Área / Especialidad</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-350 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-200 dark:border-slate-750 inline-block">
                        {teacher.area || 'Sin especificar'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-450 block mb-0.5">Carga Académica</span>
                      <div className="flex items-center gap-1 text-xs">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>{teacher.load || 0} hrs/sem</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs text-slate-650 dark:text-slate-350">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[200px]">{teacher.email}</span>
                    </div>
                    <MoreHorizontal className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Área / Especialidad</th>
                    <th className="px-6 py-4">Carga Académica</th>
                    <th className="px-6 py-4">Contacto</th>
                    <th className="px-6 py-4 text-center">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTeachers.map((teacher) => (
                    <tr 
                      key={teacher.id} 
                      onClick={() => setSelectedTeacher(teacher)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-450">{teacher.employee_id || 'DOC-000'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                            {teacher.first_name ? teacher.first_name.charAt(0) : '?'}
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                            {teacher.first_name} {teacher.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 bg-slate-105 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                          {teacher.area || 'Sin especificar'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-655 dark:text-slate-300">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          <span>{teacher.load || 0} hrs/sem</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-655 dark:text-slate-300">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="truncate max-w-[180px]" title={teacher.email}>{teacher.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {teacher.status === 'active' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-850">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-850">
                            En Licencia
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 rounded transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Creation Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Registrar Nuevo Docente</h3>
              <button 
                onClick={() => { setIsAdding(false); resetNewForm(); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTeacher} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-400 rounded-lg text-xs font-semibold">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase mb-1.5">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-slate-100"
                    placeholder="Carmen"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase mb-1.5">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-slate-100"
                    placeholder="Ramírez"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase mb-1.5">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-slate-100"
                  placeholder="carmen.r@educk.edu.co"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase mb-1.5">Área / Especialidad</label>
                  <input
                    type="text"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-slate-100"
                    placeholder="Matemáticas"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase mb-1.5">Carga Horaria (hrs/sem)</label>
                  <input
                    type="number"
                    value={newLoad}
                    onChange={(e) => setNewLoad(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase mb-1.5">Estado</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-slate-100"
                >
                  <option value="active">Activo</option>
                  <option value="on_leave">En Licencia</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); resetNewForm(); }}
                  disabled={isSaving}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Creando...' : 'Crear Docente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
