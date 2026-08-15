import React from "react";
import {
  Layers,
  BookOpen,
  Plus,
  Sparkles,
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  X,
  GraduationCap,
} from "lucide-react";
import type { Area, Subject, Course } from "@/features/curriculum/types";

interface CurriculumSettingsTabProps {
  isFormalEducation: boolean;
  isSeeding: boolean;
  handleSeedLey115: () => void;
  curriculumLoading: boolean;
  areas: Area[];
  subjects: Subject[];
  courses: Course[];
  searchAreaTerm: string;
  setSearchAreaTerm: (val: string) => void;
  searchSubjectTerm: string;
  setSearchSubjectTerm: (val: string) => void;
  filterSubjectArea: string;
  setFilterSubjectArea: (val: string) => void;
  activeAreaDropdown: number | null;
  setActiveAreaDropdown: (val: number | null) => void;
  activeSubjectDropdown: number | null;
  setActiveSubjectDropdown: (val: number | null) => void;
  openCreateAreaModal: () => void;
  openEditAreaModal: (area: Area) => void;
  handleAreaDelete: (area: Area) => void;
  openCreateSubjectModal: () => void;
  openEditSubjectModal: (subject: Subject) => void;
  handleSubjectDelete: (subject: Subject) => void;
  // Area Modal Props
  isAreaModalOpen: boolean;
  setIsAreaModalOpen: (val: boolean) => void;
  editingArea: Area | null;
  areaName: string;
  setAreaName: (val: string) => void;
  areaDescription: string;
  setAreaDescription: (val: string) => void;
  handleAreaSubmit: (e: React.FormEvent) => void;
  // Subject Modal Props
  isSubjectModalOpen: boolean;
  setIsSubjectModalOpen: (val: boolean) => void;
  editingSubject: Subject | null;
  subjectName: string;
  setSubjectName: (val: string) => void;
  subjectDescription: string;
  setSubjectDescription: (val: string) => void;
  subjectAreaId: string;
  setSubjectAreaId: (val: string) => void;
  subjectCourses: number[];
  handleToggleCourseForSubject: (courseId: number) => void;
  handleSubjectSubmit: (e: React.FormEvent) => void;
  errorMessage: string | null;
  setErrorMessage: (val: string | null) => void;
}

export function CurriculumSettingsTab({
  isFormalEducation,
  isSeeding,
  handleSeedLey115,
  curriculumLoading,
  areas,
  subjects,
  courses,
  searchAreaTerm,
  setSearchAreaTerm,
  searchSubjectTerm,
  setSearchSubjectTerm,
  filterSubjectArea,
  setFilterSubjectArea,
  activeAreaDropdown,
  setActiveAreaDropdown,
  activeSubjectDropdown,
  setActiveSubjectDropdown,
  openCreateAreaModal,
  openEditAreaModal,
  handleAreaDelete,
  openCreateSubjectModal,
  openEditSubjectModal,
  handleSubjectDelete,
  isAreaModalOpen,
  setIsAreaModalOpen,
  editingArea,
  areaName,
  setAreaName,
  areaDescription,
  setAreaDescription,
  handleAreaSubmit,
  isSubjectModalOpen,
  setIsSubjectModalOpen,
  editingSubject,
  subjectName,
  setSubjectName,
  subjectDescription,
  setSubjectDescription,
  subjectAreaId,
  setSubjectAreaId,
  subjectCourses,
  handleToggleCourseForSubject,
  handleSubjectSubmit,
  errorMessage,
  setErrorMessage,
}: CurriculumSettingsTabProps) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors space-y-6">
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-250 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center justify-between gap-2 animate-fade-in">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="hover:opacity-70 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Plan de Estudios (Áreas y Asignaturas)
            {isFormalEducation ? (
              <span className="text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full font-bold">
                Régimen Ley 115 (Formal)
              </span>
            ) : (
              <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full font-bold">
                Currículo Libre / No Formal
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isFormalEducation
              ? "Gestiona las 9 áreas fundamentales de la Ley 115 y sus asignaturas asociadas."
              : "Configura áreas temáticas y módulos según el modelo educativo de tu institución."}
          </p>
        </div>

        <div className="flex gap-2">
          {isFormalEducation && (
            <button
              onClick={handleSeedLey115}
              disabled={isSeeding}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSeeding ? "Cargando..." : "Precargar Ley 115 (MEN)"}</span>
            </button>
          )}
          <button
            onClick={openCreateAreaModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Área</span>
          </button>
          <button
            onClick={openCreateSubjectModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Materia</span>
          </button>
        </div>
      </div>

      {/* Mode Indicator Banner */}
      {!isFormalEducation && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
          <strong>Modo Libre Activo:</strong> Puedes crear áreas personalizadas como <em>Robótica</em>, <em>Idiomas por Niveles (A1-C1)</em>, o <em>Talleres de Música</em> sin requerimientos estrictos del Ministerio de Educación.
        </div>
      )}

      {/* Grid: Areas vs Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Academic Areas */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-500" />
              Áreas Académicas ({areas.length})
            </h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar área..."
                value={searchAreaTerm}
                onChange={(e) => setSearchAreaTerm(e.target.value)}
                className="pl-7 pr-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>
          </div>

          {curriculumLoading ? (
            <div className="py-8 text-center text-xs text-slate-500">Cargando currículo...</div>
          ) : (
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {areas
                .filter((a) =>
                  a.name.toLowerCase().includes(searchAreaTerm.toLowerCase()) ||
                  (a.description && a.description.toLowerCase().includes(searchAreaTerm.toLowerCase()))
                )
                .map((area) => {
                  const areaSubjects = subjects.filter((s) => s.area === area.id);
                  return (
                    <div
                      key={area.id}
                      className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex justify-between items-center gap-4 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate flex items-center gap-2">
                          <span>{area.name}</span>
                          {area.is_mandatory && isFormalEducation && (
                            <span className="text-[9px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.2 rounded font-semibold shrink-0">
                              Ley 115
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                          {area.description || "Sin descripción"}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold">
                          {areaSubjects.length} materias
                        </span>
                        <div className="relative">
                          <button
                            onClick={() => setActiveAreaDropdown(activeAreaDropdown === area.id ? null : area.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {activeAreaDropdown === area.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-lg py-1 z-20 w-24 text-left">
                              <button
                                onClick={() => openEditAreaModal(area)}
                                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                              >
                                <Edit className="w-3.5 h-3.5 text-slate-500" /> Editar
                              </button>
                              <button
                                onClick={() => handleAreaDelete(area)}
                                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                <Trash className="w-3.5 h-3.5 text-red-500" /> Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              {areas.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                  <p>No hay áreas configuradas.</p>
                  {isFormalEducation ? (
                    <button
                      onClick={handleSeedLey115}
                      className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold hover:underline"
                    >
                      <Sparkles className="w-3 h-3" /> Precargar las 9 áreas del MEN
                    </button>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      Usa el botón <strong>"Nueva Área"</strong> para registrar tu primera área personalizada.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Subjects */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              Asignaturas/Materias ({subjects.length})
            </h3>

            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={filterSubjectArea}
                onChange={(e) => setFilterSubjectArea(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="">Todas las Áreas</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <div className="relative flex-1 sm:max-w-[150px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar materia..."
                  value={searchSubjectTerm}
                  onChange={(e) => setSearchSubjectTerm(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {curriculumLoading ? (
            <div className="py-8 text-center text-xs text-slate-500">Cargando materias...</div>
          ) : (
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {subjects
                .filter((subj) => {
                  const matchesSearch =
                    subj.name.toLowerCase().includes(searchSubjectTerm.toLowerCase()) ||
                    (subj.description && subj.description.toLowerCase().includes(searchSubjectTerm.toLowerCase()));
                  const matchesArea = filterSubjectArea ? subj.area === Number(filterSubjectArea) : true;
                  return matchesSearch && matchesArea;
                })
                .map((subj) => (
                  <div
                    key={subj.id}
                    className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex justify-between items-center gap-4 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate flex items-center gap-2">
                        <span>{subj.name}</span>
                        <span className="text-[9px] bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 px-1.5 py-0.2 rounded font-semibold shrink-0">
                          {subj.area_detail?.name || "Sin Área"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex flex-wrap gap-1">
                        {subj.courses_detail && subj.courses_detail.length > 0 ? (
                          subj.courses_detail.map((c) => (
                            <span key={c.id} className="bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-slate-500">
                              {c.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-rose-500 italic">No dictada en ningún curso</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="relative">
                        <button
                          onClick={() => setActiveSubjectDropdown(activeSubjectDropdown === subj.id ? null : subj.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {activeSubjectDropdown === subj.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-lg py-1 z-20 w-24 text-left">
                            <button
                              onClick={() => openEditSubjectModal(subj)}
                              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            >
                              <Edit className="w-3.5 h-3.5 text-slate-500" /> Editar
                            </button>
                            <button
                              onClick={() => handleSubjectDelete(subj)}
                              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash className="w-3.5 h-3.5 text-red-500" /> Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              {subjects.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500 italic">No hay asignaturas registradas.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- AREA MODAL --- */}
      {isAreaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                {editingArea ? "Editar Área Académica" : "Nueva Área Académica"}
              </h3>
              <button
                onClick={() => setIsAreaModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAreaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Área
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Matemáticas, Robótica, Idiomas"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Descripción de competencias del área..."
                  value={areaDescription}
                  onChange={(e) => setAreaDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAreaModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  {editingArea ? "Guardar Cambios" : "Crear Área"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SUBJECT MODAL --- */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                {editingSubject ? "Editar Asignatura/Materia" : "Nueva Asignatura/Materia"}
              </h3>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre de la Materia
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Álgebra, Física, Inglés B1"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Área Académica
                  </label>
                  <select
                    required
                    value={subjectAreaId}
                    onChange={(e) => setSubjectAreaId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
                  >
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Propósito y enfoque de la materia..."
                  value={subjectDescription}
                  onChange={(e) => setSubjectDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Selección de Cursos donde se dicta */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dictada en los Cursos ({subjectCourses.length} seleccionados)
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl max-h-36 overflow-y-auto flex flex-wrap gap-2">
                  {courses.map((course) => {
                    const isSelected = subjectCourses.includes(course.id);
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => handleToggleCourseForSubject(course.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                        }`}
                      >
                        {course.name}
                      </button>
                    );
                  })}
                  {courses.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No hay cursos configurados en la institución.</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  {editingSubject ? "Guardar Cambios" : "Crear Materia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
