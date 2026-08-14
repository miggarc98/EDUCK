import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  ShieldAlert,
  GraduationCap,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { enrollmentApi } from "../services/api";
import type { Student } from "../types";
import { curriculumApi, type Course } from "@/features/curriculum";

export function StudentsDirectory() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [degreeFilter, setDegreeFilter] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseFilter, setCourseFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  useEffect(() => {
    // Load courses on mount
    curriculumApi.getCourses().then(setCourses).catch(console.error);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, degreeFilter, emailFilter, nameFilter, courseFilter, pageSize]);

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, degreeFilter, emailFilter, nameFilter, courseFilter, currentPage, pageSize]);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await enrollmentApi.getStudents({
        search: searchTerm,
        degree: degreeFilter || undefined,
        email: emailFilter || undefined,
        name: nameFilter || undefined,
        course: courseFilter ? Number(courseFilter) : undefined,
        page: currentPage,
        page_size: pageSize,
      });
      setStudents(data.results);
      setTotalCount(data.count);
    } catch (err: any) {
      console.error(err);
      setError("No se pudo cargar el directorio de estudiantes.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const calculateAge = (birthDateStr?: string) => {
    if (!birthDateStr) return 14;
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (selectedStudent) {
    const age = calculateAge(selectedStudent.profile?.birth_date);
    const displayName = `${selectedStudent.first_name} ${selectedStudent.last_name}`;
    const gradeDisplay = selectedStudent.course_detail
      ? `${selectedStudent.current_degree} - ${selectedStudent.course_detail.name}`
      : selectedStudent.current_degree || "Sin Grado";

    return (
      <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-300 px-4 sm:px-6">
        <button
          onClick={() => setSelectedStudentId(null)}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver al directorio</span>
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column: Basic Info */}
          <div className="w-full md:w-1/3 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4 border-4 border-white dark:border-slate-900 shadow-sm">
                <UserCircle className="w-16 h-16" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {displayName}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                EST-{selectedStudent.id.toString().padStart(4, '0')}
              </p>

              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/50">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                {selectedStudent.is_active ? "Activo" : "Inactivo"}
              </div>

              <div className="w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {gradeDisplay}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-400 animate-pulse" />
                  <span className="text-slate-700 dark:text-slate-300 break-all">
                    {selectedStudent.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {selectedStudent.profile?.phone || "Sin Teléfono"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {selectedStudent.profile?.address || "Sin Dirección"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <HeartPulse className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100">
                  Información Médica
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">
                    Grupo Sanguíneo
                  </span>
                  <span className="font-medium text-slate-850 dark:text-slate-200">
                    {selectedStudent.profile?.blood_type || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">
                    Edad Cálculo
                  </span>
                  <span className="font-medium text-slate-850 dark:text-slate-200">
                    {age} años ({selectedStudent.profile?.birth_date || "Fecha no registrada"})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">
                    Observaciones Médicas
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/30 text-xs leading-relaxed">
                    {selectedStudent.profile?.medical_notes || "Ninguna conocida."}
                  </p>
                </div>
              </div>
            </div>

            {selectedStudent.profile?.guardian_name && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">
                  Datos del Acudiente
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedStudent.profile.guardian_name}
                    </span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300">
                      {selectedStudent.profile.guardian_relation || "Acudiente"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4" />
                    <span>{selectedStudent.profile.guardian_phone || "Sin teléfono"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span>{selectedStudent.profile.guardian_email || "Sin correo"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Academic & Discipline */}
          <div className="w-full md:w-2/3 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 text-lg">
                Resumen Académico
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Promedio Gral
                  </span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {selectedStudent.performance?.gpa || "N/A"}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Asistencia
                  </span>
                  <span
                    className={`text-2xl font-black ${
                      (selectedStudent.performance?.attendance || 0) >= 90
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {selectedStudent.performance?.attendance || 0}%
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Puesto (Curso)
                  </span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {selectedStudent.performance?.lastPeriodRank || "N/A"}
                  </span>
                </div>
              </div>

              {/* Placeholder for chart */}
              <div className="h-48 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                <span className="text-slate-400 dark:text-slate-500 text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Gráfico de rendimiento histórico (Próximamente)
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  Historial de Convivencia
                </h3>
                <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
                  Registrar caso
                </button>
              </div>

              {selectedStudent.disciplineCases && selectedStudent.disciplineCases.length > 0 ? (
                <div className="space-y-3">
                  {selectedStudent.disciplineCases.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {c.id}
                          </span>
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                            {c.type}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {c.date} • {c.status}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors animate-bounce-horizontal" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  El estudiante no registra casos de convivencia.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-300 px-4 sm:px-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Directorio de Estudiantes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Visión 360° del perfil académico, convivencia y personal.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, documento o grado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  showFilters
                    ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Filtrar por Grado
                </label>
                <select
                  value={degreeFilter}
                  onChange={(e) => setDegreeFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-250 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="">Todos los grados</option>
                  {["Pre-Jardín", "Jardín", "Transición", "1º", "2º", "3º", "4º", "5º", "6º", "7º", "8º", "9º", "10º", "11º"].map((deg) => (
                    <option key={deg} value={deg}>
                      {deg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Filtrar por Curso
                </label>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-250 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="">Todos los cursos</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Filtrar por Nombre
                </label>
                <input
                  type="text"
                  placeholder="Nombre o apellido..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Filtrar por Correo
                </label>
                <input
                  type="text"
                  placeholder="ejemplo@estudiante.edu.co"
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            Cargando directorio de estudiantes...
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {students.map((student) => {
              const displayName = `${student.first_name} ${student.last_name}`;
              const gradeDisplay = student.course_detail
                ? `${student.current_degree} - ${student.course_detail.name}`
                : student.current_degree || "Sin Grado";
              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center flex-1">
                    <div className="flex items-center gap-4 w-full sm:w-auto shrink-0">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <UserCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">
                          {displayName}
                        </span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block">
                          EST-{student.id.toString().padStart(4, '0')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 sm:ml-8 flex-1">
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {gradeDisplay}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {student.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto shrink-0 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="flex gap-4 text-xs font-medium">
                      <div className="flex flex-col items-center">
                        <span className="text-slate-400 mb-0.5">Promedio</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {student.performance?.gpa || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-slate-400 mb-0.5">Convivencia</span>
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            student.disciplineCases && student.disciplineCases.length > 0
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          }`}
                        >
                          {student.disciplineCases ? student.disciplineCases.length : 0} caso(s)
                        </span>
                      </div>
                    </div>
                    <div className="p-2 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors bg-white dark:bg-slate-900 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 rounded-lg">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })}

            {students.length === 0 && (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                No se encontraron estudiantes que coincidan con la búsqueda.
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Mostrando página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({totalCount} estudiantes en total)
              </span>
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <span>Mostrar:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                title="Página Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (currentPage > 3 && totalPages > 5) {
                  pageNum = currentPage - 3 + i;
                  if (pageNum + (4 - i) > totalPages) {
                    pageNum = totalPages - 4 + i;
                  }
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      currentPage === pageNum
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                title="Página Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default StudentsDirectory;
