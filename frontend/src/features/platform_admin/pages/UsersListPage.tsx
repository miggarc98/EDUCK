import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { platformAdminApi } from '../services/api';
import type { User } from '@/features/auth_users/types';
import { Table, ColumnDef } from '@/shared/components/Table';
import { 
    Shield, 
    Mail, 
    UserCheck, 
    ShieldAlert, 
    Loader2, 
    ChevronLeft, 
    ChevronRight, 
    Edit2, 
    Ban, 
    CheckCircle, 
    X,
    UserCog,
    Search,
    Filter,
    RotateCcw
} from 'lucide-react';

export default function UsersListPage() {
    const { user } = useAuthStore();
    const [users, setUsers] = useState<User[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters state
    const [filters, setFilters] = useState({
        name: '',
        email: '',
        role: '',
        status: ''
    });

    const [activeFilters, setActiveFilters] = useState(filters);

    // Modal state
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        role: '' as User['role'],
        is_active: true
    });
    const [submitting, setSubmitting] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

    useEffect(() => {
        const handler = setTimeout(() => {
            setActiveFilters(filters);
            setCurrentPage(1);
        }, 350);

        return () => {
            clearTimeout(handler);
        };
    }, [filters]);

    const fetchUsers = async (page: number, currentFilters: typeof filters) => {
        try {
            setLoading(true);
            setError(null);
            const data = await platformAdminApi.getUsers(page, {
                name: currentFilters.name || undefined,
                email: currentFilters.email || undefined,
                role: currentFilters.role || undefined,
                status: currentFilters.status || undefined
            });
            setUsers(data.results);
            setTotalCount(data.count);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.detail || 'Error al cargar la lista de usuarios.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'superadmin')) {
            fetchUsers(currentPage, activeFilters);
        }
    }, [user, currentPage, activeFilters]);

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return <Navigate to="/dashboard" replace />;
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters({
            name: '',
            email: '',
            role: '',
            status: ''
        });
    };

    const handleOpenEditModal = (targetUser: User) => {
        setEditingUser(targetUser);
        setFormData({
            first_name: targetUser.first_name || '',
            last_name: targetUser.last_name || '',
            role: targetUser.role,
            is_active: targetUser.is_active !== false
        });
        setActionError(null);
    };

    const handleCloseModal = () => {
        setEditingUser(null);
        setActionError(null);
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            setSubmitting(true);
            setActionError(null);
            const updated = await platformAdminApi.updateUser(editingUser.id, formData);
            setUsers(prev => prev.map(u => u.id === editingUser.id ? updated : u));
            handleCloseModal();
        } catch (err: any) {
            console.error('Error updating user:', err);
            setActionError(err.response?.data?.detail || 'Error al guardar los cambios.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleBlock = async (targetUser: User) => {
        const newStatus = targetUser.is_active === false;
        const confirmMessage = newStatus 
            ? `¿Estás seguro de que deseas desbloquear a ${targetUser.first_name}?`
            : `¿Estás seguro de que deseas bloquear a ${targetUser.first_name}? El usuario no podrá iniciar sesión.`;
        
        if (!window.confirm(confirmMessage)) return;

        try {
            const updated = await platformAdminApi.updateUser(targetUser.id, { is_active: newStatus });
            setUsers(prev => prev.map(u => u.id === targetUser.id ? updated : u));
        } catch (err: any) {
            console.error('Error toggling block state:', err);
            alert(err.response?.data?.detail || 'Error al cambiar el estado del usuario.');
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/20">
                        <Shield className="w-3 h-3" />
                        Admin
                    </span>
                );
            case 'coordinator':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-850/20">
                        Coordinador
                    </span>
                );
            case 'teacher':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/20">
                        Docente
                    </span>
                );
            case 'student':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800/20">
                        Estudiante
                    </span>
                );
            case 'parent':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-850 dark:text-slate-350 border border-slate-200 dark:border-slate-800/25">
                        Familiar
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-150 text-slate-800 dark:bg-slate-850 dark:text-slate-400">
                        {role}
                    </span>
                );
        }
    };

    // Definición de columnas reutilizables
    const columns: ColumnDef<User>[] = [
        {
            header: '#',
            headerClassName: 'text-center w-16',
            cellClassName: 'text-center text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-50/10 dark:bg-slate-900/10',
            cell: (_, idx) => (currentPage - 1) * ITEMS_PER_PAGE + idx + 1
        },
        {
            header: 'Usuario',
            cell: (u) => (
                <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                        {u.first_name} {u.last_name}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>{u.email}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Rol de Acceso',
            cell: (u) => getRoleBadge(u.role)
        },
        {
            header: 'Estado',
            headerClassName: 'text-center w-28',
            cellClassName: 'text-center',
            cell: (u) => {
                const isBlocked = u.is_active === false;
                return !isBlocked ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/20">
                        Activo
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/20">
                        Bloqueado
                    </span>
                );
            }
        },
        {
            header: 'Acciones',
            headerClassName: 'text-center w-36',
            cellClassName: 'text-center',
            cell: (u) => {
                const isBlocked = u.is_active === false;
                return (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                            title="Editar Datos"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleToggleBlock(u)}
                            className={`p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ${
                                isBlocked 
                                    ? 'text-emerald-500 hover:text-emerald-600 dark:text-emerald-400' 
                                    : 'text-rose-500 hover:text-rose-600 dark:text-rose-400'
                            }`}
                            title={isBlocked ? "Desbloquear" : "Bloquear"}
                        >
                            {isBlocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <UserCog className="w-8 h-8 text-blue-500" />
                        Administración de Usuarios
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Edita, bloquea y gestiona el estado de todos los usuarios registrados (excluyendo SuperAdmins).
                    </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 px-4 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-800">
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    <span>Total filtrados: <strong>{totalCount}</strong></span>
                </div>
            </div>

            {/* Contenedor de Filtros */}
            <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm p-5 space-y-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Filter className="w-4 h-4 text-blue-500" />
                    Filtros de Búsqueda
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <label htmlFor="search_name" className="sr-only">Buscar por nombre</label>
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                            id="search_name"
                            type="text"
                            placeholder="Nombre o apellido..."
                            value={filters.name}
                            onChange={e => handleFilterChange('name', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div className="relative">
                        <label htmlFor="search_email" className="sr-only">Buscar por correo</label>
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                            id="search_email"
                            type="text"
                            placeholder="Correo electrónico..."
                            value={filters.email}
                            onChange={e => handleFilterChange('email', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="filter_role" className="sr-only">Filtrar por rol</label>
                        <select
                            id="filter_role"
                            value={filters.role}
                            onChange={e => handleFilterChange('role', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
                        >
                            <option value="">Todos los Roles</option>
                            <option value="admin">Administrador</option>
                            <option value="coordinator">Coordinador</option>
                            <option value="teacher">Docente</option>
                            <option value="student">Estudiante</option>
                            <option value="parent">Familiar</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <label htmlFor="filter_status" className="sr-only">Filtrar por estado</label>
                        <select
                            id="filter_status"
                            value={filters.status}
                            onChange={e => handleFilterChange('status', e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
                        >
                            <option value="">Todos los Estados</option>
                            <option value="active">Activos</option>
                            <option value="blocked">Bloqueados</option>
                        </select>

                        <button
                            onClick={handleClearFilters}
                            className="p-2 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 transition-all"
                            title="Restablecer filtros"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            {error ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl">
                    <ShieldAlert className="w-12 h-12 text-rose-500 mb-3" />
                    <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-400 mb-1">
                        No se pudieron cargar los datos
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm text-center max-w-md">
                        {error}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Contenedor de la tabla responsiva reutilizable */}
                    <Table
                        data={users}
                        columns={columns}
                        loading={loading}
                        emptyMessage="No hay usuarios registrados con los filtros aplicados."
                    />

                    {/* Controles de Paginación */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                Mostrando página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({totalCount} usuarios en total)
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
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
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                                    : 'border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                                    title="Página Siguiente"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Edición de Usuario */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 className="w-4 h-4 text-blue-500" />
                                Editar Usuario
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                                    Correo Electrónico
                                </label>
                                <div className="text-slate-600 dark:text-slate-350 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-lg border border-slate-150 dark:border-slate-850 text-sm">
                                    {editingUser.email}
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                                    El correo electrónico no puede ser modificado.
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="first_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                                        Nombres
                                    </label>
                                    <input
                                        id="first_name"
                                        type="text"
                                        value={formData.first_name}
                                        onChange={e => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="last_name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                                        Apellidos
                                    </label>
                                    <input
                                        id="last_name"
                                        type="text"
                                        value={formData.last_name}
                                        onChange={e => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="role" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                                    Rol de Usuario
                                </label>
                                <select
                                    id="role"
                                    value={formData.role}
                                    onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as User['role'] }))}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500"
                                >
                                    <option value="admin">Administrador</option>
                                    <option value="coordinator">Coordinador</option>
                                    <option value="teacher">Docente</option>
                                    <option value="student">Estudiante</option>
                                    <option value="parent">Familiar</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-150 dark:border-slate-850 pt-4">
                                <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-350">
                                    Estado Activo
                                </label>
                                <button
                                    id="is_active"
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                        formData.is_active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-800'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            formData.is_active ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {actionError && (
                                <div className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-3 rounded-lg flex items-start gap-1.5">
                                    <ShieldAlert className="w-4 h-4 shrink-0" />
                                    <span>{actionError}</span>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-150 dark:border-slate-850">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors flex items-center gap-1.5"
                                >
                                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
