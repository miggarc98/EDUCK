import { GraduationCap, Shield, Users, Lock, Bell } from "lucide-react";
import ley115Data from "./ley115Grades.json";

export interface GradeItem {
  id: string;
  name: string;
  enabled: boolean;
  obligatorioLey115?: boolean;
}

export interface CycleItem {
  nombre: string;
  grados: GradeItem[];
}

export interface LevelEquivalence {
  label?: string;
  description?: string;
  min?: number;
  max?: number;
}

export interface LevelGroup {
  levelId: string;
  levelName: string;
  description: string;
  gradingScale: string;
  minPassingGrade?: string | number;
  equivalences?: {
    excelente: LevelEquivalence;
    sobresaliente: LevelEquivalence;
    aprobado: LevelEquivalence;
    reprobado: LevelEquivalence;
  };
  ciclos?: CycleItem[];
  grades: GradeItem[];
}

export interface RoleItem {
  id: string;
  name: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  usersCount: number;
  description: string;
  permissions: string[];
}

export interface PermissionItem {
  id: string;
  name: string;
  description: string;
}

export interface PermissionCategory {
  category: string;
  icon: any;
  permissions: PermissionItem[];
}

export const PERMISSION_CATALOG: PermissionCategory[] = [
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

export const ALL_CATALOG_PERMISSIONS = PERMISSION_CATALOG.flatMap((c) =>
  c.permissions.map((p) => p.name)
);

export const DEFAULT_ROLES_LIST: RoleItem[] = [
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

export const INITIAL_LEVEL_GROUPS: LevelGroup[] = ley115Data.map((lvl) => {
  const levelIdMap: Record<string, string> = {
    "Educación Preescolar": "preescolar",
    "Educación Básica": "basica",
    "Educación Media": "media",
  };
  const descMap: Record<string, string> = {
    "Educación Preescolar": "Nivel inicial. Incluye ciclo Preescolar y Transición (Grado Cero obligatorio).",
    "Educación Básica": "Nivel obligatorio de 9 grados estructurado en Básica Primaria (1°-5°) y Básica Secundaria (6°-9°).",
    "Educación Media": "Grados 10° y 11° divididos en Media Académica (Obligatoria) y Media Técnica.",
  };
  const scaleMap: Record<string, string> = {
    "Educación Preescolar": "qualitative",
    "Educación Básica": "numeric_1_5",
    "Educación Media": "numeric_1_5",
  };

  const ciclosParsed: CycleItem[] = lvl.ciclos.map((c) => ({
    nombre: c.nombre,
    grados: c.grados.map((g) => ({
      id: g.id_grado,
      name: g.nombre,
      enabled: g.id_grado !== "parvulos" && !g.id_grado.endsWith("_tec"),
      obligatorioLey115: g.obligatorio_ley_115,
    })),
  }));

  const allGrades = ciclosParsed.flatMap((c) => c.grados);

  return {
    levelId: levelIdMap[lvl.nivel] || lvl.nivel.toLowerCase(),
    levelName: lvl.nivel,
    description: descMap[lvl.nivel] || "",
    gradingScale: scaleMap[lvl.nivel] || "numeric_1_5",
    ciclos: ciclosParsed,
    grades: allGrades,
    minPassingGrade: lvl.nivel === "Educación Preescolar" ? "A" : 3.0,
    equivalences: lvl.nivel === "Educación Preescolar" ? {
      excelente: { label: "E", description: "Excelente" },
      sobresaliente: { label: "S", description: "Sobresaliente" },
      aprobado: { label: "A", description: "Aceptable" },
      reprobado: { label: "I", description: "Insuficiente" }
    } : {
      excelente: { min: 4.6, max: 5.0 },
      sobresaliente: { min: 4.0, max: 4.5 },
      aprobado: { min: 3.0, max: 3.9 },
      reprobado: { min: 1.0, max: 2.9 }
    },
  };
});
