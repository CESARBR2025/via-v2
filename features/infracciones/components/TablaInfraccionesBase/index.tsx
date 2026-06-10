'use client';

import { useMemo, useState } from 'react';
import { Search, X, Eye, FileText, Layers, ListChecks, SearchX } from 'lucide-react';
import CardTable from '@/features/sidebar/components/CardTable';

export type ColumnaDefinition = {
    key: string;
    header: string;
    width?: string;
    align?: 'left' | 'right' | 'center';
    render: (row: any) => React.ReactNode;
};

type Props = {
    data: {
        data: any[];
        page: number;
        limit: number;
        total: number;
    };
    columns: ColumnaDefinition[];
    title: string;
    description?: string;
    onOpen: (id: string) => void;
    accionLabel?: string;
    emptyMessage?: string;
    emptySearchMessage?: string;
    searchPlaceholder?: string;
    searchFields?: string[];
};

export default function TablaInfraccionesBase({
    data,
    columns,
    title,
    description,
    onOpen,
    accionLabel = 'Detalles',
    emptyMessage = 'No hay infracciones pendientes.',
    emptySearchMessage = 'Intenta con otro término de búsqueda.',
    searchPlaceholder = 'Buscar folio o placa...',
    searchFields = ['folio', 'placa', 'id'],
}: Props) {
    const [search, setSearch] = useState('');

    const rows = data.data;

    const filteredRows = useMemo(() => {
        if (!search.trim()) return rows;
        const q = search.toLowerCase();
        return rows.filter((r) =>
            searchFields.some((field) => {
                const val = r[field];
                return val != null && String(val).toLowerCase().includes(q);
            }),
        );
    }, [rows, search, searchFields]);

    return (
        <CardTable className="flex flex-col flex-1 min-h-0 p-0 w-full">
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#E2E8F0] shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                        <FileText size={20} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-[16px] font-semibold text-[#0F172A] truncate">{title}</h2>
                        {description && (
                            <p className="text-[12px] text-[#64748B] mt-0.5 truncate">{description}</p>
                        )}
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#EFF6FF] px-3 py-1.5 text-[12px] font-semibold text-[#2563EB]">
                    <Layers size={14} strokeWidth={1.5} />
                    <span>
                        {filteredRows.length} / {data.total}
                    </span>
                </div>
            </div>

            <div className="px-6 py-3 border-b border-[#E2E8F0] shrink-0">
                <div className="relative max-w-sm">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                        strokeWidth={1.5}
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2 pl-10 pr-8 text-[14px] text-[#0F172A] placeholder-[#94A3B8] transition-all focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#EF4444]"
                        >
                            <X size={15} strokeWidth={1.5} />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto w-full">
                {filteredRows.length > 0 ? (
                    <div className="flex-1 overflow-auto">
                        <table className="w-full min-w-[800px] border-collapse">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                                    <th className="w-10 px-4 py-3 text-left" />
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            className={`px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#64748B] ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                                            style={col.width ? { width: col.width } : undefined}
                                        >
                                            {col.header}
                                        </th>
                                    ))}
                                    <th className="w-[130px] px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">
                                        Acción
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F1F5F9]">
                                {filteredRows.map((row: any, idx: number) => (
                                    <tr
                                        key={row.id}
                                        className="bg-white transition-all duration-150 hover:bg-[#F8FAFC] group"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center w-6">
                                                <span className="text-[11px] font-medium text-[#CBD5E1] group-hover:text-[#94A3B8] transition-colors">
                                                    {String(idx + 1).padStart(2, '0')}
                                                </span>
                                            </div>
                                        </td>
                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                                            >
                                                {col.render(row)}
                                            </td>
                                        ))}
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => onOpen(row.id)}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-[12px] font-semibold text-white shadow-[0_2px_6px_rgba(37,99,235,0.2)] transition-all duration-200 hover:bg-[#1D4ED8] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] active:bg-[#1E40AF] active:scale-[0.97]"
                                            >
                                                <Eye size={13} />
                                                {accionLabel}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1F5F9]">
                            <SearchX size={22} className="text-[#94A3B8]" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-[15px] font-semibold text-[#0F172A]">
                                Sin infracciones encontradas
                            </p>
                            <p className="text-[13px] text-[#64748B] mt-0.5">
                                {search ? emptySearchMessage : emptyMessage}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-4 border-t border-[#E2E8F0] bg-white px-6 py-3 text-[12px] font-medium text-[#94A3B8]">
                <div className="flex items-center gap-1.5">
                    <ListChecks size={14} strokeWidth={1.5} />
                    <span>
                        Mostrando {filteredRows.length} de {data.total} registros
                    </span>
                </div>
                <span className="rounded-md bg-[#F1F5F9] px-2.5 py-0.5 text-[11px] font-semibold text-[#64748B]">
                    Página {data.page}
                </span>
            </div>
        </CardTable>
    );
}
