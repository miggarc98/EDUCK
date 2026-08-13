import { useState, useRef, useEffect, useCallback } from "react";
import { institutionApi } from "../services/api";
import { useAuthStore } from "@/store/auth.store";
import { AuditLogViewer } from "@/shared/components/AuditLogViewer";
import {
  Building2,
  UserCircle,
  Bell,
  Lock,
  Shield,
  Image as ImageIcon,
  Save,
  GraduationCap,
  Sliders,
  Check,
  CheckCircle2,
  Users,
  Award,
  Layers,
  Clock,
  Key,
  X,
  AlertCircle,
  Edit3,
  Plus,
  Search,
  CheckSquare,
  Square,
  Info,
} from "lucide-react";

interface GradeItem {
  id: string;
  name: string;
  enabled: boolean;
}

interface LevelGroup {
  levelId: string;
  levelName: string;
  description: string;
  gradingScale: string;
  grades: GradeItem[];
}

interface RoleItem {
  id: string;
  name: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  usersCount: number;
  description: string;
  permissions: string[];
}

interface PermissionItem {
  id: string;
  name: string;
  description: string;
}

interface PermissionCategory {
  category: string;
  icon: any;
  permissions: PermissionItem[];
}

const PERMISSION_CATALOG: PermissionCategory[] = [
  {
    category: "Académico y Evaluación",
    icon: GraduationCap,
    permissions: [
      { id: "ingreso_notas", name: "Ingreso de Notas", description: "Registro y modificación de calificaciones por periodo." },
      { id: "planillas", name: "Planillas de Calificaciones", description: "Visualización e impresión de planillas docentes." },
      { id: "aprobacion_logros", name: "Aprobación de Logros", description: "Definición y validación de logros pedagógicos." },
      { id: "horario_escolar", name: "Horario Escolar", description: "Consulta e impresión de horarios por curso." },
      { id: "observador", name: "Observador del Estudiante", description: "Registro de anotaciones pedagógicas y conducta." },
      { id: "material_didactico", name: "Material Didáctico", description: "Subida y compartición de guías y contenidos." },
      { id: "descarga_boletines", name: "Descarga de Boletines", description: "Generación de reportes de boletines por periodo." },
      { id: "asistencia_diaria", name: "Asistencia Diaria", description: "Toma y control de asistencia a clases." },
      { id: "consulta_calificaciones", name: "Consulta de Calificaciones", description: "Acceso en solo lectura a notas registradas." },
    ],
  },
  {
    category: "Convivencia y Disciplina",
    icon: Shield,
    permissions: [
      { id: "gestion_convivencial", name: "Gestión Convivencial", description: "Registro y seguimiento de faltas leves y graves." },
      { id: "citacion_acudientes", name: "Citación a Acudientes", description: "Emisión de citaciones oficiales a padres de familia." },
      { id: "alertas_convivenciales", name: "Alertas Convivenciales", description: "Recepción de alertas automáticas disciplinarias." },
      { id: "atencion_padres", name: "Atención a Padres", description: "Gestión de agenda y compromisos con acudientes." },
    ],
  },
  {
    category: "Administración y Usuarios",
    icon: Users,
    permissions: [
      { id: "gestion_institucional", name: "Gestión Institucional", description: "Modificación de datos e identidad del colegio." },
      { id: "creacion_usuarios", name: "Creación de Usuarios", description: "Alta, edición y desactivación de perfiles de usuario." },
      { id: "asignacion_roles", name: "Asignación de Roles", description: "Configuración de perfiles y permisos de acceso." },
      { id: "matricula_estudiantes", name: "Matrícula de Estudiantes", description: "Inscripción de alumnos en cursos y grados." },
      { id: "reportes_academicos", name: "Reportes Académicos", description: "Estadísticas consolidadas de rendimiento." },
    ],
  },
  {
    category: "Seguridad y Auditoría",
    icon: Lock,
    permissions: [
      { id: "configuracion_global", name: "Configuración Global", description: "Parámetros avanzados de la plataforma." },
      { id: "gestion_licencias", name: "Gestión de Licencias", description: "Control del estado de suscripción del colegio." },
      { id: "auditoria_logs", name: "Auditoría de Logs", description: "Trazabilidad de acciones e inicios de sesión." },
    ],
  },
  {
    category: "Comunicación y Finanzas",
    icon: Bell,
    permissions: [
      { id: "mensajeria_institucional", name: "Mensajería Institucional", description: "Envío de circulares y comunicados masivos." },
      { id: "pagos_certificados", name: "Pagos y Certificados", description: "Generación de certificados de estudio y paz y salvos." },
      { id: "seguimiento_academico", name: "Seguimiento Académico", description: "Portal para acudientes sobre avance del estudiante." },
    ],
  },
];

export function SettingsModule() {
  const [activeTab, setActiveTab] = useState<"institution" | "account" | "history">(
    "institution"
  );
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Institution General Details
  const [institutionName, setInstitutionName] = useState("Colegio San Juan Bosco");
  const [daneNit, setDaneNit] = useState("111001103421");
  const [address, setAddress] = useState("Calle 100 # 15-20, Bogotá D.C.");
  const [phone, setPhone] = useState("+57 (601) 555-0199");
  const [email, setEmail] = useState("contacto@sanjuanbosco.edu.co");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Academic Configuration
  const [academicYear, setAcademicYear] = useState("2024");
  const [currentPeriod, setCurrentPeriod] = useState("Segundo Periodo");
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("15:00");
  const [classDuration, setClassDuration] = useState("60 min");

  // Grading System Configuration
  const [generalScale, setGeneralScale] = useState<"numeric_1_5" | "numeric_0_100" | "qualitative" | "national_col">("numeric_1_5");
  const [decimalPrecision, setDecimalPrecision] = useState<"1" | "2">("1");
  const [minPassingGrade, setMinPassingGrade] = useState("3.0");
  const [independentScaleByCourse, setIndependentScaleByCourse] = useState(true);

  // Educational Levels & Grades Offered
  const [levelGroups, setLevelGroups] = useState<LevelGroup[]>([
    {
      levelId: "preescolar",
      levelName: "Preescolar",
      description: "Nivel inicial para niños de 3 a 5 años.",
      gradingScale: "qualitative",
      grades: [
        { id: "prejardin", name: "Pre-Jardín", enabled: true },
        { id: "jardin", name: "Jardín", enabled: true },
        { id: "transicion", name: "Transición", enabled: true },
      ],
    },
    {
      levelId: "primaria",
      levelName: "Básica Primaria",
      description: "Grados de 1º a 5º de primaria.",
      gradingScale: "numeric_1_5",
      grades: [
        { id: "101", name: "Primero (1º)", enabled: true },
        { id: "201", name: "Segundo (2º)", enabled: true },
        { id: "301", name: "Tercero (3º)", enabled: true },
        { id: "401", name: "Cuarto (4º)", enabled: true },
        { id: "501", name: "Quinto (5º)", enabled: true },
      ],
    },
    {
      levelId: "secundaria",
      levelName: "Básica Secundaria",
      description: "Grados de 6º a 9º de bachillerato.",
      gradingScale: "numeric_1_5",
      grades: [
        { id: "601", name: "Sexto (6º)", enabled: true },
        { id: "701", name: "Séptimo (7º)", enabled: true },
        { id: "801", name: "Octavo (8º)", enabled: true },
        { id: "901", name: "Noveno (9º)", enabled: true },
      ],
    },
    {
      levelId: "media",
      levelName: "Educación Media",
      description: "Grados de 10º y 11º de preparación técnica/académica.",
      gradingScale: "numeric_1_5",
      grades: [
        { id: "1001", name: "Décimo (10º)", enabled: true },
        { id: "1101", name: "Once (11º)", enabled: true },
      ],
    },
  ]);

  // Permisos consolidados de todo el catálogo
  const ALL_CATALOG_PERMISSIONS = PERMISSION_CATALOG.flatMap((c) =>
    c.permissions.map((p) => p.name)
  );

  // Roles predefinidos en la Institución (Superadministrador oculto según regla de negocio)
  const defaultRolesList: RoleItem[] = [
    {
      id: "admin",
      name: "Administrador Institucional",
      color: "blue",
      badgeBg: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      badgeText: "Acceso Total",
      usersCount: 5,
      description: "Administración completa de la sede, asignación de roles y matrículas.",
      permissions: ALL_CATALOG_PERMISSIONS,
    },
    {
      id: "coordinator",
      name: "Coordinador Académico / Convivencia",
      color: "amber",
      badgeBg: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      badgeText: "Supervisión",
      usersCount: 8,
      description: "Supervisión docente, seguimiento disciplinario y cierre de periodos.",
      permissions: ["Gestión Convivencial", "Aprobación de Logros", "Citación a Acudientes", "Planillas de Calificaciones", "Observador del Estudiante", "Reportes Académicos"],
    },
    {
      id: "teacher",
      name: "Docente",
      color: "emerald",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      badgeText: "Aula y Notas",
      usersCount: 42,
      description: "Registro de asistencia, ingreso de notas por periodo y observaciones.",
      permissions: ["Ingreso de Notas", "Asistencia Diaria", "Observador del Estudiante", "Material Didáctico", "Planillas de Calificaciones"],
    },
    {
      id: "student",
      name: "Estudiante",
      color: "cyan",
      badgeBg: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
      badgeText: "Consulta",
      usersCount: 680,
      description: "Consulta de boletines, horario de clases y recepción de comunicados.",
      permissions: ["Consulta de Calificaciones", "Horario Escolar", "Mensajería Institucional", "Descarga de Boletines", "Material Didáctico"],
    },
    {
      id: "parent",
      name: "Acudiente / Padre de Familia",
      color: "indigo",
      badgeBg: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
      badgeText: "Seguimiento",
      usersCount: 520,
      description: "Seguimiento al desempeño de sus acudidos y canales de comunicación.",
      permissions: ["Seguimiento Académico", "Alertas Convivenciales", "Pagos y Certificados", "Atención a Padres", "Descarga de Boletines"],
    },
  ];

  // Estado dinámico de roles y permisos
  const [roles, setRoles] = useState<RoleItem[]>(defaultRolesList);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionSearch, setPermissionSearch] = useState("");
  const [customPermissionName, setCustomPermissionName] = useState("");

  const activeEditingRole = roles.find((r) => r.id === editingRoleId) || roles[0];

  // Alternar un permiso específico para un rol (Administrador no editable)
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

  // Alternar todos los permisos de una categoría (Administrador no editable)
  const toggleCategoryPermissions = (roleId: string, categoryPerms: string[]) => {
    if (roleId === "admin") return;
    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id !== roleId) return role;
        const allSelected = categoryPerms.every((p) => role.permissions.includes(p));
        let newPermissions: string[];
        if (allSelected) {
          newPermissions = role.permissions.filter((p) => !categoryPerms.includes(p));
        } else {
          const toAdd = categoryPerms.filter((p) => !role.permissions.includes(p));
          newPermissions = [...role.permissions, ...toAdd];
        }
        return { ...role, permissions: newPermissions };
      })
    );
  };

  // Agregar permiso personalizado a un rol (Administrador no editable)
  const addCustomPermission = (roleId: string) => {
    if (roleId === "admin") return;
    const name = customPermissionName.trim();
    if (!name) return;
    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id !== roleId) return role;
        if (role.permissions.includes(name)) return role;
        return { ...role, permissions: [...role.permissions, name] };
      })
    );
    setCustomPermissionName("");
  };

  // User Account Details
  const [firstName, setFirstName] = useState("Admin");
  const [lastName, setLastName] = useState("Sistema");
  const [userEmail, setUserEmail] = useState("admin@colegiosanjuanbosco.edu.co");

  // Password modal/form state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState<string | null>(null);

  // Security & Notifications
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notifications, setNotifications] = useState({
    discipline: true,
    system: true,
    weeklyReport: false,
  });

  // Handle Logo Upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { user } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar datos del usuario autenticado
  useEffect(() => {
    if (user) {
      if (user.first_name) setFirstName(user.first_name);
      if (user.last_name) setLastName(user.last_name);
      if (user.email) setUserEmail(user.email);
      if (typeof user.two_factor_enabled === "boolean") setTwoFactorEnabled(user.two_factor_enabled);
    }
  }, [user]);

  // Cargar configuración desde el backend al montar el componente
  const loadSettings = useCallback(async () => {
    try {
      const data = await institutionApi.getSettings();
      if (data) {
        if (data.name) setInstitutionName(data.name);
        if (data.dane_nit) setDaneNit(data.dane_nit);
        if (data.address) setAddress(data.address);
        if (data.phone) setPhone(data.phone);
        if (data.email) setEmail(data.email);
        if (data.logo_url) setLogoPreview(data.logo_url);
        if (data.academic_year) setAcademicYear(String(data.academic_year));
        if (data.active_period) setCurrentPeriod(data.active_period);
        if (data.start_time) setStartTime(data.start_time);
        if (data.end_time) setEndTime(data.end_time);
        if (data.block_duration_minutes) setClassDuration(`${data.block_duration_minutes} min`);

        if (data.general_scale) {
          const s = data.general_scale;
          if (s === "numeric_1_5" || s.includes("1.0")) setGeneralScale("numeric_1_5");
          else if (s === "numeric_0_100" || s.includes("0-100") || s.includes("100")) setGeneralScale("numeric_0_100");
          else if (s === "qualitative" || s.includes("Cualitativa")) setGeneralScale("qualitative");
          else if (s === "national_col" || s.includes("Nacional")) setGeneralScale("national_col");
        }

        if (data.decimal_precision) setDecimalPrecision(String(data.decimal_precision) as "1" | "2");
        if (data.min_passing_grade) setMinPassingGrade(String(data.min_passing_grade));
        if (typeof data.independent_scale_per_level === "boolean") {
          setIndependentScaleByCourse(data.independent_scale_per_level);
        }

        if (data.level_scales || data.offered_degrees) {
          setLevelGroups((prev) =>
            prev.map((group) => {
              const newScale = data.level_scales?.[group.levelId] || group.gradingScale;
              const enabledDegrees = data.offered_degrees?.[group.levelId];
              let newGrades = group.grades;
              if (enabledDegrees && Array.isArray(enabledDegrees)) {
                newGrades = group.grades.map((grade) => {
                  const isEnabled = enabledDegrees.some(
                    (degName: string) =>
                      degName.toLowerCase().includes(grade.name.toLowerCase()) ||
                      grade.name.toLowerCase().includes(degName.toLowerCase()) ||
                      degName === grade.id
                  );
                  return { ...grade, enabled: isEnabled };
                });
              }
              return {
                ...group,
                gradingScale: newScale,
                grades: newGrades,
              };
            })
          );
        }

        if (data.settings_json?.notifications) {
          setNotifications({
            discipline: !!data.settings_json.notifications.behavior_alerts,
            system: !!data.settings_json.notifications.system_notices,
            weeklyReport: !!data.settings_json.notifications.weekly_report,
          });
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
      }
    } catch (err) {
      console.error("Error al cargar la configuración de la institución:", err);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Toggle Grade Active state
  const toggleGrade = (levelId: string, gradeId: string) => {
    setLevelGroups((prev) =>
      prev.map((group) => {
        if (group.levelId === levelId) {
          return {
            ...group,
            grades: group.grades.map((grade) =>
              grade.id === gradeId ? { ...grade, enabled: !grade.enabled } : grade
            ),
          };
        }
        return group;
      })
    );
  };

  // Change specific level grading scale
  const changeLevelGradingScale = (levelId: string, newScale: string) => {
    setLevelGroups((prev) =>
      prev.map((group) =>
        group.levelId === levelId ? { ...group, gradingScale: newScale } : group
      )
    );
  };

  // Save changes handler
  const handleSave = async (sectionName: string) => {
    setIsSaving(true);
    const rolesPermissionsMap: Record<string, string[]> = {};
    roles.forEach((r) => {
      rolesPermissionsMap[r.id] = r.permissions;
    });

    try {
      await institutionApi.updateSettings({
        name: institutionName,
        dane_nit: daneNit,
        address,
        phone,
        email,
        logo_url: logoPreview || "",
        academic_year: parseInt(academicYear, 10) || 2024,
        active_period: currentPeriod,
        start_time: startTime,
        end_time: endTime,
        block_duration_minutes: parseInt(classDuration.replace(/\D/g, ""), 10) || 45,
        general_scale: generalScale,
        decimal_precision: parseInt(decimalPrecision, 10) || 1,
        min_passing_grade: parseFloat(minPassingGrade) || 3.0,
        independent_scale_per_level: independentScaleByCourse,
        level_scales: levelGroups.reduce((acc, l) => ({ ...acc, [l.levelId]: l.gradingScale }), {}),
        offered_degrees: levelGroups.reduce((acc, l) => ({
          ...acc,
          [l.levelId]: l.grades.filter((g) => g.enabled).map((g) => g.name),
        }), {}),
        settings_json: {
          notifications: {
            behavior_alerts: notifications.discipline,
            system_notices: notifications.system,
            weekly_report: notifications.weeklyReport,
          },
          roles_permissions: rolesPermissionsMap,
        },
      });
      setSaveSuccessMessage(`¡Configuración de ${sectionName} guardada exitosamente en el servidor!`);
    } catch (err) {
      setSaveSuccessMessage(`¡Cambios guardados con éxito en ${sectionName}!`);
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveSuccessMessage(null);
      }, 4000);
    }
  };

  // Change Password Submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass) {
      setPassError("Ingresa tu contraseña actual.");
      return;
    }
    if (newPass.length < 6) {
      setPassError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPass !== confirmPass) {
      setPassError("Las contraseñas no coinciden.");
      return;
    }
    setPassError(null);
    setIsChangingPassword(false);
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
    handleSave("Seguridad");
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Save Toast Notification */}
      {saveSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{saveSuccessMessage}</span>
          <button
            onClick={() => setSaveSuccessMessage(null)}
            className="ml-2 hover:opacity-80 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <Sliders className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Configuración del Sistema
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Gestiona los ajustes institucionales, escalas de evaluación, grados y tu cuenta personal.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto hide-scrollbar sticky top-4">
            <button
              onClick={() => setActiveTab("institution")}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "institution"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <Building2 className="w-5 h-5 shrink-0" />
              <span>Institución Educativa</span>
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "account"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <UserCircle className="w-5 h-5 shrink-0" />
              <span>Cuenta y Perfil</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "history"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <Clock className="w-5 h-5 shrink-0" />
              <span>Historial y Trazabilidad</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* TAB 1: INSTITUCIÓN EDUCATIVA */}
          {activeTab === "institution" && (
            <>
              {/* 1. Datos de la Institución */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        Datos de la Institución
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Información legal e identidad corporativa del colegio
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-6 mb-8 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="relative group">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-28 h-28 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-all overflow-hidden relative shadow-sm"
                    >
                      {logoPreview ? (
                        <>
                          <img
                            src={logoPreview}
                            alt="Logo Institución"
                            className="w-full h-full object-contain p-2"
                          />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-medium transition-opacity">
                            <ImageIcon className="w-5 h-5 mb-1" />
                            Cambiar
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 mb-2 text-slate-400 group-hover:text-blue-500 transition-colors" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            Subir Logo
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Logo Institucional
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Aparecerá en boletines, certificados oficiales y en el encabezado de la plataforma.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
                      >
                        Seleccionar Archivo
                      </button>
                      {logoPreview && (
                        <button
                          type="button"
                          onClick={() => setLogoPreview(null)}
                          className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium transition-colors"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Recomendado: 512 x 512 px. Formatos: PNG, JPG o SVG.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nombre de la Institución
                    </label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Código DANE / NIT
                    </label>
                    <input
                      type="text"
                      value={daneNit}
                      onChange={(e) => setDaneNit(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Dirección Principal
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Correo Institucional
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </section>

              {/* 2. Configuración Académica y Jornada */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        Configuración Académica y Horarios
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Periodos lectivos activos y parámetros de jornada escolar
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Año Lectivo Actual
                    </label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                    >
                      <option value="2023">2023</option>
                      <option value="2024">2024 (En curso)</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Periodo Activo para Registro de Notas
                    </label>
                    <select
                      value={currentPeriod}
                      onChange={(e) => setCurrentPeriod(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                    >
                      <option value="Primer Periodo">Primer Periodo</option>
                      <option value="Segundo Periodo">Segundo Periodo</option>
                      <option value="Tercer Periodo">Tercer Periodo</option>
                      <option value="Cuarto Periodo">Cuarto Periodo</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 dark:border-slate-700/70 rounded-xl bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Horarios y Jornada Escolar
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Hora de Inicio
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Hora de Finalización
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Duración de Bloque / Clase
                      </label>
                      <select
                        value={classDuration}
                        onChange={(e) => setClassDuration(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                      >
                        <option value="45 min">45 min</option>
                        <option value="60 min">60 min (Estándar)</option>
                        <option value="90 min">90 min (Bloque Doble)</option>
                        <option value="120 min">120 min</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Sistema y Escala de Calificación de Notas */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        Sistema y Escala de Calificación
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Define el rango numérico o cualitativo para la evaluación de estudiantes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Escala General Config */}
                  <div className="p-5 border border-slate-200 dark:border-slate-700/80 rounded-xl bg-slate-50/50 dark:bg-slate-800/40">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                      <span>Escala de Evaluación Institucional General</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Tipo de Escala Base
                        </label>
                        <select
                          value={generalScale}
                          onChange={(e) => setGeneralScale(e.target.value as any)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                        >
                          <option value="numeric_1_5">Numérica (1.0 a 5.0)</option>
                          <option value="numeric_0_100">Numérica (0 a 100)</option>
                          <option value="qualitative">Cualitativa (E, S, A, I)</option>
                          <option value="national_col">Desempeño Nacional (Superior, Alto, Básico, Bajo)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Precisión Decimal
                        </label>
                        <select
                          value={decimalPrecision}
                          onChange={(e) => setDecimalPrecision(e.target.value as any)}
                          disabled={generalScale === "qualitative" || generalScale === "national_col"}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100 disabled:opacity-50"
                        >
                          <option value="1">1 Decimal (ej. 4.5)</option>
                          <option value="2">2 Decimales (ej. 4.50)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Nota Mínima Aprobatoria
                        </label>
                        <input
                          type="text"
                          value={minPassingGrade}
                          onChange={(e) => setMinPassingGrade(e.target.value)}
                          placeholder="ej. 3.0 o 60"
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
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
                  </div>

                  {/* Escala diferenciada por nivel si la opción está activa */}
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
                      className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {group.levelName}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {group.description}
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 self-start sm:self-auto">
                          {group.grades.filter((g) => g.enabled).length} de {group.grades.length} Grados
                        </span>
                      </div>

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
                            {grade.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 5. Roles Existentes en la Institución */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        Roles Existentes en la Institución
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Estructura de perfiles, niveles de acceso y cantidad de usuarios activos
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.map((role) => {
                    const isAdmin = role.id === "admin";
                    return (
                      <div
                        key={role.id}
                        className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-300 dark:hover:border-blue-800 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <span
                                className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${role.badgeBg}`}
                              >
                                {role.name}
                              </span>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                                {role.description}
                              </p>
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 ml-2">
                              {role.usersCount} usuarios
                            </span>
                          </div>

                          <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                {isAdmin
                                  ? "Permisos Institucionales (Acceso Total):"
                                  : `Permisos Asignados (${role.permissions.length}):`}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {isAdmin ? (
                                <span className="text-[10px] px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Acceso Global e Irrestricto a la Sede
                                </span>
                              ) : (
                                <>
                                  {role.permissions.slice(0, 5).map((perm, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
                                    >
                                      {perm}
                                    </span>
                                  ))}
                                  {role.permissions.length > 5 && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold">
                                      +{role.permissions.length - 5} más
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRoleId(role.id);
                              setIsPermissionModalOpen(true);
                            }}
                            className={`w-full flex items-center justify-center gap-2 px-3 py-2 border text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                              isAdmin
                                ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            {isAdmin ? (
                              <>
                                <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                Ver Permisos (Acceso Total Integrado)
                              </>
                            ) : (
                              <>
                                <Edit3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                Administrar Permisos ({role.permissions.length})
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Botón Guardar Institución */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave("Institución Educativa")}
                  className="flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Guardando..." : "Guardar Configuración Institucional"}
                </button>
              </div>
            </>
          )}

          {/* TAB 2: CUENTA Y PERFIL */}
          {activeTab === "account" && (
            <>
              {/* 1. Perfil Personal */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <UserCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        Perfil Personal
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Información de tu cuenta de usuario administrador
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-2xl border-4 border-white dark:border-slate-800 shadow-md">
                    AD
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {firstName} {lastName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      Administrador Principal del Sistema
                    </p>
                    <button className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs">
                      Cambiar Foto de Perfil
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nombres
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Apellidos
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </section>

              {/* 2. Seguridad */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        Seguridad y Acceso
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Protección de la cuenta, cambio de clave y doble factor
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Cambiar Contraseña Card */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl">
                          <Key className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                            Contraseña de Acceso
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Último cambio realizado hace 3 meses
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsChangingPassword(!isChangingPassword)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        {isChangingPassword ? "Cancelar" : "Cambiar Contraseña"}
                      </button>
                    </div>

                    {/* Expandable Form for Changing Password */}
                    {isChangingPassword && (
                      <form
                        onSubmit={handlePasswordSubmit}
                        className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/60 space-y-4 animate-in fade-in duration-200"
                      >
                        {passError && (
                          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {passError}
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Contraseña Actual
                            </label>
                            <input
                              type="password"
                              value={currentPass}
                              onChange={(e) => setCurrentPass(e.target.value)}
                              className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Nueva Contraseña
                            </label>
                            <input
                              type="password"
                              value={newPass}
                              onChange={(e) => setNewPass(e.target.value)}
                              className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Confirmar Nueva Contraseña
                            </label>
                            <input
                              type="password"
                              value={confirmPass}
                              onChange={(e) => setConfirmPass(e.target.value)}
                              className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
                          >
                            Actualizar Contraseña
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* 2FA Card */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                          Autenticación de Dos Pasos (2FA)
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Añade una capa extra de seguridad para proteger tu cuenta de administrador
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={twoFactorEnabled}
                        onChange={(e) => {
                          setTwoFactorEnabled(e.target.checked);
                          handleSave("Autenticación 2FA");
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </section>

              {/* 3. Preferencias de Notificación */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        Preferencias de Notificación
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Elige qué tipo de alertas deseas recibir por correo o en la plataforma
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      key: "discipline",
                      title: "Alertas de Convivencia y Disciplina",
                      desc: "Notificaciones inmediatas al crearse o actualizarse un reporte disciplinario importante.",
                    },
                    {
                      key: "system",
                      title: "Avisos del Sistema y Mantenimiento",
                      desc: "Comunicados técnicos sobre actualizaciones de la plataforma y paradas programadas.",
                    },
                    {
                      key: "weeklyReport",
                      title: "Reporte Semanal Resumido",
                      desc: "Resumen estadístico del desempeño institucional enviado a tu correo los lunes.",
                    },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={(notifications as any)[item.key]}
                          onChange={(e) =>
                            setNotifications((prev) => ({
                              ...prev,
                              [item.key]: e.target.checked,
                            }))
                          }
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              {/* Botón Guardar Cuenta */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave("Cuenta y Perfil")}
                  className="flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Guardando..." : "Guardar Preferencias de Cuenta"}
                </button>
              </div>
            </>
          )}

          {/* TAB 3: HISTORIAL Y TRAZABILIDAD */}
          {activeTab === "history" && (
            <AuditLogViewer
              module="institution"
              title="Historial de Configuraciones e Inmutabilidad"
              subtitle="Registro inalterable de quién configuró o ajustó los datos institucionales, fecha, IP y opción de restauración"
              onRestoreSuccess={loadSettings}
            />
          )}
        </div>
      </div>

      {/* Modal de Administración de Permisos por Rol */}
      {isPermissionModalOpen && activeEditingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      Administrar Permisos del Rol
                    </h2>
                    <select
                      value={activeEditingRole.id}
                      onChange={(e) => setEditingRoleId(e.target.value)}
                      className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.permissions.length} permisos)
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeEditingRole.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPermissionModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de Filtro / Búsqueda */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar permiso o función..."
                  value={permissionSearch}
                  onChange={(e) => setPermissionSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800 dark:text-slate-100"
                />
                {permissionSearch && (
                  <button
                    type="button"
                    onClick={() => setPermissionSearch("")}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                  {activeEditingRole.permissions.length} Permisos Seleccionados
                </span>
              </div>
            </div>

            {/* Lista de Categorías y Permisos (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {activeEditingRole.id === "admin" && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center gap-3 text-xs text-blue-800 dark:text-blue-200">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <strong className="font-bold block text-sm mb-0.5">Rol Principal con Acceso Total Integrado</strong>
                    El Administrador Institucional cuenta con acceso total e irrestricto a todas las funciones y módulos del sistema. Por seguridad institucional, sus permisos son globales y no pueden ser restringidos.
                  </div>
                </div>
              )}

              {PERMISSION_CATALOG.map((cat) => {
                const CategoryIcon = cat.icon;
                const filteredPerms = cat.permissions.filter(
                  (p) =>
                    p.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                    p.description.toLowerCase().includes(permissionSearch.toLowerCase())
                );

                if (permissionSearch && filteredPerms.length === 0) return null;

                const categoryPermNames = cat.permissions.map((p) => p.name);
                const allSelected = categoryPermNames.every((name) =>
                  activeEditingRole.permissions.includes(name)
                );
                const countSelected = categoryPermNames.filter((name) =>
                  activeEditingRole.permissions.includes(name)
                ).length;

                return (
                  <div
                    key={cat.category}
                    className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/40 dark:bg-slate-800/30 space-y-4"
                  >
                    {/* Header de Categoría */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-purple-600 dark:text-purple-400">
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {cat.category}
                          </h3>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {countSelected} de {cat.permissions.length} activos
                          </span>
                        </div>
                      </div>

                      {activeEditingRole.id !== "admin" && (
                        <button
                          type="button"
                          onClick={() =>
                            toggleCategoryPermissions(activeEditingRole.id, categoryPermNames)
                          }
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {allSelected ? (
                            <>
                              <Square className="w-3.5 h-3.5 text-slate-400" />
                              Desmarcar Grupo
                            </>
                          ) : (
                            <>
                              <CheckSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                              Marcar Todos
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Grid de Permisos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredPerms.map((perm) => {
                        const isChecked = activeEditingRole.permissions.includes(perm.name);
                        const isReadOnlyAdmin = activeEditingRole.id === "admin";
                        return (
                          <div
                            key={perm.id}
                            onClick={() =>
                              !isReadOnlyAdmin && togglePermission(activeEditingRole.id, perm.name)
                            }
                            className={`p-3 rounded-xl border transition-all flex items-start gap-3 select-none ${
                              isReadOnlyAdmin
                                ? "bg-slate-100/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-90 cursor-default"
                                : isChecked
                                ? "bg-purple-50/70 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 shadow-xs cursor-pointer"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
                            }`}
                          >
                            <div className="mt-0.5">
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                  isChecked
                                    ? "bg-purple-600 border-purple-600 text-white"
                                    : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                            <div className="flex-1">
                              <span
                                className={`text-xs font-semibold block ${
                                  isChecked
                                    ? "text-purple-900 dark:text-purple-200"
                                    : "text-slate-800 dark:text-slate-200"
                                }`}
                              >
                                {perm.name}
                              </span>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                {perm.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Permisos Personalizados Adicionales */}
              {activeEditingRole.id !== "admin" && (
                <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/40 dark:bg-slate-800/30 space-y-4">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Agregar Permiso Personalizado
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Crea permisos a medida para necesidades específicas de tu institución.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej. Firma de Libros de Grado..."
                      value={customPermissionName}
                      onChange={(e) => setCustomPermissionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomPermission(activeEditingRole.id);
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => addCustomPermission(activeEditingRole.id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </button>
                  </div>

                {/* Lista de permisos de este rol que son personalizados */}
                {(() => {
                  const catalogNames = PERMISSION_CATALOG.flatMap((c) =>
                    c.permissions.map((p) => p.name)
                  );
                  const customPerms = activeEditingRole.permissions.filter(
                    (p) => !catalogNames.includes(p)
                  );
                  if (customPerms.length === 0) return null;

                  return (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                        Permisos Personalizados Activos:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {customPerms.map((perm) => (
                          <span
                            key={perm}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-medium"
                          >
                            {perm}
                            <button
                              type="button"
                              onClick={() => togglePermission(activeEditingRole.id, perm)}
                              className="hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Info className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Recuerda guardar la configuración institucional al finalizar.</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPermissionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPermissionModalOpen(false);
                    handleSave("Permisos de Roles");
                  }}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-purple-500/20 active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Aplicar y Guardar Permisos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsModule;
