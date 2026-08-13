import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ColumnDef<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T, index: number) => React.ReactNode;
    headerClassName?: string;
    cellClassName?: string;
}

interface TableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    loading?: boolean;
    emptyMessage?: string;
    rowKey?: (item: T) => string | number;
}

export function Table<T>({
    data,
    columns,
    loading = false,
    emptyMessage = "No se encontraron registros.",
    rowKey = (item: any) => item.id || JSON.stringify(item),
}: TableProps<T>) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    Cargando datos...
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[700px]">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-900/20 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            {columns.map((col, idx) => (
                                <th key={idx} className={`py-4 px-6 ${col.headerClassName || ''}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-800/40 text-sm text-slate-700 dark:text-slate-300">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="py-12 text-center text-slate-400 dark:text-slate-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item, rowIdx) => (
                                <tr key={rowKey(item)} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors">
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className={`py-4 px-6 ${col.cellClassName || ''}`}>
                                            {col.cell 
                                                ? col.cell(item, rowIdx) 
                                                : col.accessorKey 
                                                    ? String(item[col.accessorKey] ?? '') 
                                                    : null
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
