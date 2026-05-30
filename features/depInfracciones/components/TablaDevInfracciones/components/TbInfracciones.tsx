import { Eye, FileText, Clock, Circle } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import { getBadgeStyles } from '../utils/infraccionBadge';

export function TablaInfracciones({ rows, onOpen }: any) {
    return (
        <div className="flex-1 overflow-auto">
            <table className="w-full min-w-[800px] border-collapse">
                <thead className="sticky top-0 z-10">
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <th className="w-10 px-4 py-3 text-left" />
                        <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">
                            Folio
                        </th>
                        <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">
                            Estatus
                        </th>
                        <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">
                            Placa
                        </th>
                        <th className="w-[180px] px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">
                            Fecha
                        </th>
                        <th className="w-[130px] px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">
                            Acción
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-[#F1F5F9]">
                    {rows.map((row: any, idx: number) => {
                        const requiereCaptura = !row.correo_infractor || !row.nombre_infractor;

                        const badge = requiereCaptura
                            ? { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', label: 'DATOS' }
                            : { ...getBadgeStyles(row.estatus), label: row.estatus };

                        return (
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

                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <FileText size={13} className="shrink-0 text-[#94A3B8]" strokeWidth={1.5} />
                                        <span className="text-[13px] font-medium text-[#0F172A]">{row.folio}</span>
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.bg} ${badge.text}`}
                                    >
                                        <Circle size={6} fill="currentColor" stroke="none" />
                                        {badge.label}
                                    </span>
                                </td>

                                <td className="px-4 py-3">
                                    {row.placa ? (
                                        <span className="inline-flex items-center rounded-md bg-[#EFF6FF] px-2 py-0.5 text-[12px] font-semibold text-[#2563EB] tracking-wider">
                                            {row.placa}
                                        </span>
                                    ) : (
                                        <span className="text-[13px] text-[#94A3B8]">—</span>
                                    )}
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5 text-[12px] text-[#94A3B8]">
                                        <Clock size={12} strokeWidth={1.5} />
                                        {formatDate(row.created_at)}
                                    </div>
                                </td>

                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => onOpen(row.id)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-[12px] font-semibold text-white shadow-[0_2px_6px_rgba(37,99,235,0.2)] transition-all duration-200 hover:bg-[#1D4ED8] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] active:bg-[#1E40AF] active:scale-[0.97]"
                                    >
                                        <Eye size={13} />
                                        Detalles
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
