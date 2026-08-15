import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Save,
  Building2,
  Sliders,
  Users,
  Layers,
  Check,
  Clock,
} from "lucide-react";
import { AuditLogViewer } from "@/shared/components/AuditLogViewer";
import { institutionApi } from "../services/api";
import { curriculumApi } from "@/features/curriculum/services/api";
import type { Area, Subject, Course } from "@/features/curriculum/types";
import {
  LevelGroup,
  RoleItem,
  DEFAULT_ROLES_LIST,
  INITIAL_LEVEL_GROUPS,
} from "../constants/institutionDefaults";
import { InstitutionGeneralTab } from "./tabs/InstitutionGeneralTab";
import { AcademicConfigTab, BreakConfig } from "./tabs/AcademicConfigTab";
import { RolesPermissionsTab } from "./tabs/RolesPermissionsTab";
import { CurriculumSettingsTab } from "./tabs/CurriculumSettingsTab";
import { PermissionEditModal } from "./modals/PermissionEditModal";

export function SettingsModule() {
  const [activeTab, setActiveTab] = useState<"institution" | "account" | "roles" | "history" | "curriculum">(
    "institution"
  );
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- Curriculum (Areas and Subjects) States ---
  const [areas, setAreas] = useState<Area[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [searchAreaTerm, setSearchAreaTerm] = useState("");
  const [searchSubjectTerm, setSearchSubjectTerm] = useState("");
  const [filterSubjectArea, setFilterSubjectArea] = useState("");

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

  // Dropdown/Menu toggles
  const [activeAreaDropdown, setActiveAreaDropdown] = useState<number | null>(null);
  const [activeSubjectDropdown, setActiveSubjectDropdown] = useState<number | null>(null);

  const loadCurriculumData = async () => {
    setCurriculumLoading(true);
    try {
      const [areasData, subjectsData, coursesData] = await Promise.all([
        curriculumApi.getAreas(),
        curriculumApi.getSubjects(),
        curriculumApi.getCourses(),
      ]);
      setAreas(areasData);
      setSubjects(subjectsData);
      setCourses(coursesData);
    } catch (err) {
      console.error("Error al cargar currículo:", err);
    } finally {
      setCurriculumLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "curriculum") {
      loadCurriculumData();
    }
  }, [activeTab]);

  const handleSeedLey115 = async () => {
    if (!confirm("¿Desea precargar las 9 áreas del conocimiento obligatorias según la Ley 115 (MEN Colombia)?")) return;
    setIsSeeding(true);
    try {
      await curriculumApi.seedLey115();
      await loadCurriculumData();
      setSaveSuccessMessage("Plan de estudios Ley 115 precargado con éxito");
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error al precargar Ley 115:", err);
      alert("Error al precargar la estructura de la Ley 115");
    } finally {
      setIsSeeding(false);
    }
  };

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
      const payload = { name: areaName, description: areaDescription || undefined, is_active: true };
      if (editingArea) {
        await curriculumApi.updateArea(editingArea.id, payload);
      } else {
        await curriculumApi.createArea(payload);
      }
      await loadCurriculumData();
      setIsAreaModalOpen(false);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || "Error al guardar el área académica";
      alert(msg);
    }
  };

  const handleAreaDelete = async (area: Area) => {
    setActiveAreaDropdown(null);
    if (area.is_mandatory && isFormalEducation) {
      setErrorMessage(`El área "${area.name}" es obligatoria según la Ley 115 de 1994 y no se puede eliminar mientras el Régimen Formal esté activo.`);
      return;
    }
    try {
      await curriculumApi.deleteArea(area.id);
      await loadCurriculumData();
      setErrorMessage(null);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || "Error al eliminar el área académica";
      setErrorMessage(msg);
    }
  };

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
      const payload = { name: subjectName, description: subjectDescription || undefined, area: Number(subjectAreaId), courses: subjectCourses, is_active: true };
      if (editingSubject) {
        await curriculumApi.updateSubject(editingSubject.id, payload);
      } else {
        await curriculumApi.createSubject(payload);
      }
      await loadCurriculumData();
      setIsSubjectModalOpen(false);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || "Error al guardar la asignatura";
      alert(msg);
    }
  };

  const handleSubjectDelete = async (subject: Subject) => {
    setActiveSubjectDropdown(null);
    try {
      await curriculumApi.deleteSubject(subject.id);
      await loadCurriculumData();
      setErrorMessage(null);
    } catch (err: any) {
      console.error("Error al eliminar la asignatura:", err);
      const msg = err.response?.data?.detail || "Error al eliminar la asignatura";
      setErrorMessage(msg);
    }
  };

  const handleToggleCourseForSubject = (courseId: number) => {
    setSubjectCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  // Institution General Details
  const [institutionName, setInstitutionName] = useState("Colegio San Juan Bosco");
  const [daneNit, setDaneNit] = useState("111001103421");
  const [address, setAddress] = useState("Calle 100 # 15-20, Bogotá D.C.");
  const [phone, setPhone] = useState("+57 (601) 555-0199");
  const [email, setEmail] = useState("contacto@sanjuanbosco.edu.co");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isFormalEducation, setIsFormalEducation] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Academic Configuration
  const [academicYear, setAcademicYear] = useState("2024");
  const [currentPeriod, setCurrentPeriod] = useState("Segundo Periodo");
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("15:00");
  const [classDuration, setClassDuration] = useState("60 min");
  const [breaks, setBreaks] = useState<BreakConfig[]>([]);

  // Grading System Configuration
  const [generalScale, setGeneralScale] = useState<"numeric_1_5" | "numeric_0_100" | "qualitative" | "national_col">("numeric_1_5");
  const [decimalPrecision, setDecimalPrecision] = useState<"1" | "2">("1");
  const [minPassingGrade, setMinPassingGrade] = useState("3.0");
  const [independentScaleByCourse, setIndependentScaleByCourse] = useState(true);

  // Educational Levels & Grades Offered
  const [levelGroups, setLevelGroups] = useState<LevelGroup[]>(INITIAL_LEVEL_GROUPS);

  // Roles y Permisos
  const [roles, setRoles] = useState<RoleItem[]>(DEFAULT_ROLES_LIST);
  const [editingRoleId, setEditingRoleId] = useState<string | null>("admin");
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const data = await institutionApi.getSettings();
      if (data) {
        if (data.institution_name) setInstitutionName(data.institution_name);
        if (data.dane_nit) setDaneNit(data.dane_nit);
        if (data.address) setAddress(data.address);
        if (data.phone) setPhone(data.phone);
        if (data.email) setEmail(data.email);
        if (data.logo) setLogoPreview(data.logo);
        if (data.is_formal_education !== undefined) setIsFormalEducation(data.is_formal_education);

        if (data.settings_json?.academic) {
          const ac = data.settings_json.academic;
          if (ac.academic_year) setAcademicYear(ac.academic_year);
          if (ac.current_period) setCurrentPeriod(ac.current_period);
          if (ac.start_time) setStartTime(ac.start_time);
          if (ac.end_time) setEndTime(ac.end_time);
          if (ac.class_duration) setClassDuration(ac.class_duration);
        }

        if (data.settings_json?.grading) {
          const gr = data.settings_json.grading;
          if (gr.general_scale) setGeneralScale(gr.general_scale);
          if (gr.decimal_precision) setDecimalPrecision(gr.decimal_precision);
          if (gr.min_passing_grade) setMinPassingGrade(gr.min_passing_grade);
          if (gr.independent_scale !== undefined) setIndependentScaleByCourse(gr.independent_scale);
        }

        if (data.settings_json?.level_groups && Array.isArray(data.settings_json.level_groups)) {
          setLevelGroups(data.settings_json.level_groups);
        }

        if (data.settings_json?.roles_permissions) {
          const savedRolesPerms = data.settings_json.roles_permissions;
          setRoles((prevRoles) =>
            prevRoles.map((role) => {
              if (savedRolesPerms[role.id] && Array.isArray(savedRolesPerms[role.id])) {
                return { ...role, permissions: savedRolesPerms[role.id] };
              }
              return role;
            })
          );
        }
        if (data.settings_json?.breaks && Array.isArray(data.settings_json.breaks)) {
          setBreaks(data.settings_json.breaks);
        } else {
          setBreaks([]);
        }
      }
    } catch (err) {
      console.error("Error al cargar la configuración de la institución:", err);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    curriculumApi.getCourses().then(setCourses).catch(console.error);
  }, [loadSettings]);

  const toggleGrade = (levelId: string, gradeId: string) => {
    setLevelGroups((prev) =>
      prev.map((group) => {
        if (group.levelId === levelId) {
          const updatedGrades = group.grades.map((grade) =>
            grade.id === gradeId ? { ...grade, enabled: !grade.enabled } : grade
          );
          const updatedCiclos = group.ciclos?.map((ciclo) => ({
            ...ciclo,
            grados: ciclo.grados.map((grade) =>
              grade.id === gradeId ? { ...grade, enabled: !grade.enabled } : grade
            ),
          }));
          return {
            ...group,
            grades: updatedGrades,
            ciclos: updatedCiclos,
          };
        }
        return group;
      })
    );
  };

  const changeLevelGradingScale = (levelId: string, scale: string) => {
    setLevelGroups((prev) =>
      prev.map((group) =>
        group.levelId === levelId ? { ...group, gradingScale: scale } : group
      )
    );
  };

  const togglePermission = (roleId: string, permName: string) => {
    if (roleId === "admin") return;
    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id !== roleId) return role;
        const hasPerm = role.permissions.includes(permName);
        return {
          ...role,
          permissions: hasPerm
            ? role.permissions.filter((p) => p !== permName)
            : [...role.permissions, permName],
        };
      })
    );
  };

  const toggleCategoryPermissions = (roleId: string, categoryPermNames: string[]) => {
    if (roleId === "admin") return;
    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id !== roleId) return role;
        const allSelected = categoryPermNames.every((pName) =>
          role.permissions.includes(pName)
        );
        let newPerms: string[];
        if (allSelected) {
          newPerms = role.permissions.filter((p) => !categoryPermNames.includes(p));
        } else {
          const added = categoryPermNames.filter((p) => !role.permissions.includes(p));
          newPerms = [...role.permissions, ...added];
        }
        return { ...role, permissions: newPerms };
      })
    );
  };

  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const rolesPermissionsMap: Record<string, string[]> = {};
      roles.forEach((r) => {
        rolesPermissionsMap[r.id] = r.permissions;
      });

      const payload = {
        institution_name: institutionName,
        dane_nit: daneNit,
        address: address,
        phone: phone,
        email: email,
        is_formal_education: isFormalEducation,
        settings_json: {
          academic: {
            academic_year: academicYear,
            current_period: currentPeriod,
            start_time: startTime,
            end_time: endTime,
            class_duration: classDuration,
          },
          grading: {
            general_scale: generalScale,
            decimal_precision: decimalPrecision,
            min_passing_grade: minPassingGrade,
            independent_scale: independentScaleByCourse,
          },
          level_groups: levelGroups,
          roles_permissions: rolesPermissionsMap,
          breaks: breaks,
        },
      };

      await institutionApi.updateSettings(payload);
      setSaveSuccessMessage("Configuración general guardada exitosamente.");
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Error al guardar configuración:", err);
      alert("Error al guardar los cambios en el servidor.");
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Header General */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Configuración General de la Institución
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Administra los datos institucionales, jornada escolar, escalas de evaluación y plan de estudios
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveGeneralSettings}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Cambios</span>
        </button>
      </div>

      {saveSuccessMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          {saveSuccessMessage}
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1 overflow-x-auto p-1.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
        <button
          onClick={() => setActiveTab("institution")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "institution"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Identidad Institucional</span>
        </button>

        <button
          onClick={() => setActiveTab("account")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "account"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Calendario y Evaluación</span>
        </button>

        <button
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "roles"
              ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Roles y Permisos</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "history"
              ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Auditoría de Logs</span>
        </button>

        <button
          onClick={() => setActiveTab("curriculum")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "curriculum"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Plan de Estudios (Áreas / Materias)</span>
        </button>
      </div>

      {/* Tab 1: Identidad Institucional */}
      {activeTab === "institution" && (
        <InstitutionGeneralTab
          institutionName={institutionName}
          setInstitutionName={setInstitutionName}
          daneNit={daneNit}
          setDaneNit={setDaneNit}
          address={address}
          setAddress={setAddress}
          phone={phone}
          setPhone={setPhone}
          email={email}
          setEmail={setEmail}
          logoPreview={logoPreview}
          setLogoPreview={setLogoPreview}
          isFormalEducation={isFormalEducation}
          setIsFormalEducation={setIsFormalEducation}
          fileInputRef={fileInputRef}
        />
      )}

      {/* Tab 2: Calendario y Evaluación */}
      {activeTab === "account" && (
        <AcademicConfigTab
          academicYear={academicYear}
          setAcademicYear={setAcademicYear}
          currentPeriod={currentPeriod}
          setCurrentPeriod={setCurrentPeriod}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          classDuration={classDuration}
          setClassDuration={setClassDuration}
          generalScale={generalScale}
          setGeneralScale={setGeneralScale}
          decimalPrecision={decimalPrecision}
          setDecimalPrecision={setDecimalPrecision}
          minPassingGrade={minPassingGrade}
          setMinPassingGrade={setMinPassingGrade}
          independentScaleByCourse={independentScaleByCourse}
          setIndependentScaleByCourse={setIndependentScaleByCourse}
          levelGroups={levelGroups}
          changeLevelGradingScale={changeLevelGradingScale}
          toggleGrade={toggleGrade}
          isFormalEducation={isFormalEducation}
          breaks={breaks}
          setBreaks={setBreaks}
          courses={courses}
        />
      )}

      {/* Tab 3: Roles y Permisos */}
      {activeTab === "roles" && (
        <RolesPermissionsTab
          roles={roles}
          editingRoleId={editingRoleId}
          setEditingRoleId={setEditingRoleId}
          togglePermission={togglePermission}
          setIsPermissionModalOpen={setIsPermissionModalOpen}
        />
      )}

      {/* Tab 3.5: Auditoría de Logs */}
      {activeTab === "history" && (
        <AuditLogViewer onRestoreSuccess={loadSettings} module="" />
      )}

      {/* Tab 4: Plan de Estudios */}
      {activeTab === "curriculum" && (
        <CurriculumSettingsTab
          isFormalEducation={isFormalEducation}
          isSeeding={isSeeding}
          handleSeedLey115={handleSeedLey115}
          curriculumLoading={curriculumLoading}
          areas={areas}
          subjects={subjects}
          courses={courses}
          searchAreaTerm={searchAreaTerm}
          setSearchAreaTerm={setSearchAreaTerm}
          searchSubjectTerm={searchSubjectTerm}
          setSearchSubjectTerm={setSearchSubjectTerm}
          filterSubjectArea={filterSubjectArea}
          setFilterSubjectArea={setFilterSubjectArea}
          activeAreaDropdown={activeAreaDropdown}
          setActiveAreaDropdown={setActiveAreaDropdown}
          activeSubjectDropdown={activeSubjectDropdown}
          setActiveSubjectDropdown={setActiveSubjectDropdown}
          openCreateAreaModal={openCreateAreaModal}
          openEditAreaModal={openEditAreaModal}
          handleAreaDelete={handleAreaDelete}
          openCreateSubjectModal={openCreateSubjectModal}
          openEditSubjectModal={openEditSubjectModal}
          handleSubjectDelete={handleSubjectDelete}
          isAreaModalOpen={isAreaModalOpen}
          setIsAreaModalOpen={setIsAreaModalOpen}
          editingArea={editingArea}
          areaName={areaName}
          setAreaName={setAreaName}
          areaDescription={areaDescription}
          setAreaDescription={setAreaDescription}
          handleAreaSubmit={handleAreaSubmit}
          isSubjectModalOpen={isSubjectModalOpen}
          setIsSubjectModalOpen={setIsSubjectModalOpen}
          editingSubject={editingSubject}
          subjectName={subjectName}
          setSubjectName={setSubjectName}
          subjectDescription={subjectDescription}
          setSubjectDescription={setSubjectDescription}
          subjectAreaId={subjectAreaId}
          setSubjectAreaId={setSubjectAreaId}
          subjectCourses={subjectCourses}
          handleToggleCourseForSubject={handleToggleCourseForSubject}
          handleSubjectSubmit={handleSubjectSubmit}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      )}

      {/* Modal Global de Permisos */}
      <PermissionEditModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        roles={roles}
        editingRoleId={editingRoleId}
        setEditingRoleId={setEditingRoleId}
        togglePermission={togglePermission}
        toggleCategoryPermissions={toggleCategoryPermissions}
      />
    </div>
  );
}
