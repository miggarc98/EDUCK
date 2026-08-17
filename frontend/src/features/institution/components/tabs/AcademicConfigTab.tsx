import React from "react";
import { Calendar, Award, Layers, Check, X, Clock, Plus, Trash2 } from "lucide-react";
import type { LevelGroup } from "../../constants/institutionDefaults";
import type { Course } from "@/features/curriculum/types";

export interface ShiftConfig {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
}

export interface BreakConfig {
  name: string;
  start_time: string;
  end_time: string;
  courses: number[];
  shift_id?: string;
}

interface AcademicConfigTabProps {
  academicYear: string;
  setAcademicYear: (val: string) => void;
  currentPeriod: string;
  setCurrentPeriod: (val: string) => void;

  classDuration: number;
  setClassDuration: (val: number) => void;
  generalScale: "numeric_1_5" | "numeric_0_100" | "qualitative" | "national_col";
  setGeneralScale: (val: "numeric_1_5" | "numeric_0_100" | "qualitative" | "national_col") => void;
  decimalPrecision: "1" | "2";
  setDecimalPrecision: (val: "1" | "2") => void;
  minPassingGrade: string;
  setMinPassingGrade: (val: string) => void;
  independentScaleByCourse: boolean;
  setIndependentScaleByCourse: (val: boolean) => void;
  levelGroups: LevelGroup[];
  changeLevelGradingScale: (levelId: string, scale: string) => void;
  toggleGrade: (levelId: string, gradeId: string) => void;
  isFormalEducation: boolean;
  breaks: BreakConfig[];
  setBreaks: React.Dispatch<React.SetStateAction<BreakConfig[]>>;
  courses: Course[];
  shifts: ShiftConfig[];
  setShifts: React.Dispatch<React.SetStateAction<ShiftConfig[]>>;
}

export function AcademicConfigTab({
  academicYear,
  setAcademicYear,
  currentPeriod,
  setCurrentPeriod,

  classDuration,
  setClassDuration,
  generalScale,
  setGeneralScale,
  decimalPrecision,
  setDecimalPrecision,
  minPassingGrade,
  setMinPassingGrade,
  independentScaleByCourse,
  setIndependentScaleByCourse,
  levelGroups,
  changeLevelGradingScale,
  toggleGrade,
  isFormalEducation,
  breaks,
  setBreaks,
  courses,
  shifts,
  setShifts,
}: AcademicConfigTabProps) {
  const handleAddShift = () => {
    setShifts((prev) => [
      ...prev,
      { id: `jornada_${prev.length + 1}`, name: `Jornada ${prev.length + 1}`, start_time: "07:00", end_time: "13:00" }
    ]);
  };

  const handleRemoveShift = (idx: number) => {
    setShifts((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateShift = (idx: number, key: string, val: string) => {
    setShifts((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [key]: val } : s))
    );
  };
  const handleAddBreak = () => {
    setBreaks((prev) => [
      ...prev,
      { name: `Descanso ${prev.length + 1}`, start_time: "10:00", end_time: "10:30", courses: [] }
    ]);
  };

  const handleRemoveBreak = (idx: number) => {
    setBreaks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateBreak = (idx: number, key: string, val: any) => {
    setBreaks((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, [key]: val } : b))
    );
  };

  const handleToggleCourseForBreak = (breakIdx: number, courseId: number) => {
    setBreaks((prev) =>
      prev.map((b, i) => {
        if (i === breakIdx) {
          const exists = b.courses.includes(courseId);
          const newCourses = exists
            ? b.courses.filter((id) => id !== courseId)
            : [...b.courses, courseId];
          return { ...b, courses: newCourses };
        }
        return b;
      })
    );
  };

  const handleSelectAllCoursesForBreak = (breakIdx: number) => {
    setBreaks((prev) =>
      prev.map((b, i) => (i === breakIdx ? { ...b, courses: courses.map((c) => c.id) } : b))
    );
  };

  const handleClearCoursesForBreak = (breakIdx: number) => {
    setBreaks((prev) =>
      prev.map((b, i) => (i === breakIdx ? { ...b, courses: [] } : b))
    );
  };

  const handleSelectLevelCoursesForBreak = (breakIdx: number, levelKeyword: string) => {
    const targetCourseIds = courses
      .filter((c) => c.level.toLowerCase().includes(levelKeyword))
      .map((c) => c.id);
    setBreaks((prev) =>
      prev.map((b, i) => {
        if (i === breakIdx) {
          const merged = Array.from(new Set([...b.courses, ...targetCourseIds]));
          return { ...b, courses: merged };
        }
        return b;
      })
    );
  };
  return (
    <div className="space-y-6">
      {/* 2. Calendario y Periodos Académicos */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Calendario y Jornada Escolar
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configuración del año lectivo, periodos y horarios de clase
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Año Lectivo Activo
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="Ej: 2026, 2026-1"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Periodo Académico Actual
            </label>
            <select
              value={currentPeriod}
              onChange={(e) => setCurrentPeriod(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
            >
              <option value="Primer Periodo">Primer Periodo</option>
              <option value="Segundo Periodo">Segundo Periodo</option>
              <option value="Tercer Periodo">Tercer Periodo</option>
              <option value="Cuarto Periodo">Cuarto Periodo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Duración Bloque de Clase (Minutos)
            </label>
            <input
              type="number"
              min="1"
              max="240"
              value={classDuration}
              onChange={(e) => setClassDuration(Number(e.target.value))}
              placeholder="Ej: 45"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
            />
          </div>
          
          {/* Jornadas / Shifts */}
          <div className="col-span-1 sm:col-span-2 md:col-span-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jornadas Educativas (Turnos)
              </label>
              <button
                type="button"
                onClick={handleAddShift}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Jornada
              </button>
            </div>
            {shifts.length === 0 && (
              <p className="text-xs text-slate-500 italic">No hay jornadas configuradas. Utilice los horarios de inicio/fin de la sede.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shifts.map((shift, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={shift.name}
                      onChange={(e) => handleUpdateShift(idx, "name", e.target.value)}
                      className="bg-transparent font-bold text-sm text-slate-800 dark:text-slate-100 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors w-full mr-2"
                      placeholder="Ej. Mañana"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveShift(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-slate-500 w-12">ID:</span>
                    <input
                      type="text"
                      value={shift.id}
                      onChange={(e) => handleUpdateShift(idx, "id", e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Identificador único (ej. manana)"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 w-12">Horario:</span>
                    <input
                      type="time"
                      value={shift.start_time}
                      onChange={(e) => handleUpdateShift(idx, "start_time", e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                      type="time"
                      value={shift.end_time}
                      onChange={(e) => handleUpdateShift(idx, "end_time", e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sistema y Escala de Calificación */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Sistema de Evaluación Institucional
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define la escala valorativa oficial para la calificación de competencias
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Escala General por Defecto
              </label>
              <select
                value={generalScale}
                onChange={(e) => setGeneralScale(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
              >
                <option value="numeric_1_5">Numérica (1.0 a 5.0) - Estándar</option>
                <option value="numeric_0_100">Numérica Porcentual (0 a 100)</option>
                <option value="qualitative">Cualitativa (Excelente, Sobresaliente...)</option>
                <option value="national_col">Escala Nacional Decreto 1290 Colombia</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Precisión Decimal
              </label>
              <select
                value={decimalPrecision}
                onChange={(e) => setDecimalPrecision(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
              >
                <option value="1">1 Decimal (ej. 4.2)</option>
                <option value="2">2 Decimales (ej. 4.25)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nota Mínima de Aprobación
              </label>
              <input
                type="text"
                value={minPassingGrade}
                onChange={(e) => setMinPassingGrade(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/60">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={independentScaleByCourse}
                  onChange={(e) => setIndependentScaleByCourse(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Habilitar Escala Independiente por Nivel / Curso
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Permite asignar diferentes esquemas de calificación (ej. Cualitativa para Preescolar vs. Numérica 1-5 para Bachillerato).
                </p>
              </div>
            </label>
          </div>

          {independentScaleByCourse && (
            <div className="p-5 border border-blue-100 dark:border-blue-900/40 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Asignación de Escala por Nivel Educativo
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {levelGroups.map((group) => (
                  <div
                    key={group.levelId}
                    className="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {group.levelName}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {group.grades.filter((g) => g.enabled).length} grados activos
                      </span>
                    </div>
                    <select
                      value={group.gradingScale}
                      onChange={(e) => changeLevelGradingScale(group.levelId, e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                    >
                      <option value="numeric_1_5">Numérica (1.0 - 5.0)</option>
                      <option value="numeric_0_100">Numérica (0 - 100)</option>
                      <option value="qualitative">Cualitativa (E, S, A, I)</option>
                      <option value="national_col">Desempeño Nacional Colombia</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Niveles y Grados Educativos Asignados */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Niveles y Grados Educativos de la Institución
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecciona los niveles y cursos que ofrece tu colegio
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {levelGroups.map((group) => (
            <div
              key={group.levelId}
              className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {group.levelName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {group.description}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 self-start sm:self-auto">
                  {group.grades.filter((g) => g.enabled).length} de {group.grades.length} Grados Ofertados
                </span>
              </div>

              {group.ciclos && group.ciclos.length > 0 ? (
                <div className="space-y-4">
                  {group.ciclos.map((ciclo, cIdx) => (
                    <div key={cIdx} className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        {ciclo.nombre}
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {ciclo.grados.map((grade) => (
                          <button
                            key={grade.id}
                            type="button"
                            onClick={() => toggleGrade(group.levelId, grade.id)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                              grade.enabled
                                ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-400 line-through"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                grade.enabled ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                              }`}
                            >
                              {grade.enabled ? (
                                <Check className="w-3 h-3 stroke-[3]" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                            </div>
                            <span>{grade.name}</span>
                            {isFormalEducation && grade.obligatorioLey115 && (
                              <span className="text-[9px] bg-amber-400/30 text-amber-100 border border-amber-300/40 px-1.5 py-0.2 rounded font-bold">
                                Ley 115
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5 pt-2">
                  {group.grades.map((grade) => (
                    <button
                      key={grade.id}
                      type="button"
                      onClick={() => toggleGrade(group.levelId, grade.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                        grade.enabled
                          ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-400 line-through"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          grade.enabled ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                        }`}
                      >
                        {grade.enabled ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                      </div>
                      <span>{grade.name}</span>
                      {isFormalEducation && grade.obligatorioLey115 && (
                        <span className="text-[9px] bg-amber-400/30 text-amber-100 border border-amber-300/40 px-1.5 py-0.2 rounded font-bold">
                          Ley 115
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 2.5 Configuración de Descansos */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Descansos y Recesos Segmentados
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configura recreos granulares y asígnalos a cursos específicos (ej. primaria en primer turno, bachillerato después)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddBreak}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/10"
          >
            <Plus className="w-4 h-4" />
            Agregar Descanso
          </button>
        </div>

        {breaks.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Clock className="w-8 h-8 text-slate-350 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">No hay descansos configurados</p>
            <p className="text-xs text-slate-400 mt-0.5">Los cursos tendrán una jornada continua sin pausas si no configuras descansos.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {breaks.map((br, index) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 relative space-y-4 animate-in fade-in duration-200">
                <button
                  type="button"
                  onClick={() => handleRemoveBreak(index)}
                  className="absolute top-4 right-4 p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pr-10">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nombre del Descanso
                    </label>
                    <input
                      type="text"
                      value={br.name}
                      onChange={(e) => handleUpdateBreak(index, "name", e.target.value)}
                      placeholder="ej: Descanso Primaria"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Jornada (Opcional)
                    </label>
                    <select
                      value={br.shift_id || ""}
                      onChange={(e) => handleUpdateBreak(index, "shift_id", e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
                    >
                      <option value="">Ninguna</option>
                      {shifts.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hora de Inicio
                    </label>
                    <input
                      type="time"
                      value={br.start_time}
                      onChange={(e) => handleUpdateBreak(index, "start_time", e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hora de Fin
                    </label>
                    <input
                      type="time"
                      value={br.end_time}
                      onChange={(e) => handleUpdateBreak(index, "end_time", e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-semibold">
                      Cursos Asignados
                    </label>
                    <div className="flex gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleSelectAllCoursesForBreak(index)}
                        className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Todos
                      </button>
                      <span className="text-slate-400">|</span>
                      <button
                        type="button"
                        onClick={() => handleSelectLevelCoursesForBreak(index, "primaria")}
                        className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Primaria
                      </button>
                      <span className="text-slate-400">|</span>
                      <button
                        type="button"
                        onClick={() => handleSelectLevelCoursesForBreak(index, "secundaria")}
                        className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Secundaria y Media
                      </button>
                      <span className="text-slate-400">|</span>
                      <button
                        type="button"
                        onClick={() => handleClearCoursesForBreak(index)}
                        className="font-bold text-rose-500 hover:text-rose-600 hover:underline"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    {courses.map((course) => {
                      const isSelected = br.courses.includes(course.id);
                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => handleToggleCourseForBreak(index, course.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-950/45 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80"
                              : "bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800/60 hover:border-slate-350"
                          }`}
                        >
                          {course.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
