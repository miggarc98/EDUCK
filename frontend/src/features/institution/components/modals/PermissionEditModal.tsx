import React, { useState } from "react";
import {
  X,
  Search,
  CheckSquare,
  Square,
  Check,
  Plus,
  ShieldAlert,
} from "lucide-react";
import {
  PERMISSION_CATALOG,
  RoleItem,
} from "../../constants/institutionDefaults";

interface PermissionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: RoleItem[];
  editingRoleId: string | null;
  setEditingRoleId: (id: string) => void;
  togglePermission: (roleId: string, permName: string) => void;
  toggleCategoryPermissions: (roleId: string, permNames: string[]) => void;
}

export function PermissionEditModal({
  isOpen,
  onClose,
  roles,
  editingRoleId,
  setEditingRoleId,
  togglePermission,
  toggleCategoryPermissions,
}: PermissionEditModalProps) {
  const [permissionSearch, setPermissionSearch] = useState("");
  const [customPermissionName, setCustomPermissionName] = useState("");

  if (!isOpen) return null;

  const activeEditingRole = roles.find((r) => r.id === editingRoleId) || roles[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Gestor de Permisos y Accesos por Rol</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personaliza el catálogo de permisos asignado a cada perfil institucional
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar and Role Selector */}
        <div className="p-4 bg-slate-100/60 dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Tabs selector de Rol */}
          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setEditingRoleId(role.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeEditingRole.id === role.id
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {role.name}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar permiso..."
              value={permissionSearch}
              onChange={(e) => setPermissionSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/30 dark:bg-slate-900/30">
          {PERMISSION_CATALOG.map((cat) => {
            const Icon = cat.icon;
            const categoryPermNames = cat.permissions.map((p) => p.name);
            const countSelected = categoryPermNames.filter((pName) =>
              activeEditingRole.permissions.includes(pName)
            ).length;
            const allSelected = countSelected === categoryPermNames.length;

            const filteredPerms = cat.permissions.filter(
              (p) =>
                p.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                p.description.toLowerCase().includes(permissionSearch.toLowerCase())
            );

            if (filteredPerms.length === 0) return null;

            return (
              <div
                key={cat.category}
                className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 rounded-2xl p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {cat.category}
                      </h4>
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
                            ? "bg-purple-50/70 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 shadow-2xs cursor-pointer"
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
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Perfil en edición: <strong>{activeEditingRole.name}</strong> ({activeEditingRole.permissions.length} permisos habilitados)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            Aceptar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
