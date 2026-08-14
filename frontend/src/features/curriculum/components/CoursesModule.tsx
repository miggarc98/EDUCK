import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  BookOpen,
  Users,
  User,
  Clock,
  Activity,
  MoreHorizontal,
  X,
  Edit,
  Trash,
  Award,
  ShieldAlert,
  GraduationCap,
  Phone,
  Mail,
  Calendar,
  MapPin,
} from "lucide-react";
import { curriculumApi } from "../services/api";
import type { Course, Teacher } from "../types";
import { institutionApi } from "@/features/institution/services/api";
import type { InstitutionSettingData } from "@/features/institution/types";
import { enrollmentApi } from "@/features/enrollment/services/api";
import type { Student } from "@/features/enrollment/types/student.types";
import { TeacherProfile } from "./TeacherProfile";

export function CoursesModule() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [settings, setSettings] = useState<InstitutionSettingData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // Form states
  const [courseName, setCourseName] = useState("");
  const [courseLevel, setCourseLevel] = useState("Básica Secundaria");
  const [courseDegree, setCourseDegree] = useState("");
  const [courseDirector, setCourseDirector] = useState<string>("");

  // Dropdown states for each row
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  // Student view states
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [selectedTeacherForProfile, setSelectedTeacherForProfile] = useState<Teacher | null>(null);

  const handleViewStudents = async (course: Course) => {
    setSelectedCourseForStudents(course);
    setStudentsLoading(true);
    try {
      const data = await enrollmentApi.getStudents({ course: course.id, page_size: 100 });
      setStudents(data.results);
    } catch (err) {
      console.error(err);
      alert("Error al cargar estudiantes");
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesData, teachersData, settingsData] = await Promise.all([
        curriculumApi.getCourses(),
        curriculumApi.getTeachers(),
        institutionApi.getSettings(),
      ]);
      setCourses(coursesData);
      setTeachers(teachersData);
      setSettings(settingsData);
    } catch (err: any) {
      console.error(err);
      setError("No se pudieron cargar los datos de los cursos, profesores o configuraciones.");
    } finally {
      setLoading(false);
    }
  };

  const getOfferedDegreesForLevel = (level: string, currentSettings: InstitutionSettingData | null = settings) => {
    if (!currentSettings || !currentSettings.offered_degrees) return [];
    const normalizedLevel = level
      .toLowerCase()
      .replace("básica ", "")
      .replace(" académica", "")
      .trim();
    return currentSettings.offered_degrees[normalizedLevel] || [];
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    setCourseName("");
    setCourseLevel("Básica Secundaria");
    const degrees = getOfferedDegreesForLevel("Básica Secundaria");
    setCourseDegree(degrees[0] || "");
    setCourseDirector("");
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setCourseName(course.name);
    setCourseLevel(course.level);
    setCourseDegree(course.degree || "");
    setCourseDirector(course.director ? String(course.director) : "");
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleLevelChange = (level: string) => {
    setCourseLevel(level);
    const degrees = getOfferedDegreesForLevel(level);
    setCourseDegree(degrees[0] || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    try {
      const payload = {
        name: courseName,
        level: courseLevel,
        degree: courseDegree || undefined,
        director: courseDirector ? Number(courseDirector) : null,
      };

      if (editingCourse) {
        const updated = await curriculumApi.updateCourse(editingCourse.id, payload);
        setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? updated : c)));
      } else {
        const created = await curriculumApi.createCourse(payload);
        setCourses((prev) => [...prev, created]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar el curso");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este curso?")) return;
    try {
      await curriculumApi.deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setActiveDropdown(null);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el curso");
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.director_detail &&
        `${course.director_detail.first_name} ${course.director_detail.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      course.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedStudentForProfile && selectedCourseForStudents) {
    const perf = selectedStudentForProfile.performance || { gpa: 4.0, attendance: 95, lastPeriodRank: "1/30" };
    const cases = selectedStudentForProfile.disciplineCases || [];
    const profile = selectedStudentForProfile.profile || {};
    
    return (
      <div className="max-w-6xl mx-auto pb-12 relative px-4 sm:px-6">
        {/* Breadcrumbs Trail */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-805/20 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm animate-fade-in">
          <button 
            onClick={() => {
              setSelectedCourseForStudents(null);
              setSelectedStudentForProfile(null);
            }}
            className="hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>Cursos</span>
          </button>
          <span className="text-slate-400 dark:text-slate-650 font-bold">/</span>
          <button 
            onClick={() => setSelectedStudentForProfile(null)}
            className="hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors"
          >
            {selectedCourseForStudents.name} / Estudiantes
          </button>
          <span className="text-slate-400 dark:text-slate-650 font-bold">/</span>
          <span className="text-slate-400 dark:text-slate-500 font-medium">
            {selectedStudentForProfile.first_name} {selectedStudentForProfile.last_name}
          </span>
        </nav>

        {/* Student Profile Overview Card */}
        <div className="mb-8 flex flex-col md:flex-row gap-6">
          {/* Left Column: Personal info */}
          <div className="w-full md:w-1/3 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center text-center animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-2xl mb-4 border-2 border-blue-200 dark:border-blue-800/50">
                {selectedStudentForProfile.first_name.charAt(0)}{selectedStudentForProfile.last_name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {selectedStudentForProfile.first_name} {selectedStudentForProfile.last_name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{selectedStudentForProfile.email}</p>

              <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4 text-left">
                <h3 className="text-xs font-semibold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">Información Personal</h3>
                
                <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-350">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{profile.phone || "Sin teléfono registrado"}</span>
                </div>
                
                <div className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-355">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <span>{profile.address || "Sin dirección registrada"}</span>
                </div>
                
                {profile.birth_date && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-350">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Nacido el {new Date(profile.birth_date).toLocaleDateString()}</span>
                  </div>
                )}
                {profile.blood_type && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-350">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span>RH: {profile.blood_type}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Guardian Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-fade-in">
              <h3 className="text-xs font-semibold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-4">Información del Acudiente</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {profile.guardian_name || "Sin acudiente"}
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-450 font-medium">
                    {profile.guardian_relation || "Acudiente"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{profile.guardian_phone || "Sin teléfono"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{profile.guardian_email || "Sin correo electrónico"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Academic & Discipline details */}
          <div className="w-full md:w-2/3 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-fade-in">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 text-lg">
                Resumen Académico
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-450 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Promedio Gral
                  </span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {perf.gpa}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-455 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Asistencia
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {perf.attendance}%
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-455 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Puesto (Curso)
                  </span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {perf.lastPeriodRank}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-fade-in">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2 mb-6">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Historial de Convivencia
              </h3>
              
              {cases.length > 0 ? (
                <div className="space-y-3">
                  {cases.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-105 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-805 dark:text-slate-200">
                            {c.id}
                          </span>
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                            {c.type}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {c.date} &bull; Status: {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-500 dark:text-slate-400">
                  No hay reportes ni casos de convivencia registrados.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCourseForStudents) {
    return (
      <div className="max-w-6xl mx-auto pb-12 relative px-4 sm:px-6">
        {/* Breadcrumbs Trail */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-805/20 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
          <button 
            onClick={() => setSelectedCourseForStudents(null)}
            className="hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>Cursos</span>
          </button>
          <span className="text-slate-400 dark:text-slate-650 font-bold">/</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            {selectedCourseForStudents.name}
          </span>
          <span className="text-slate-400 dark:text-slate-650 font-bold">/</span>
          <span className="text-slate-400 dark:text-slate-500">Estudiantes</span>
        </nav>

        {/* Course detail header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-805/40 p-6 rounded-2xl border border-slate-150 dark:border-slate-800/70 shadow-sm animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              <span>Estudiantes de {selectedCourseForStudents.name}</span>
            </h1>
            <p className="text-slate-505 dark:text-slate-400 text-sm mt-1">
              Nivel: <span className="font-semibold text-slate-700 dark:text-slate-305">{selectedCourseForStudents.level}</span>
              {selectedCourseForStudents.degree && (
                <> &bull; Grado: <span className="font-semibold text-slate-700 dark:text-slate-305">{selectedCourseForStudents.degree}</span></>
              )}
            </p>
          </div>
          <div 
            onClick={() => selectedCourseForStudents.director_detail && setSelectedTeacherForProfile(selectedCourseForStudents.director_detail)}
            className={`flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 ${selectedCourseForStudents.director_detail ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors' : ''}`}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450 flex items-center justify-center font-bold text-xs">
              {selectedCourseForStudents.director_detail
                ? `${selectedCourseForStudents.director_detail.first_name.charAt(0)}${selectedCourseForStudents.director_detail.last_name.charAt(0)}`
                : "SD"}
            </div>
            <div>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-semibold">Director de Grupo</p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {selectedCourseForStudents.director_detail
                  ? `${selectedCourseForStudents.director_detail.first_name} ${selectedCourseForStudents.director_detail.last_name}`
                  : "Sin Director Asignado"}
              </p>
            </div>
          </div>
        </div>

        {/* Students list with metrics */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          {studentsLoading ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Cargando estudiantes y métricas...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-medium">No hay estudiantes inscritos en este curso.</p>
              <button
                onClick={() => setSelectedCourseForStudents(null)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Volver a Cursos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((student) => {
                const perf = student.performance || { gpa: 4.0, attendance: 95, lastPeriodRank: "1/30" };
                const cases = student.disciplineCases || [];
                const gpaColor = perf.gpa >= 4.0 ? "text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50" :
                                 perf.gpa >= 3.0 ? "text-amber-600 dark:text-amber-450 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50" :
                                 "text-rose-600 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50";

                return (
                  <div 
                    key={student.id}
                    onClick={() => setSelectedStudentForProfile(student)}
                    className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 dark:hover:border-slate-700 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-755 dark:text-blue-450 flex items-center justify-center font-bold text-sm">
                        {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-805 dark:text-slate-100 text-sm">
                          {student.first_name} {student.last_name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{student.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-semibold">Promedio</span>
                        <span className={`inline-flex items-center px-2 py-0.5 mt-0.5 rounded text-xs font-bold border ${gpaColor}`}>
                          <Award className="w-3.5 h-3.5 mr-1" />
                          {perf.gpa}
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-450 dark:text-slate-505 uppercase tracking-wider font-semibold">Asistencia</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-blue-500" />
                          {perf.attendance}%
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-450 dark:text-slate-550 uppercase tracking-wider font-semibold">Casos Disc.</span>
                        {cases.length > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 mt-0.5 rounded text-xs font-bold text-amber-705 bg-amber-55 dark:bg-amber-955/30 border border-amber-200 dark:border-amber-900/50">
                            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-600" />
                            {cases.length}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Ninguno</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 relative px-4 sm:px-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Gestión de Cursos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Administra los grupos, directores y estadísticas de cada curso.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          <span>Nuevo Curso</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-visible">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar curso, director o nivel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            Cargando cursos académicos...
          </div>
        ) : (
          <>
            {/* Mobile View (Cards) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCourses.map((course) => {
                const directorName = course.director_detail
                  ? `${course.director_detail.first_name} ${course.director_detail.last_name}`
                  : "Sin Director";
                return (
                  <div
                    key={course.id}
                    onClick={() => handleViewStudents(course)}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-200 dark:border-blue-800/50">
                          {course.name.substring(0, 3)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                            {course.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {course.level}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                          <Users className="w-3 h-3" /> {course.students} est.
                        </div>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === course.id ? null : course.id);
                            }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {activeDropdown === course.id && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-850 shadow-lg border border-slate-200 dark:border-slate-750 rounded-lg py-1 z-10 w-28"
                            >
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleViewStudents(course);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-750 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-750"
                              >
                                <Users className="w-3.5 h-3.5" /> Estudiantes
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  openEditModal(course);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-750 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-750"
                              >
                                <Edit className="w-3.5 h-3.5" /> Editar
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleDelete(course.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                              >
                                <Trash className="w-3.5 h-3.5" /> Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                      <div
                        onClick={(e) => {
                          if (course.director_detail) {
                            e.stopPropagation();
                            setSelectedTeacherForProfile(course.director_detail);
                          }
                        }}
                        className={course.director_detail ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
                      >
                        <span className="text-xs text-slate-400 block mb-0.5">
                          Director
                        </span>
                        <div className="flex items-center gap-1 text-xs">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium underline decoration-dotted decoration-blue-500">
                            {directorName}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block mb-0.5">
                          Prom. Rendimiento
                        </span>
                        <div className="flex items-center gap-1 text-xs">
                          <Activity className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {course.avgGrade}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 dark:border-slate-800/50">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Asistencia:{" "}
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {course.attendance}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto relative">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Curso</th>
                    <th className="px-6 py-4">Nivel</th>
                    <th className="px-6 py-4">Director de Grupo</th>
                    <th className="px-6 py-4 text-center">Estudiantes</th>
                    <th className="px-6 py-4 text-center">Promedio</th>
                    <th className="px-6 py-4 text-center">Asistencia</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCourses.map((course) => {
                    const directorName = course.director_detail
                      ? `${course.director_detail.first_name} ${course.director_detail.last_name}`
                      : "Sin Director";
                    return (
                      <tr
                        key={course.id}
                        onClick={() => handleViewStudents(course)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-200 dark:border-blue-800/50">
                              {course.name.substring(0, 3)}
                            </div>
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-100">
                                {course.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {course.level}
                          </span>
                        </td>
                        <td 
                          className="px-6 py-4"
                          onClick={(e) => {
                            if (course.director_detail) {
                              e.stopPropagation();
                              setSelectedTeacherForProfile(course.director_detail);
                            }
                          }}
                        >
                          <div className={`flex items-center gap-2 ${course.director_detail ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}>
                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-405 flex items-center justify-center font-bold text-[10px]">
                              {directorName.charAt(0)}
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium underline decoration-dotted decoration-blue-500">
                              {directorName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <Users className="w-4 h-4 text-slate-400" />
                            {course.students}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {course.avgGrade}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {course.attendance}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === course.id ? null : course.id);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          {activeDropdown === course.id && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-6 top-12 mt-1 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 z-20 w-36"
                            >
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleViewStudents(course);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left"
                              >
                                <Users className="w-4 h-4 text-slate-500" /> Estudiantes
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  openEditModal(course);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left"
                              >
                                <Edit className="w-4 h-4 text-slate-500" /> Editar
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  handleDelete(course.id);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 text-left"
                              >
                                <Trash className="w-4 h-4 text-red-500" /> Eliminar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredCourses.length === 0 && (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                  No se encontraron cursos que coincidan con la búsqueda.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all scale-100">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingCourse ? "Editar Curso" : "Nuevo Curso Académico"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nombre del Curso *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: Grado 6A, Sexto Uno, Especial 1"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nivel Educativo
                </label>
                <select
                  value={courseLevel}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="Preescolar">Preescolar</option>
                  <option value="Básica Primaria">Básica Primaria</option>
                  <option value="Básica Secundaria">Básica Secundaria</option>
                  <option value="Media Académica">Media Académica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Grado Asociado *
                </label>
                <select
                  required
                  value={courseDegree}
                  onChange={(e) => setCourseDegree(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="">Seleccione un grado...</option>
                  {getOfferedDegreesForLevel(courseLevel).map((deg) => (
                    <option key={deg} value={deg}>
                      {deg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Director de Grupo
                </label>
                <select
                  value={courseDirector}
                  onChange={(e) => setCourseDirector(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="">Seleccione un docente...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.first_name} {t.last_name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                >
                  {editingCourse ? "Guardar Cambios" : "Crear Curso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTeacherForProfile && (
        <TeacherProfile 
          teacher={selectedTeacherForProfile} 
          onBack={() => setSelectedTeacherForProfile(null)} 
        />
      )}
    </div>
  );
}
export default CoursesModule;
