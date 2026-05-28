'use client';

import { useMemo, useState } from 'react';
import { Eye, Search, X, FileText, Layers } from 'lucide-react';
// IMPORTANTE: Ajusta la ruta de importación según dónde guardaste el archivo del modal
import { ModalDetalleInfraccion } from './ModalDetallesInfraccion';

type Infraccion = {
    id: string;
    folio: string;
    estatus: string;
    placa: string | null;
    created_at: string;
};

type Props = {
    data: {
        data: Infraccion[];
        page: number;
        limit: number;
        total: number;
    };
};

export default function TablaDepInfracciones({ data }: Props) {
    const [searchGlobal, setSearchGlobal] = useState('');

    // Mostrar modal de detalles
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [detalle, setDetalle] = useState<any>(null);

    const rows = data.data;

    const filteredRows = useMemo(() => {
        if (!searchGlobal.trim()) return rows;

        const q = searchGlobal.toLowerCase();

        return rows.filter((r) => {
            return (
                r.folio.toLowerCase().includes(q) ||
                r.placa?.toLowerCase().includes(q) ||
                r.id.toLowerCase().includes(q)
            );
        });
    }, [rows, searchGlobal]);

    function formatDate(date: string) {
        const d = new Date(date);

        return d.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    // Abre el modal inmediatamente en estado "loading" y realiza la petición asíncrona
    async function handleOpenDetalle(id: string) {
        setOpen(true);
        setLoading(true);
        setDetalle(null);

        try {
            const res = await fetch(`/api/depInfracciones/detalleInfraccion/${id}`, {
                cache: 'no-store',
            });

            const json = await res.json();

            if (!json.ok) throw new Error(json.error);

            setDetalle(json.data);
        } catch (error) {
            console.error("Error al obtener el detalle:", error);
        } finally {
            setLoading(false);
        }
    }
    console.log(detalle)

    // Helper para mapear los badges según los tokens exactos de tu `tables.badge`
    function getBadgeStyles(estatus: string) {
        switch (estatus.toUpperCase()) {
            case 'PAGADA':
                return { bg: 'bg-[#EAF8F1]', text: 'text-[#1F7A4D]' };
            case 'PENDIENTE':
            case 'PROCESO':
                return { bg: 'bg-[#FFF4E8]', text: 'text-[#B76A1E]' };
            default:
                return { bg: 'bg-[#FFF0F0]', text: 'text-[#B54747]' };
        }
    }

    return (
        <div
            style={{
                fontFamily: "'Poppins', sans-serif",
                boxShadow: "0px 4px 18px rgba(31, 105, 231, 0.05)"
            }}
            className="rounded-[16px] bg-white border border-[#EAF1FC] text-sm w-full mx-auto flex flex-col flex-1 min-h-0 overflow-hidden"
        >
            {/* HEADER */}
            <div className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-[#EAF1FC]">
                <div className="flex items-center gap-3">
                    {/* Icon Container con el Soft Blue y Primary */}
                    <div className="w-10 h-10 rounded-xl bg-[#F0F4FF] flex items-center justify-center text-[#1F69E7]">
                        <FileText size={20} />
                    </div>

                    <div>
                        <h2 className="text-[18px] font-semibold text-[#1A2340] tracking-tight">
                            Infracciones
                        </h2>
                        <p className="text-[12px] text-[#8A96B0] mt-0.5">
                            Lista operativa (hoy + ayer)
                        </p>
                    </div>
                </div>

                {/* Badge de Conteo Global */}
                <div className="flex items-center gap-1.5 bg-[#F0F4FF] text-[#1F69E7] font-medium text-xs px-2.5 py-1 rounded-lg">
                    <Layers size={13} />
                    <span>{filteredRows.length} / {data.total}</span>
                </div>
            </div>

            {/* SEARCH BAR */}
            <div className="px-6 py-4 border-b border-[#EAF1FC] bg-[#FAFBFF]">
                <div className="relative max-w-sm">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A96B0]"
                    />

                    <input
                        value={searchGlobal}
                        onChange={(e) => setSearchGlobal(e.target.value)}
                        placeholder="Buscar folio, placa o ID..."
                        className="w-full pl-10 pr-8 py-2 text-[14px] bg-white border border-[#DDE3F0] rounded-xl text-[#1A2340] placeholder-[#8A96B0] transition-all focus:outline-none focus:border-[#1F69E7] focus:ring-4 focus:ring-[#1F69E7]/[0.08]"
                    />

                    {searchGlobal && (
                        <button
                            onClick={() => setSearchGlobal('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A96B0] hover:text-[#E55353] transition"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-[14px] border-collapse">
                    <thead className="sticky top-0 bg-[#F8FAFF] border-b border-[#EAF1FC] z-10">
                        <tr>
                            <th className="text-left px-6 py-3.5 text-[13px] font-semibold text-[#6B778C]">Folio</th>
                            <th className="text-left px-6 py-3.5 text-[13px] font-semibold text-[#6B778C]">Estatus</th>
                            <th className="text-left px-6 py-3.5 text-[13px] font-semibold text-[#6B778C]">Placa</th>
                            <th className="text-left px-6 py-3.5 text-[13px] font-semibold text-[#6B778C]">Fecha</th>
                            <th className="text-right px-6 py-3.5 text-[13px] font-semibold text-[#6B778C]">Acción</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-[#F1F4FA]">
                        {filteredRows.map((row) => {
                            const badge = getBadgeStyles(row.estatus);
                            return (
                                <tr
                                    key={row.id}
                                    className="bg-white hover:bg-[#F7FAFF] transition-colors"
                                >
                                    <td className="px-6 py-3.5 font-mono text-[12px] font-medium text-[#1A2340]">
                                        {row.folio}
                                    </td>

                                    <td className="px-6 py-3.5">
                                        <span className={`inline-flex items-center px-2.5 py-1 text-[12px] font-medium rounded-full ${badge.bg} ${badge.text}`}>
                                            {row.estatus}
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
                                            onClick={() => handleOpenDetalle(row.id)}
                                            className="inline-flex items-center gap-1.5 bg-[#1F69E7] text-white px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[#3E83F0] active:bg-[#1857C3] transition shadow-sm shadow-[#1F69E7]/10"
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

                {filteredRows.length === 0 && (
                    <div className="p-12 text-center text-[#8A96B0] text-[14px]">
                        Sin infracciones encontradas
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div className="px-6 py-3.5 border-t border-[#EAF1FC] bg-[#FAFBFF] text-[12px] text-[#8A96B0] flex justify-between items-center font-medium">
                <span>Mostrando {filteredRows.length} registros</span>
                <span className="bg-[#EAF1FC] text-[#6B778C] px-2 py-0.5 rounded-md text-[11px]">
                    Página {data.page}
                </span>
            </div>

            {/* MODAL DETALLE DE INFRACCIÓN */}
            <ModalDetalleInfraccion
                isOpen={open}
                onClose={() => setOpen(false)}
                loading={loading}
                detalle={detalle}
            />
        </div>
    );
}