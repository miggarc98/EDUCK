import { useState } from 'react';
import { ArrowLeft, User, Mail, BookOpen, Briefcase, Trash2, Edit2, Save, X, Clock } from 'lucide-react';
import type { Teacher } from '../types';
import { academicsApi } from '../services/api';
import { Button } from '../../../shared/components/atoms/Button';
import { Input } from '../../../shared/components/atoms/Input';


import type { Area, Course } from '../../curriculum/types';
import type { InstitutionSettingData } from '../../institution/types';

interface TeacherProfileProps {
  teacher: Teacher;
  onBack: () => void;
  onUpdate: (updated: Teacher) => void;
  onDelete: (id: number) => void;
  areasList: Area[];
  coursesList: Course[];
  settings: InstitutionSettingData | null;
}

export function TeacherProfile({ teacher, onBack, onUpdate, onDelete, areasList, coursesList, settings }: TeacherProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(teacher.first_name || '');
  const [lastName, setLastName] = useState(teacher.last_name || '');
  const [email, setEmail] = useState(teacher.email || '');
  const [area, setArea] = useState(teacher.area || '');
  const [load, setLoad] = useState(teacher.load || 0);
  const [status, setStatus] = useState<any>(teacher.status || 'active');
  const [availability, setAvailability] = useState<any>(teacher.availability || {});
  const [additionalAreas, setAdditionalAreas] = useState<string[]>(teacher.additional_areas || []);
  const [maxHours, setMaxHours] = useState<number>(teacher.max_hours || settings?.default_teacher_max_hours || 22);
  const [availableShifts, setAvailableShifts] = useState<string[]>(teacher.available_shifts || []);
  const [titularCourseId, setTitularCourseId] = useState<number | null>(teacher.titular_course_id || null);
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
        status: status,
        availability: availability,
        additional_areas: additionalAreas,
        max_hours: maxHours,
        available_shifts: availableShifts,
        titular_course_id: titularCourseId
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
        <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a la planta docente
        </Button>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
                <X className="w-4 h-4 mr-1.5" />
                Cancelar
              </Button>
              <Button variant="default" size="sm" onClick={handleSave} loading={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="w-4 h-4 mr-1.5" />
                Guardar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-1.5 text-slate-500" />
                Editar Perfil
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} loading={isDeleting}>
                <Trash2 className="w-4 h-4 mr-1.5" />
                Eliminar
              </Button>
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
                <Input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Nombres" className="dark:bg-slate-800" />
                <Input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Apellidos" className="dark:bg-slate-800" />
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
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="dark:bg-slate-800 h-8 text-xs" />
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
                <Input type="number" value={load} onChange={(e) => setLoad(Number(e.target.value))} className="w-20 dark:bg-slate-800 h-8 text-xs" />
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
                  <Input type="text" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Ej: Matemáticas, Ciencias..." className="dark:bg-slate-800" />
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

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Áreas Adicionales (Soporte)
                </label>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {areasList.map(a => (
                      <label key={a.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <input
                          type="checkbox"
                          checked={additionalAreas.includes(a.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAdditionalAreas([...additionalAreas, a.name]);
                            } else {
                              setAdditionalAreas(additionalAreas.filter(area => area !== a.name));
                            }
                          }}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                        <span className="text-slate-700 dark:text-slate-200">{a.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {teacher.additional_areas && teacher.additional_areas.length > 0 ? (
                      teacher.additional_areas.map(a => (
                        <span key={a} className="inline-block px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                          {a}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 italic">Ninguna</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Jornadas Disponibles
                </label>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {settings?.shifts?.map(s => (
                      <label key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <input
                          type="checkbox"
                          checked={availableShifts.includes(s.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAvailableShifts([...availableShifts, s.id]);
                            } else {
                              setAvailableShifts(availableShifts.filter(shift => shift !== s.id));
                            }
                          }}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                        <span className="text-slate-700 dark:text-slate-200">{s.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {teacher.available_shifts && teacher.available_shifts.length > 0 ? (
                      teacher.available_shifts.map(shiftId => {
                        const shiftName = settings?.shifts?.find(s => s.id === shiftId)?.name || shiftId;
                        return (
                          <span key={shiftId} className="inline-block px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                            {shiftName}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-sm text-slate-500 italic">No especificadas (Por defecto: Todas)</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Titular de (Curso)
                </label>
                {isEditing ? (
                  <select
                    value={titularCourseId || ''}
                    onChange={(e) => setTitularCourseId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                  >
                    <option value="">Ninguno</option>
                    {coursesList.map(c => (
                      <option key={c.id} value={c.id}>{c.name} - {c.level}</option>
                    ))}
                  </select>
                ) : (
                  <div>
                    {teacher.titular_course ? (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {coursesList.find(c => c.id === teacher.titular_course)?.name || `Curso ID: ${teacher.titular_course}`}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500 italic">No es titular</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Límite Máximo de Horas/Semana
                </label>
                {isEditing ? (
                  <Input type="number" value={maxHours} onChange={(e) => setMaxHours(Number(e.target.value))} min={1} max={50} className="dark:bg-slate-800" />
                ) : (
                  <span className="inline-block px-3 py-1.5 text-sm font-bold text-slate-800 dark:text-slate-250 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {teacher.max_hours || settings?.default_teacher_max_hours || 22} hrs
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Disponibilidad Horaria */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-md font-bold text-slate-850 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Disponibilidad Horaria en la Institución
            </h3>

            <div className="space-y-3">
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((day) => {
                const dayAvail = availability[day] || null;
                const isDayAvail = !!dayAvail;
                
                return (
                  <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-slate-50/50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800/60 transition-all">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={isDayAvail}
                          onChange={(e) => {
                            const newAvail = { ...availability };
                            if (e.target.checked) {
                              newAvail[day] = { start_time: '08:00', end_time: '12:00' };
                            } else {
                              delete newAvail[day];
                            }
                            setAvailability(newAvail);
                          }}
                          className="w-4 h-4 text-emerald-600 border-slate-350 rounded focus:ring-emerald-500"
                        />
                      ) : (
                        <span className={`w-2 h-2 rounded-full ${isDayAvail ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
                      )}
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 w-20">{day}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <input
                            type="time"
                            disabled={!isDayAvail}
                            value={dayAvail?.start_time || '08:00'}
                            onChange={(e) => {
                              const newAvail = { ...availability };
                              newAvail[day] = { ...newAvail[day], start_time: e.target.value };
                              setAvailability(newAvail);
                            }}
                            className="px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 disabled:opacity-50"
                          />
                          <span className="text-slate-400 text-xs">-</span>
                          <input
                            type="time"
                            disabled={!isDayAvail}
                            value={dayAvail?.end_time || '12:00'}
                            onChange={(e) => {
                              const newAvail = { ...availability };
                              newAvail[day] = { ...newAvail[day], end_time: e.target.value };
                              setAvailability(newAvail);
                            }}
                            className="px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 disabled:opacity-50"
                          />
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {isDayAvail ? `${dayAvail.start_time} - ${dayAvail.end_time}` : 'Disponible toda la jornada'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
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
