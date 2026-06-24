import { Eye, FileText, Clock, Circle } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import { getBadgeStyles } from '../utils/infraccionBadge';

export function TablaInfracciones({ rows, onOpen }: any) {
    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <table className="w-full min-w-[800px] border-collapse">
                <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="w-10 px-4 py-3 text-left" />
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                            Folio
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                            Estatus
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                            Placa
                        </th>
                        <th className="w-[180px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                            Fecha
                        </th>
                        <th className="w-[130px] px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                            Acción
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                    {rows.map((row: any, idx: number) => {
                        const requiereCaptura = !row.correo_infractor || !row.nombre_infractor;

                        const badge = requiereCaptura
                            ? { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Incompleto' }
                            : getBadgeStyles(row.estatusInfraccion);

                        return (
                            <tr
                                key={row.id}
                                className="bg-white transition-all duration-150 hover:bg-slate-50 group"
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center w-6">
                                        <span className="text-[11px] font-medium text-slate-300 group-hover:text-slate-400 transition-colors">
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <FileText size={13} className="shrink-0 text-slate-400" strokeWidth={1.5} />
                                        <span className="text-[13px] font-medium text-slate-900">{row.folio}</span>
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${badge.bg} ${badge.text}`}
                                    >
                                        <Circle size={6} fill="currentColor" stroke="none" />
                                        {badge.label}
                                    </span>
                                </td>

                                <td className="px-4 py-3">
                                    {row.placa ? (
                                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 tracking-wider">
                                            {row.placa}
                                        </span>
                                    ) : (
                                        <span className="text-[13px] text-slate-400">—</span>
                                    )}
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Clock size={12} strokeWidth={1.5} />
                                        {formatDate(row.created_at)}
                                    </div>
                                </td>

                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => onOpen(row.id)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-blue-800 active:bg-blue-900 active:scale-[0.99] transition-colors duration-150"
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
