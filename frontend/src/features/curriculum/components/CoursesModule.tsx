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
  Layers,
  Check,
} from "lucide-react";
import { curriculumApi } from "../services/api";
import type { Course, Teacher, Area, Subject } from "../types";
import { institutionApi } from "@/features/institution/services/api";
import type { InstitutionSettingData } from "@/features/institution/types";
import { enrollmentApi } from "@/features/enrollment/services/api";
import type { Student } from "@/features/enrollment/types/student.types";
import { TeacherProfile } from "./TeacherProfile";

type TabType = "courses" | "areas" | "subjects";
type CourseSubTabType = "students" | "subjects";

export function CoursesModule() {
  const [activeTab, setActiveTab] = useState<TabType>("courses");

  // Core loaded states
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [settings, setSettings] = useState<InstitutionSettingData | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search terms
  const [searchTerm, setSearchTerm] = useState("");
  const [searchAreaTerm, setSearchAreaTerm] = useState("");
  const [searchSubjectTerm, setSearchSubjectTerm] = useState("");

  // Filter states
  const [filterSubjectArea, setFilterSubjectArea] = useState<string>("");

  // Course Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseName, setCourseName] = useState("");
  const [courseLevel, setCourseLevel] = useState("Básica Secundaria");
  const [courseDegree, setCourseDegree] = useState("");
  const [courseDirector, setCourseDirector] = useState<string>("");

  // Area Modal states
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [areaName, setAreaName] = useState("");
  const [areaDescription, setAreaDescription] = useState("");

  // Subject Modal states
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [subjectDescription, setSubjectDescription] = useState("");
  const [subjectAreaId, setSubjectAreaId] = useState("");
  const [subjectCourses, setSubjectCourses] = useState<number[]>([]);

  // Dropdown states for each row
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [activeAreaDropdown, setActiveAreaDropdown] = useState<number | null>(null);
  const [activeSubjectDropdown, setActiveSubjectDropdown] = useState<number | null>(null);

  // Detailed Course view states
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<Course | null>(null);
  const [courseSubTab, setCourseSubTab] = useState<CourseSubTabType>("students");
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Profiles view states
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [selectedTeacherForProfile, setSelectedTeacherForProfile] = useState<Teacher | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesData, teachersData, settingsData, areasData, subjectsData] = await Promise.all([
        curriculumApi.getCourses(),
        curriculumApi.getTeachers(),
        institutionApi.getSettings(),
        curriculumApi.getAreas(),
        curriculumApi.getSubjects(),
      ]);
      setCourses(coursesData);
      setTeachers(teachersData);
      setSettings(settingsData);
      setAreas(areasData);
      setSubjects(subjectsData);
    } catch (err: any) {
      console.error(err);
      setError("No se pudieron cargar los datos curriculares.");
    } finally {
      setLoading(false);
    }
  };

  // --- COURSE ACTIONS ---
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

  const handleViewStudents = async (course: Course) => {
    setSelectedCourseForStudents(course);
    setCourseSubTab("students");
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

  // --- AREA ACTIONS ---
  const openCreateAreaModal = () => {
    setEditingArea(null);
    setAreaName("");
    setAreaDescription("");
    setIsAreaModalOpen(true);
  };

  const openEditAreaModal = (area: Area) => {
    setEditingArea(area);
    setAreaName(area.name);
    setAreaDescription(area.description || "");
    setIsAreaModalOpen(true);
    setActiveAreaDropdown(null);
  };

  const handleAreaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaName.trim()) return;

    try {
      const payload = {
        name: areaName,
        description: areaDescription || undefined,
        is_active: true
      };

      if (editingArea) {
        const updated = await curriculumApi.updateArea(editingArea.id, payload);
        setAreas((prev) => prev.map((a) => (a.id === editingArea.id ? updated : a)));
      } else {
        const created = await curriculumApi.createArea(payload);
        setAreas((prev) => [...prev, created]);
      }
      setIsAreaModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar el área académica");
    }
  };

  const handleAreaDelete = async (id: number) => {
    try {
      await curriculumApi.deleteArea(id);
      setAreas((prev) => prev.filter((a) => a.id !== id));
      const subjectsData = await curriculumApi.getSubjects();
      setSubjects(subjectsData);
      setActiveAreaDropdown(null);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el área");
    }
  };

  // --- SUBJECT ACTIONS ---
  const openCreateSubjectModal = () => {
    setEditingSubject(null);
    setSubjectName("");
    setSubjectDescription("");
    setSubjectAreaId(areas[0] ? String(areas[0].id) : "");
    setSubjectCourses([]);
    setIsSubjectModalOpen(true);
  };

  const openEditSubjectModal = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectName(subject.name);
    setSubjectDescription(subject.description || "");
    setSubjectAreaId(String(subject.area));
    setSubjectCourses(subject.courses || []);
    setIsSubjectModalOpen(true);
    setActiveSubjectDropdown(null);
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !subjectAreaId) return;

    try {
      const payload = {
        name: subjectName,
        description: subjectDescription || undefined,
        area: Number(subjectAreaId),
        courses: subjectCourses,
        is_active: true
      };

      if (editingSubject) {
        const updated = await curriculumApi.updateSubject(editingSubject.id, payload);
        setSubjects((prev) => prev.map((s) => (s.id === editingSubject.id ? updated : s)));
      } else {
        const created = await curriculumApi.createSubject(payload);
        setSubjects((prev) => [...prev, created]);
      }
      setIsSubjectModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar la asignatura");
    }
  };

  const handleSubjectDelete = async (subject: Subject) => {
    setActiveSubjectDropdown(null);
    try {
      await curriculumApi.deleteSubject(subject.id);
      setSubjects((prev) => prev.filter((s) => s.id !== subject.id));
      const updatedCourses = await curriculumApi.getCourses();
      setCourses(updatedCourses);
    } catch (err: any) {
      console.error("Error al eliminar la asignatura:", err);
      const msg = err.response?.data?.detail || "Error al eliminar la asignatura";
      alert(msg);
    }
  };

  const handleToggleCourseForSubject = (courseId: number) => {
    setSubjectCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  // --- FILTERING ---
  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.director_detail &&
        `${course.director_detail.first_name} ${course.director_detail.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      course.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAreas = areas.filter(
    (area) =>
      area.name.toLowerCase().includes(searchAreaTerm.toLowerCase()) ||
      (area.description && area.description.toLowerCase().includes(searchAreaTerm.toLowerCase()))
  );

  const filteredSubjects = subjects.filter((subj) => {
    const matchesSearch =
      subj.name.toLowerCase().includes(searchSubjectTerm.toLowerCase()) ||
      (subj.description && subj.description.toLowerCase().includes(searchSubjectTerm.toLowerCase())) ||
      (subj.area_detail && subj.area_detail.name.toLowerCase().includes(searchSubjectTerm.toLowerCase()));

    const matchesArea = filterSubjectArea ? subj.area === Number(filterSubjectArea) : true;
    return matchesSearch && matchesArea;
  });

  const getSubjectsForSelectedCourse = () => {
    if (!selectedCourseForStudents) return [];
    return subjects.filter((subj) => subj.courses.includes(selectedCourseForStudents.id));
  };

  // Helper to group course subjects by Area
  const getGroupedSubjectsForCourse = () => {
    const courseSubjects = getSubjectsForSelectedCourse();
    const groups: { [areaName: string]: Subject[] } = {};

    courseSubjects.forEach((subj) => {
      const areaName = subj.area_detail?.name || "Otras Áreas";
      if (!groups[areaName]) {
        groups[areaName] = [];
      }
      groups[areaName].push(subj);
    });

    return groups;
  };

  if (selectedStudentForProfile && selectedCourseForStudents) {
    const perf = selectedStudentForProfile.performance || { gpa: 4.0, attendance: 95, lastPeriodRank: "1/30" };
    const cases = selectedStudentForProfile.disciplineCases || [];
    const profile = selectedStudentForProfile.profile || {};

    return (
      <div className="max-w-6xl mx-auto pb-12 relative px-4 sm:px-6">
        {/* Breadcrumbs Trail */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
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
          <span className="text-slate-450 dark:text-slate-500 font-medium">
            {selectedStudentForProfile.first_name} {selectedStudentForProfile.last_name}
          </span>
        </nav>

        {/* Student Profile Overview Card */}
        <div className="mb-8 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-2xl mb-4 border-2 border-blue-200 dark:border-blue-800/50">
                {selectedStudentForProfile.first_name.charAt(0)}{selectedStudentForProfile.last_name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {selectedStudentForProfile.first_name} {selectedStudentForProfile.last_name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{selectedStudentForProfile.email}</p>

              <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4 text-left">
                <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Información Personal</h3>

                <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{profile.phone || "Sin teléfono registrado"}</span>
                </div>

                <div className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <span>{profile.address || "Sin dirección registrada"}</span>
                </div>

                {profile.birth_date && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Nacido el {new Date(profile.birth_date).toLocaleDateString()}</span>
                  </div>
                )}
                {profile.blood_type && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <Activity className="w-4 h-4 text-slate-405" />
                    <span>RH: {profile.blood_type}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Guardian Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-4">Información del Acudiente</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {profile.guardian_name || "Sin acudiente"}
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-450 font-medium">
                    {profile.guardian_relation || "Acudiente"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-305">
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

          <div className="w-full md:w-2/3 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 text-lg">
                Resumen Académico
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Promedio Gral
                  </span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {perf.gpa}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-805/40">
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Asistencia
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {perf.attendance}%
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Puesto (Curso)
                  </span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {perf.lastPeriodRank}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2 mb-6">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Historial de Convivencia
              </h3>

              {cases.length > 0 ? (
                <div className="space-y-3">
                  {cases.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
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
                          <Calendar className="w-3.5 h-3.5" /> {c.date} &bull; Estatus: {c.status}
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
    const groupedSubjects = getGroupedSubjectsForCourse();
    const areaKeys = Object.keys(groupedSubjects);

    return (
      <div className="max-w-6xl mx-auto pb-12 relative px-4 sm:px-6">
        {/* Breadcrumbs Trail */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
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
          <span className="text-slate-450 dark:text-slate-500 uppercase text-xs tracking-wider font-bold">
            {courseSubTab === "students" ? "Estudiantes" : "Asignaturas"}
          </span>
        </nav>

        {/* Course detail header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-850/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              <span>{selectedCourseForStudents.name}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Nivel: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedCourseForStudents.level}</span>
              {selectedCourseForStudents.degree && (
                <> &bull; Grado: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedCourseForStudents.degree}</span></>
              )}
            </p>
          </div>
          <div
            onClick={() => selectedCourseForStudents.director_detail && setSelectedTeacherForProfile(selectedCourseForStudents.director_detail)}
            className={`flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 ${selectedCourseForStudents.director_detail ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/85 transition-colors' : ''}`}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
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

        {/* Sub-navigation Tabs */}
        <div className="mb-6 border-b border-slate-200 dark:border-slate-700 flex gap-4">
          <button
            onClick={() => setCourseSubTab("students")}
            className={`pb-3 font-semibold text-sm transition-all relative ${courseSubTab === "students"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Estudiantes ({students.length})
            </span>
          </button>
          <button
            onClick={() => setCourseSubTab("subjects")}
            className={`pb-3 font-semibold text-sm transition-all relative ${courseSubTab === "subjects"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200"
              }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Asignaturas Dictadas ({getSubjectsForSelectedCourse().length})
            </span>
          </button>
        </div>

        {/* Sub-tab Content */}
        {courseSubTab === "students" ? (
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
                  const gpaColor = perf.gpa >= 4.0 ? "text-emerald-600 dark:text-emerald-455 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50" :
                    perf.gpa >= 3.0 ? "text-amber-600 dark:text-amber-450 bg-amber-50 dark:bg-amber-955/20 border-amber-200 dark:border-amber-900/50" :
                      "text-rose-600 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50";

                  return (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudentForProfile(student)}
                      className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 dark:hover:border-slate-700 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
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
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Promedio</span>
                          <span className={`inline-flex items-center px-2 py-0.5 mt-0.5 rounded text-xs font-bold border ${gpaColor}`}>
                            <Award className="w-3.5 h-3.5 mr-1" />
                            {perf.gpa}
                          </span>
                        </div>

                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Asistencia</span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-305 mt-1 flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5 text-blue-500" />
                            {perf.attendance}%
                          </span>
                        </div>

                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Casos Disc.</span>
                          {cases.length > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 mt-0.5 rounded text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-955/30 border border-amber-205 dark:border-amber-900/50">
                              <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-600" />
                              {cases.length}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-505 dark:text-slate-400 mt-1 font-medium">Ninguno</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-205 dark:border-slate-700 p-6">
            {areaKeys.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-medium">No hay asignaturas configuradas para este curso.</p>
                <p className="text-xs text-slate-400 mt-1">Asocia asignaturas a este curso desde la pestaña "Asignaturas".</p>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                {areaKeys.map((areaName) => (
                  <div key={areaName} className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-805 pb-2">
                      <Layers className="w-4 h-4 text-blue-500" />
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Área: {areaName}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {groupedSubjects[areaName].map((subj) => (
                        <div
                          key={subj.id}
                          className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                              {subj.name}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              {subj.description || "Sin descripción disponible."}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 relative px-4 sm:px-6">
      {/* Header based on active tab */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {activeTab === "courses" && "Gestión de Cursos"}
            {activeTab === "areas" && "Áreas Académicas"}
            {activeTab === "subjects" && "Gestión de Asignaturas"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {activeTab === "courses" && "Administra los grupos, directores y estadísticas de cada curso."}
            {activeTab === "areas" && "Configura las áreas que agrupan las asignaturas de la institución."}
            {activeTab === "subjects" && "Administra y configura las asignaturas/materias dictadas y sus cursos asociados."}
          </p>
        </div>

        {activeTab === "courses" && (
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Nuevo Curso</span>
          </button>
        )}

        {activeTab === "areas" && (
          <button
            onClick={openCreateAreaModal}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Layers className="w-4 h-4" />
            <span>Nueva Área</span>
          </button>
        )}

        {activeTab === "subjects" && (
          <button
            onClick={openCreateSubjectModal}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Nueva Asignatura</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="mb-6 border-b border-slate-200 dark:border-slate-700 flex gap-4">
        <button
          onClick={() => { setActiveTab("courses"); setSearchTerm(""); }}
          className={`pb-3 font-semibold text-sm transition-all relative ${activeTab === "courses"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
        >
          Cursos
        </button>
        <button
          onClick={() => { setActiveTab("areas"); setSearchAreaTerm(""); }}
          className={`pb-3 font-semibold text-sm transition-all relative ${activeTab === "areas"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200"
            }`}
        >
          Áreas Académicas
        </button>
        <button
          onClick={() => { setActiveTab("subjects"); setSearchSubjectTerm(""); setFilterSubjectArea(""); }}
          className={`pb-3 font-semibold text-sm transition-all relative ${activeTab === "subjects"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200"
            }`}
        >
          Asignaturas
        </button>
      </div>

      {/* TABS CONTENT */}

      {/* 1. COURSES TAB */}
      {activeTab === "courses" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-visible animate-fade-in">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-205 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
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
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-205 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-505 dark:text-slate-400">
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
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-805/50 transition-colors relative cursor-pointer"
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
                          <div className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 border border-slate-205 dark:border-slate-700">
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
                                className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-850 shadow-lg border border-slate-205 dark:border-slate-750 rounded-lg py-1 z-10 w-28"
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
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-955/30"
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
                            <span className="font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-405 underline decoration-dotted decoration-blue-500">
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

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 dark:border-slate-805/50">
                        <div className="flex items-center gap-1.5 text-xs text-slate-605 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-405" />
                          <span>
                            Asistencia:{" "}
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {course.attendance}
                            </span>
                          </span>
                        </div>
                        <span className="text-[10px] bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-bold">
                          {course.subjects_count || 0} asignaturas
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View (Table) */}
              <div className="hidden md:block overflow-x-auto relative">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white dark:bg-slate-900 border-b border-slate-205 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Curso</th>
                      <th className="px-6 py-4">Nivel</th>
                      <th className="px-6 py-4">Director de Grupo</th>
                      <th className="px-6 py-4 text-center">Asignaturas</th>
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
                          className="hover:bg-slate-50 dark:hover:bg-slate-805/50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-405 flex items-center justify-center font-bold text-sm border border-blue-200 dark:border-blue-800/50">
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
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-205 dark:border-slate-700">
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
                              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                                {directorName.charAt(0)}
                              </div>
                              <span className="text-sm text-slate-600 dark:text-slate-305 hover:text-blue-605 dark:hover:text-blue-400 font-medium underline decoration-dotted decoration-blue-500">
                                {directorName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-xs bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full font-bold border border-blue-105 dark:border-blue-900/50">
                              {course.subjects_count || 0}
                            </span>
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
                            <span className="text-sm text-slate-605 dark:text-slate-300">
                              {course.attendance}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(activeDropdown === course.id ? null : course.id);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-405 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                            {activeDropdown === course.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-6 top-12 mt-1 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-705 rounded-lg py-1.5 z-20 w-36"
                              >
                                <button
                                  onClick={() => {
                                    setActiveDropdown(null);
                                    handleViewStudents(course);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-205 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left"
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
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-left"
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
      )}

      {/* 2. AREAS TAB */}
      {activeTab === "areas" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-visible animate-fade-in">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar área académica..."
                value={searchAreaTerm}
                onChange={(e) => setSearchAreaTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-805 border border-slate-205 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              Cargando áreas académicas...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-705 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Nombre del Área</th>
                    <th className="px-6 py-4">Descripción</th>
                    <th className="px-6 py-4 text-center">Asignaturas</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAreas.map((area) => {
                    const areaSubjectsCount = subjects.filter((s) => s.area === area.id).length;
                    return (
                      <tr key={area.id} className="hover:bg-slate-50 dark:hover:bg-slate-808/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-105">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-blue-500" />
                            <span>{area.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm max-w-md truncate">
                          {area.description || <span className="text-slate-404 italic">Sin descripción</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-705 dark:text-slate-300 px-2 py-0.5 rounded font-bold border border-slate-200 dark:border-slate-700">
                            {areaSubjectsCount} asignaturas
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right relative">
                          <button
                            onClick={() => setActiveAreaDropdown(activeAreaDropdown === area.id ? null : area.id)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          {activeAreaDropdown === area.id && (
                            <div className="absolute right-6 top-10 mt-1 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-lg py-1 z-25 w-32 text-left">
                              <button
                                onClick={() => openEditAreaModal(area)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                              >
                                <Edit className="w-4 h-4 text-slate-500" /> Editar
                              </button>
                              <button
                                onClick={() => handleAreaDelete(area.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
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

              {filteredAreas.length === 0 && (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                  No hay áreas académicas registradas. Crea una nueva para comenzar.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. SUBJECTS TAB */}
      {activeTab === "subjects" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-visible animate-fade-in">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar asignatura..."
                value={searchSubjectTerm}
                onChange={(e) => setSearchSubjectTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-202 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-805 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterSubjectArea}
                onChange={(e) => setFilterSubjectArea(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              >
                <option value="">Todas las Áreas</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              Cargando asignaturas...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Asignatura</th>
                    <th className="px-6 py-4">Área Académica</th>
                    <th className="px-6 py-4">Descripción</th>
                    <th className="px-6 py-4 text-center">Cursos Configurados</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSubjects.map((subj) => {
                    return (
                      <tr key={subj.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">
                          {subj.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-905/50">
                            {subj.area_detail?.name || "Sin Área"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-606 dark:text-slate-400 text-sm max-w-sm truncate">
                          {subj.description || <span className="text-slate-400 italic">Sin descripción</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {subj.courses && subj.courses.length > 0 ? (
                            <div className="flex flex-wrap gap-1 justify-center max-w-xs mx-auto">
                              {subj.courses_detail?.map((c) => (
                                <span key={c.id} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-350">
                                  {c.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 px-2 py-0.5 rounded">
                              No asignada a cursos
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right relative">
                          <button
                            onClick={() => setActiveSubjectDropdown(activeSubjectDropdown === subj.id ? null : subj.id)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          {activeSubjectDropdown === subj.id && (
                            <div className="absolute right-6 top-10 mt-1 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-lg py-1 z-25 w-32 text-left">
                              <button
                                onClick={() => openEditSubjectModal(subj)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                              >
                                <Edit className="w-4 h-4 text-slate-500" /> Editar
                              </button>
                              <button
                                onClick={() => handleSubjectDelete(subj)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-955/20"
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

              {filteredSubjects.length === 0 && (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                  No se encontraron asignaturas. Crea una nueva para comenzar.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- MODAL DIALOGS --- */}

      {/* 1. COURSE FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingCourse ? "Editar Curso" : "Nuevo Curso Académico"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
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
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-202 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-505 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nivel Educativo
                </label>
                <select
                  value={courseLevel}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-505 outline-none"
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
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-505 outline-none"
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
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-202 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-505 outline-none"
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

      {/* 2. AREA FORM MODAL */}
      {isAreaModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingArea ? "Editar Área Académica" : "Nueva Área Académica"}
              </h2>
              <button onClick={() => setIsAreaModalOpen(false)} className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAreaSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nombre del Área *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: Ciencias Exactas, Humanidades"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Descripción
                </label>
                <textarea
                  placeholder="Descripción detallada de esta área académica."
                  value={areaDescription}
                  onChange={(e) => setAreaDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-205 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAreaModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-205 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                >
                  {editingArea ? "Guardar Cambios" : "Crear Área"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SUBJECT FORM MODAL */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-202 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingSubject ? "Editar Asignatura" : "Nueva Asignatura"}
              </h2>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubjectSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Nombre de la Asignatura *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Matemáticas, Biología, Español"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Área Académica *
                  </label>
                  <select
                    required
                    value={subjectAreaId}
                    onChange={(e) => setSubjectAreaId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="">Seleccione un área...</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-505 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Descripción
                </label>
                <textarea
                  placeholder="Detalles sobre los temas o carga académica."
                  value={subjectDescription}
                  onChange={(e) => setSubjectDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              {/* Courses Many-to-Many Multi-Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Cursos donde se Imparte esta Asignatura
                </label>

                {courses.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hay cursos académicos registrados para asociar.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-805/30 custom-scrollbar">
                    {courses.map((course) => {
                      const isChecked = subjectCourses.includes(course.id);
                      return (
                        <div
                          key={course.id}
                          onClick={() => handleToggleCourseForSubject(course.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${isChecked
                              ? "bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-900/60 text-blue-700 dark:text-blue-400 font-semibold"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                            }`}
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${isChecked
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-slate-350 dark:border-slate-600"
                            }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{course.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  Las asignaturas solo aparecerán configuradas en los cursos marcados aquí.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-202 dark:border-slate-700 mt-6">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                >
                  {editingSubject ? "Guardar Cambios" : "Crear Asignatura"}
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
