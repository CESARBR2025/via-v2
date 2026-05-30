'use client';

import { useState } from 'react';
import { Eye, Loader2, FileText } from 'lucide-react';

import { ModalDetallesPublico } from './ModalDetallesPublico';
import { InfraccionPublica } from '../types';

interface Props {
    infracciones: InfraccionPublica[];
}

export default function TablaInfraccionesBuscadorPlaca({
    infracciones,
}: Props) {
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [detalle, setDetalle] = useState<any>(null);

    const handleVerDetalles = async (idInfraccion: number) => {
        try {
            setOpen(true);
            setLoading(true);
            setLoadingId(idInfraccion);

            const response = await fetch(`/api/buscadorGlobal/${idInfraccion}`, {
                method: 'GET',
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error('Error obteniendo detalle');
            }

            const data = await response.json();
            setDetalle(data);
        } catch (error) {
            console.error('[HANDLE_VER_DETALLES]', error);
            setDetalle(null);
        } finally {
            setLoading(false);
            setLoadingId(null);
        }
    };

    return (
        <>
            <div className="w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="overflow-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead>
                            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                                {['Folio', 'Placa', 'Artículo', 'Fracción', 'Calle', 'Número', 'Acciones'].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-[#64748B]"
                                        >
                                            {h}
                                        </th>
                                    ),
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {infracciones.map((item) => (
                                <tr
                                    key={item.infraccion_id}
                                    className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors"
                                >
                                    <td className="px-4 py-3 text-[14px] font-medium text-[#0F172A]">
                                        <div className="flex items-center gap-2">
                                            <FileText size={14} className="text-[#94A3B8] shrink-0" strokeWidth={1.5} />
                                            {item.folio}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-[14px] text-[#0F172A]">
                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#EFF6FF] px-2.5 py-0.5 text-[13px] font-medium text-[#2563EB]">
                                            {item.placa}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-[14px] text-[#0F172A]">{item.articulo}</td>
                                    <td className="px-4 py-3 text-[14px] text-[#0F172A]">{item.fraccion}</td>
                                    <td className="px-4 py-3 text-[14px] text-[#64748B]">{item.calle}</td>
                                    <td className="px-4 py-3 text-[14px] text-[#64748B]">{item.numero}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleVerDetalles(item.infraccion_id)}
                                            disabled={loadingId === item.infraccion_id}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 py-1.5 text-[13px] font-semibold text-white transition-all hover:bg-[#1D4ED8] active:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {loadingId === item.infraccion_id ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    Cargando
                                                </>
                                            ) : (
                                                <>
                                                    <Eye size={14} />
                                                    Detalles
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalDetallesPublico
                isOpen={open}
                onClose={() => setOpen(false)}
                loading={loading}
                detalle={detalle}
            />
        </>
    );
}
