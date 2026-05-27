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

    return (
        <div className="rounded-3xl bg-white border border-slate-200/80 text-sm w-full mx-auto flex flex-col flex-1 min-h-0 overflow-hidden shadow-xl shadow-[#0b3b60]/05">

            {/* HEADER */}
            <div className="shrink-0 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0076aa] flex items-center justify-center text-white">
                        <FileText size={18} />
                    </div>

                    <div>
                        <h2 className="font-bold text-[#0b3b60]">
                            Infracciones
                        </h2>
                        <p className="text-xs text-slate-500">
                            Lista operativa (hoy + ayer)
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-[#0076aa] font-bold">
                    <Layers size={14} />
                    {filteredRows.length} / {data.total}
                </div>
            </div>

            {/* SEARCH */}
            <div className="px-6 py-3 border-b">
                <div className="relative max-w-sm">
                    <Search
                        size={14}
                        className="absolute left-3 top-2.5 text-slate-400"
                    />

                    <input
                        value={searchGlobal}
                        onChange={(e) => setSearchGlobal(e.target.value)}
                        placeholder="Buscar folio, placa o ID"
                        className="w-full pl-9 pr-8 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#0076aa]"
                    />

                    {searchGlobal && (
                        <button
                            onClick={() => setSearchGlobal('')}
                            className="absolute right-2 top-2 text-slate-400 hover:text-red-500"
                        >
                            <X size={14} />
                            /</button>
                    )}
                </div>
            </div>

            {/* TABLE */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-50 border-b z-10">
                        <tr>
                            <th className="text-left p-3">Folio</th>
                            <th className="text-left p-3">Estatus</th>
                            <th className="text-left p-3">Placa</th>
                            <th className="text-left p-3">Fecha</th>
                            <th className="text-right p-3">Acción</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredRows.map((row) => (
                            <tr
                                key={row.id}
                                className="border-b hover:bg-slate-50 transition"
                            >
                                <td className="p-3 font-mono text-xs text-[#0b3b60]">
                                    {row.folio}
                                </td>

                                <td className="p-3">
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${row.estatus === 'PAGADA'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-amber-50 text-amber-700'
                                        }`}>
                                        {row.estatus}
                                    </span>
                                </td>

                                <td className="p-3 text-slate-600">
                                    {row.placa ?? '-'}
                                </td>

                                <td className="p-3 text-xs text-slate-500">
                                    {formatDate(row.created_at)}
                                </td>

                                <td className="p-3 text-right">
                                    <button
                                        onClick={() => handleOpenDetalle(row.id)}
                                        className="inline-flex items-center gap-1 bg-[#0076aa] text-white px-3 py-1 rounded text-xs hover:opacity-90 transition shadow-sm"
                                    >
                                        <Eye size={12} />
                                        Detalles
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredRows.length === 0 && (
                    <div className="p-10 text-center text-slate-400">
                        Sin infracciones
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div className="px-6 py-3 border-t bg-slate-50 text-xs text-slate-500 flex justify-between">
                <span>Mostrando {filteredRows.length} registros</span>
                <span>Página {data.page}</span>
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