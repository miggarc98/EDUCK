import { useState, useEffect } from "react";
import { AuditLogItem } from "../types/audit";
import { auditService } from "../services/audit.service";
import {
  Clock,
  RotateCcw,
  Shield,
  UserCheck,
  Globe,
  Monitor,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";

interface AuditLogViewerProps {
  module?: string;
  objectId?: string;
  title?: string;
  subtitle?: string;
  onRestoreSuccess?: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Nombre de la Institución",
  dane_nit: "DANE / NIT",
  address: "Dirección",
  phone: "Teléfono",
  email: "Correo Electrónico",
  logo_url: "Logo Institucional",
  academic_year: "Año Lectivo",
  active_period: "Periodo Activo",
  start_time: "Hora de Inicio Jornada",
  end_time: "Hora de Fin Jornada",
  block_duration_minutes: "Duración Bloque de Clase",
  general_scale: "Escala General de Calificaciones",
  decimal_precision: "Precisión Decimal",
  min_passing_grade: "Nota Mínima de Aprobación",
  independent_scale_per_level: "Escala Independiente por Nivel",
  level_scales: "Escalas por Nivel",
  offered_degrees: "Grados Ofertados",
  settings_json: "Configuraciones Extendidas",
};

const NESTED_FIELD_LABELS: Record<string, string> = {
  "academic.academic_year": "Año Lectivo (Calendario)",
  "academic.current_period": "Periodo Actual",
  "academic.start_time": "Hora Inicio Jornada",
  "academic.end_time": "Hora Fin Jornada",
  "academic.class_duration": "Duración de Clase",
  "grading.general_scale": "Escala de Calificación General",
  "grading.decimal_precision": "Precisión Decimal (Notas)",
  "grading.min_passing_grade": "Nota Mínima para Aprobar",
  "grading.independent_scale": "Escala Independiente por Grado",
  "level_groups": "Estructura de Niveles y Grados",
  "roles_permissions": "Permisos y Roles",
};

const CURRICULUM_FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  description: "Descripción",
  is_mandatory: "Obligatorio (Ley 115)",
  is_active: "Estado Activo",
  level: "Nivel Académico",
  degree: "Grado",
  director: "Director de Grupo (ID)",
  area: "Área de la Asignatura (ID)",
  courses: "Cursos Asociados",
};

interface FlatChangeItem {
  label: string;
  key: string;
  old: any;
  new: any;
  diffDetails?: {
    added: string[];
    removed: string[];
  };
}

const getFlatChanges = (changes: Record<string, any>, entityName = ""): FlatChangeItem[] => {
  const flat: FlatChangeItem[] = [];
  if (!changes) return flat;
  
  const isCurriculum =
    entityName.includes("Curso") ||
    entityName.includes("Área") ||
    entityName.includes("Asignatura") ||
    entityName.includes("plan de estudios");

  Object.entries(changes).forEach(([fieldKey, change]) => {
    if (
      fieldKey === "settings_json" &&
      change.old &&
      change.new &&
      typeof change.old === "object" &&
      typeof change.new === "object"
    ) {
      // academic
      const oldAcademic = change.old.academic || {};
      const newAcademic = change.new.academic || {};
      const academicKeys = Array.from(new Set([...Object.keys(oldAcademic), ...Object.keys(newAcademic)]));
      academicKeys.forEach((k) => {
        const fullKey = `academic.${k}`;
        const ov = oldAcademic[k];
        const nv = newAcademic[k];
        if (JSON.stringify(ov) !== JSON.stringify(nv)) {
          flat.push({
            label: NESTED_FIELD_LABELS[fullKey] || fullKey,
            key: fullKey,
            old: ov,
            new: nv,
          });
        }
      });

      // grading
      const oldGrading = change.old.grading || {};
      const newGrading = change.new.grading || {};
      const gradingKeys = Array.from(new Set([...Object.keys(oldGrading), ...Object.keys(newGrading)]));
      gradingKeys.forEach((k) => {
        const fullKey = `grading.${k}`;
        const ov = oldGrading[k];
        const nv = newGrading[k];
        if (JSON.stringify(ov) !== JSON.stringify(nv)) {
          flat.push({
            label: NESTED_FIELD_LABELS[fullKey] || fullKey,
            key: fullKey,
            old: ov,
            new: nv,
          });
        }
      });

      // other keys
      const otherKeys = Array.from(
        new Set([...Object.keys(change.old), ...Object.keys(change.new)])
      ).filter((k) => k !== "academic" && k !== "grading");
      otherKeys.forEach((k) => {
        const ov = change.old[k];
        const nv = change.new[k];
        if (JSON.stringify(ov) !== JSON.stringify(nv)) {
          if (k === "roles_permissions" && ov && nv && typeof ov === "object" && typeof nv === "object") {
            const roleKeys = Array.from(new Set([...Object.keys(ov), ...Object.keys(nv)]));
            roleKeys.forEach((roleId) => {
              const oldPerms: string[] = ov[roleId] || [];
              const newPerms: string[] = nv[roleId] || [];
              
              const added = newPerms.filter((p) => !oldPerms.includes(p));
              const removed = oldPerms.filter((p) => !newPerms.includes(p));
              
              if (added.length > 0 || removed.length > 0) {
                flat.push({
                  label: `Permisos del Rol: ${roleId.charAt(0).toUpperCase() + roleId.slice(1)}`,
                  key: `roles_permissions.${roleId}`,
                  old: oldPerms,
                  new: newPerms,
                  diffDetails: {
                    added,
                    removed,
                  },
                });
              }
            });
          } else {
            flat.push({
              label: NESTED_FIELD_LABELS[k] || k,
              key: k,
              old: ov,
              new: nv,
            });
          }
        }
      });
    } else {
      const labels = isCurriculum ? CURRICULUM_FIELD_LABELS : FIELD_LABELS;
      flat.push({
        label: labels[fieldKey] || fieldKey,
        key: fieldKey,
        old: change.old,
        new: change.new,
      });
    }
  });
  return flat;
};

export function AuditLogViewer({
  module = "institution",
  objectId,
  title = "Historial de Cambios y Trazabilidad",
  subtitle = "Registro inmutable de modificaciones, autoría y restauración de versiones",
  onRestoreSuccess,
}: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedLogs, setExpandedLogs] = useState<Record<number, boolean>>({});
  
  // State for restore modal
  const [selectedLogForRestore, setSelectedLogForRestore] = useState<AuditLogItem | null>(null);
  const [restoring, setRestoring] = useState<boolean>(false);
  const [restoreMessage, setRestoreMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await auditService.getLogs(module, objectId);
      setLogs(data);
    } catch (err: any) {
      console.error("Error fetching audit logs:", err);
      setError("No se pudo cargar el historial de cambios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [module, objectId]);

  const toggleExpand = (id: number) => {
    setExpandedLogs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirmRestore = async () => {
    if (!selectedLogForRestore) return;
    setRestoring(true);
    setRestoreMessage(null);
    try {
      const res = await auditService.restoreSnapshot(selectedLogForRestore.id);
      setRestoreMessage({ type: "success", text: res.detail });
      fetchLogs();
      if (onRestoreSuccess) {
        onRestoreSuccess();
      }
      setTimeout(() => {
        setSelectedLogForRestore(null);
        setRestoreMessage(null);
      }, 1800);
    } catch (err: any) {
      console.error("Error restoring snapshot:", err);
      const errMsg = err?.response?.data?.detail || "Ocurrió un error al intentar restaurar esta versión.";
      setRestoreMessage({ type: "error", text: errMsg });
    } finally {
      setRestoring(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesUser = log.user_name.toLowerCase().includes(term) || log.user_email.toLowerCase().includes(term);
    const matchesRole = log.user_role.toLowerCase().includes(term);
    const matchesAction = log.action_type_display.toLowerCase().includes(term);
    const matchesEntity = log.entity_name.toLowerCase().includes(term);
    return matchesUser || matchesRole || matchesAction || matchesEntity;
  });

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(d);
    } catch {
      return isoString;
    }
  };

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return "(vacío)";
    if (typeof val === "boolean") return val ? "Sí" : "No";
    if (typeof val === "object") return JSON.stringify(val, null, 2);
    return String(val);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar Historial
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar en el historial por usuario, rol o tipo de acción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Immutability Alert Banner */}
        <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
          <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              Registros Inmutables Protegidos:
            </span>{" "}
            Cada modificación genera un rastro criptográfico e inalterable. Los registros no se pueden eliminar;
            únicamente es posible volver a estados pasados mediante la opción de restauración.
          </div>
        </div>
      </div>

      {/* Timeline List */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-3" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Cargando registros de auditoría...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No se encontraron registros de auditoría</p>
          <p className="text-xs text-slate-400 mt-1">Los cambios administrativos aparecerán listados aquí automáticamente.</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogs[log.id] ?? false;
            const flatChanges = getFlatChanges(log.changes, log.entity_name);
            const hasChanges = flatChanges.length > 0;

            const isRestore = log.action_type === "RESTORE";
            const isCreate = log.action_type === "CREATE";
            const isDelete = log.action_type === "DELETE";

            return (
              <div key={log.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-6 top-4 w-5 h-5 rounded-full border-2 bg-white dark:bg-slate-900 flex items-center justify-center ${
                    isRestore
                      ? "border-purple-500 text-purple-500 shadow-sm shadow-purple-500/20"
                      : isCreate
                      ? "border-emerald-500 text-emerald-500 shadow-sm shadow-emerald-500/20"
                      : isDelete
                      ? "border-rose-500 text-rose-500 shadow-sm shadow-rose-500/20"
                      : "border-blue-500 text-blue-500 shadow-sm shadow-blue-500/20"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isRestore ? "bg-purple-500" : isCreate ? "bg-emerald-500" : isDelete ? "bg-rose-500" : "bg-blue-500"
                    }`}
                  />
                </div>

                {/* Card Container */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs">
                        {log.user_name ? log.user_name.slice(0, 2).toUpperCase() : "SYS"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {log.user_name || "Sistema Automático"}
                          </span>
                          {log.user_role && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {log.user_role}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{log.user_email || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Action Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                          isRestore
                            ? "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                            : isCreate
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : isDelete
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                            : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                        }`}
                      >
                        {isRestore ? (
                          <RotateCcw className="w-3.5 h-3.5" />
                        ) : isDelete ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                        {log.action_type_display || log.action_type}
                      </span>

                      {/* Date Pill */}
                      <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Row: IP Address & User Agent */}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>IP: <strong className="text-slate-700 dark:text-slate-300">{log.ip_address || "127.0.0.1"}</strong></span>
                    </div>
                    {log.user_agent && (
                      <div className="flex items-center gap-1 max-w-xs truncate" title={log.user_agent}>
                        <Monitor className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{log.user_agent}</span>
                      </div>
                    )}
                  </div>

                  {/* Changes Section */}
                  {hasChanges ? (
                    <div className="mt-4">
                      <button
                        onClick={() => toggleExpand(log.id)}
                        className="flex items-center justify-between w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-700/50"
                      >
                        <span>
                          {flatChanges.length} campo(s) modificado(s)
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                          {flatChanges.map((change) => {
                            return (
                              <div
                                key={change.key}
                                className="p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 text-xs space-y-1.5"
                              >
                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                  {change.label} <span className="text-[10px] font-mono text-slate-400">({change.key})</span>
                                </div>
                                {change.diffDetails ? (
                                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50 space-y-3 mt-1.5 w-full">
                                    {change.diffDetails.added && change.diffDetails.added.length > 0 && (
                                      <div className="space-y-1.5">
                                        <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                          Permisos Asignados (+)
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                          {change.diffDetails.added.map((p: string) => (
                                            <span key={p} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 text-[10px] font-semibold">
                                              + {p}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {change.diffDetails.removed && change.diffDetails.removed.length > 0 && (
                                      <div className="space-y-1.5">
                                        <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                          Permisos Revocados (-)
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                          {change.diffDetails.removed.map((p: string) => (
                                            <span key={p} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-805/80 text-[10px] font-semibold">
                                              - {p}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                    <div className="p-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/50 rounded-lg text-rose-800 dark:text-rose-300">
                                      <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-500 mb-0.5">
                                        Valor Anterior
                                      </span>
                                      <pre className="font-mono whitespace-pre-wrap break-all text-[11px]">
                                        {formatValue(change.old)}
                                      </pre>
                                    </div>
                                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 rounded-lg text-emerald-800 dark:text-emerald-300">
                                      <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-0.5">
                                        Valor Nuevo
                                      </span>
                                      <pre className="font-mono whitespace-pre-wrap break-all text-[11px]">
                                        {formatValue(change.new)}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-slate-400 italic">
                      Registro de restauración o inicio sin cambios detectados de campos individuales.
                    </div>
                  )}

                  {/* Restore Action Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                    <button
                      onClick={() => setSelectedLogForRestore(log)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 rounded-xl transition-all shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restaurar esta versión
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Restoration */}
      {selectedLogForRestore && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  ¿Restaurar a esta versión?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fecha: {formatDate(selectedLogForRestore.created_at)}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              La configuración activa volverá a tener exactamente los valores guardados en esta versión por{" "}
              <strong>{selectedLogForRestore.user_name || "el sistema"}</strong>. Esta acción creará automáticamente
              un <strong>nuevo registro de auditoría</strong> de tipo "Restauración".
            </p>

            {restoreMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  restoreMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                }`}
              >
                {restoreMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                )}
                <span>{restoreMessage.text}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedLogForRestore(null);
                  setRestoreMessage(null);
                }}
                disabled={restoring}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRestore}
                disabled={restoring}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 rounded-xl transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
              >
                {restoring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Restaurando...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    Sí, Restaurar Versión
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
