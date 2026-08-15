import React from "react";
import { Calendar, Award, Layers, Check, X } from "lucide-react";
import type { LevelGroup } from "../../constants/institutionDefaults";

interface AcademicConfigTabProps {
  academicYear: string;
  setAcademicYear: (val: string) => void;
  currentPeriod: string;
  setCurrentPeriod: (val: string) => void;
  startTime: string;
  setStartTime: (val: string) => void;
  endTime: string;
  setEndTime: (val: string) => void;
  classDuration: string;
  setClassDuration: (val: string) => void;
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
}

export function AcademicConfigTab({
  academicYear,
  setAcademicYear,
  currentPeriod,
  setCurrentPeriod,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
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
}: AcademicConfigTabProps) {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Año Lectivo Activo
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
            >
              <option value="2023">2023</option>
              <option value="2024">2024 (En curso)</option>
              <option value="2025">2025 (Planeación)</option>
            </select>
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
              Horario de Inicio / Fin Sede
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Duración Bloque de Clase
            </label>
            <select
              value={classDuration}
              onChange={(e) => setClassDuration(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
            >
              <option value="45 min">45 minutos</option>
              <option value="50 min">50 minutos</option>
              <option value="55 min">55 minutos</option>
              <option value="60 min">60 minutos (1 hora)</option>
            </select>
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
    </div>
  );
}
