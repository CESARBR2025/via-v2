import { Eye } from "lucide-react";
import { formatDate } from "../utils/formatDate";
import { getBadgeStyles } from "../utils/infraccionBadge";

export function TablaInfracciones({ rows, onOpen }: any) {

    return (
        <div className="flex-1 overflow-auto">
            <table className="w-full text-[14px] border-collapse">
                <thead className="sticky top-0 bg-[#F8FAFF] border-b border-[#EAF1FC] z-10">
                    <tr>
                        <th className="text-left px-6 py-3.5 text-[13px] font-semibold text-[#6B778C]">
                            Folio
                        </th>

                        <th className="text-left px-6 py-3.5 text-[13px] font-semibold text-[#6B778C]">
                            Estatus
                        </th>

                        <th className="text-left px-6 py-3.5 text-[13px] font-semibold text-[#6B778C]">
                            Placa
                        </th>

                        <th className="text-left px-6 py-3.5 text-[13px] font-semibold text-[#6B778C]">
                            Fecha
                        </th>

                        <th className="text-right px-6 py-3.5 text-[13px] font-semibold text-[#6B778C]">
                            Acción
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-[#F1F4FA]">
                    {rows.map((row: any) => {

                        /**
                         * Detectar si faltan datos del ciudadano
                         */
                        const requiereCaptura =
                            !row.correo_infractor ||
                            !row.nombre_infractor;

                        /**
                         * Badge dinámico
                         */
                        const badge = requiereCaptura
                            ? {
                                bg: 'bg-amber-100',
                                text: 'text-amber-700',
                                label: 'DATOS',
                            }
                            : {
                                ...getBadgeStyles(row.estatus),
                                label: row.estatus,
                            };

                        return (
                            <tr
                                key={row.id}
                                className="bg-white hover:bg-[#F7FAFF] transition-colors"
                            >
                                <td className="px-6 py-3.5 font-mono text-[12px] font-medium text-[#1A2340]">
                                    {row.folio}
                                </td>

                                <td className="px-6 py-3.5">
                                    <span
                                        className={`
                                            inline-flex
                                            items-center
                                            px-2.5
                                            py-1
                                            text-[12px]
                                            font-medium
                                            rounded-full
                                            ${badge.bg}
                                            ${badge.text}
                                        `}
                                    >
                                        {badge.label}
                                    </span>
                                </td>

                                <td className="px-6 py-3.5 font-medium text-[#6B778C]">
                                    {row.placa ?? '-'}
                                </td>

                                <td className="px-6 py-3.5 text-[13px] text-[#8A96B0]">
                                    {formatDate(row.created_at)}
                                </td>

                                <td className="px-6 py-3.5 text-right">
                                    <button
                                        onClick={() => onOpen(row.id)}
                                        className="
                                            inline-flex
                                            items-center
                                            gap-1.5
                                            bg-[#1F69E7]
                                            text-white
                                            px-3.5
                                            py-1.5
                                            rounded-lg
                                            text-xs
                                            font-medium
                                            hover:bg-[#3E83F0]
                                            active:bg-[#1857C3]
                                            transition
                                            shadow-sm
                                            shadow-[#1F69E7]/10
                                        "
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

            {rows.length === 0 && (
                <div className="p-12 text-center text-[#8A96B0] text-[14px]">
                    Sin infracciones encontradas
                </div>
            )}
        </div>
    );
}