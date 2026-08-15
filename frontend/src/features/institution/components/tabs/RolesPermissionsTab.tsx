import React from "react";
import { Users, Lock, ChevronRight, ShieldCheck, Check, Plus, Search } from "lucide-react";
import {
  PERMISSION_CATALOG,
  RoleItem,
  ALL_CATALOG_PERMISSIONS,
} from "../../constants/institutionDefaults";

interface RolesPermissionsTabProps {
  roles: RoleItem[];
  editingRoleId: string | null;
  setEditingRoleId: (val: string) => void;
  togglePermission: (roleId: string, permName: string) => void;
  setIsPermissionModalOpen: (val: boolean) => void;
}

export function RolesPermissionsTab({
  roles,
  editingRoleId,
  setEditingRoleId,
  togglePermission,
  setIsPermissionModalOpen,
}: RolesPermissionsTabProps) {
  const activeEditingRole = roles.find((r) => r.id === editingRoleId) || roles[0];

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Roles y Matriz de Permisos de la Plataforma
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Asigna permisos de acceso a docentes, coordinadores, estudiantes y acudientes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsPermissionModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Gestionar Permisos</span>
        </button>
      </div>

      {/* Grid: Selector de Roles a la izquierda | Matriz de permisos a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Perfiles Registrados
          </span>
          {roles.map((role) => {
            const isSelected = activeEditingRole.id === role.id;
            return (
              <div
                key={role.id}
                onClick={() => setEditingRoleId(role.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-purple-50/70 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 shadow-sm"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {role.name}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${role.badgeBg}`}
                  >
                    {role.badgeText}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                  {role.description}
                </p>
                <div className="flex items-center justify-end text-xs pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 text-[11px]">
                    {role.permissions.length} permisos activos <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Permissions Matrix */}
        <div className="lg:col-span-8 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Matriz de Permisos: {activeEditingRole.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeEditingRole.id === "admin"
                  ? "Este perfil cuenta con control total sobre todas las acciones de la plataforma."
                  : "Marca o desmarca los módulos y acciones permitidas para este rol."}
              </p>
            </div>
            {activeEditingRole.id === "admin" && (
              <span className="text-xs font-semibold px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 self-start sm:self-auto">
                No editable (Administrador)
              </span>
            )}
          </div>

          <div className="space-y-6">
            {PERMISSION_CATALOG.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.category} className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <Icon className="w-4 h-4 text-purple-500" />
                    <span>{cat.category}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {cat.permissions.map((perm) => {
                      const isGranted = activeEditingRole.permissions.includes(perm.name);
                      const isSystemAdmin = activeEditingRole.id === "admin";

                      return (
                        <div
                          key={perm.id}
                          onClick={() => togglePermission(activeEditingRole.id, perm.name)}
                          className={`p-3 rounded-xl border text-xs transition-all flex items-start justify-between gap-3 ${
                            isSystemAdmin
                              ? "cursor-not-allowed opacity-90 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                              : "cursor-pointer"
                          } ${
                            isGranted && !isSystemAdmin
                              ? "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-slate-800 dark:text-slate-100"
                              : !isGranted && !isSystemAdmin
                              ? "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 hover:border-slate-300"
                              : ""
                          }`}
                        >
                          <div>
                            <span className="font-semibold block text-slate-800 dark:text-slate-100">
                              {perm.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block line-clamp-2">
                              {perm.description}
                            </span>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-lg shrink-0 flex items-center justify-center transition-colors ${
                              isGranted
                                ? "bg-purple-600 text-white"
                                : "bg-slate-200 dark:bg-slate-700 text-transparent"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
