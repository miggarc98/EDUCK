import { useState } from 'react';
import { ArrowLeft, User, Mail, BookOpen, Briefcase, Trash2, Edit2, Save, X } from 'lucide-react';
import type { Teacher } from '../types';
import { academicsApi } from '../services/api';

interface TeacherProfileProps {
  teacher: Teacher;
  onBack: () => void;
  onUpdate: (updated: Teacher) => void;
  onDelete: (id: number) => void;
}

export function TeacherProfile({ teacher, onBack, onUpdate, onDelete }: TeacherProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(teacher.first_name || '');
  const [lastName, setLastName] = useState(teacher.last_name || '');
  const [email, setEmail] = useState(teacher.email || '');
  const [area, setArea] = useState(teacher.area || '');
  const [load, setLoad] = useState(teacher.load || 0);
  const [status, setStatus] = useState<any>(teacher.status || 'active');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await academicsApi.updateTeacher(teacher.id, {
        first_name: firstName,
        last_name: lastName,
        email: email,
        area: area,
        load: Number(load),
        status: status
      });
      onUpdate(updated);
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      setError('Error al actualizar los datos del docente. Intente nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Está seguro de que desea eliminar a este docente? Esta acción no se puede deshacer.')) {
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      await academicsApi.deleteTeacher(teacher.id);
      onDelete(teacher.id);
    } catch (err: any) {
      console.error(err);
      setError('Error al eliminar el docente. Asegúrese de que no tenga cursos asignados.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 z-30 flex flex-col animate-in fade-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la planta docente
        </button>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-xs font-medium transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-xs font-medium transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                Editar Perfil
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-xs font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Profile Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto pr-2">
        {/* Left Column: Avatar & Quick Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm h-fit">
          <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-3xl border-2 border-emerald-200 dark:border-emerald-800 shadow-inner mb-4">
            {teacher.first_name ? teacher.first_name.charAt(0) : teacher.email.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {isEditing ? (
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-2 py-1 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Nombres"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-2 py-1 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Apellidos"
                />
              </div>
            ) : (
              `${teacher.first_name} ${teacher.last_name}`
            )}
          </h2>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900 mt-1 mb-4">
            {teacher.employee_id || 'Sin Código'}
          </span>

          <div className="w-full border-t border-slate-100 dark:border-slate-800 my-4"></div>

          <div className="w-full space-y-3.5 text-left text-sm">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-350">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              {isEditing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                />
              ) : (
                <span className="truncate" title={teacher.email}>{teacher.email}</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-350">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Rol: Docente / Planta</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-350">
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Carga: {isEditing ? (
                <input
                  type="number"
                  value={load}
                  onChange={(e) => setLoad(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                />
              ) : teacher.load} hrs/sem</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Detailed Parameters & Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Info Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-md font-bold text-slate-850 dark:text-slate-100 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Detalles Académicos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Área / Especialidad
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                    placeholder="Ej: Matemáticas, Ciencias..."
                  />
                ) : (
                  <span className="inline-block px-3 py-1.5 text-sm font-semibold text-slate-800 dark:text-slate-250 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {teacher.area || 'Sin especificar'}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Estado Laboral
                </label>
                {isEditing ? (
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                  >
                    <option value="active">Activo</option>
                    <option value="on_leave">En Licencia</option>
                  </select>
                ) : (
                  <div>
                    {teacher.status === 'active' ? (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        En Licencia
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-slate-400 block font-medium">Asistencia Promedio Clases</span>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 block mt-1">96.8%</span>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96.8%' }}></div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-slate-400 block font-medium">Cumplimiento Planeación</span>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 block mt-1">92.0%</span>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '92.0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
