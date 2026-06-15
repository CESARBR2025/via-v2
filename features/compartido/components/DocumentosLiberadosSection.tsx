'use client'

import { useState, useEffect } from "react"
import { FileText, ShieldCheck, Download, Eye, ScrollText } from "lucide-react"
import { DetalleCompleto } from "@/features/compartido/components/ModalDetalleGenerico"
import { abrirDocumento } from '@/features/expediente/helpers/abrirDocumento'

function DocOficioRow({ numeroOficio, urlOficio }: { numeroOficio?: string; urlOficio?: string }) {
    return (
        <div className="rounded-xl border border-[#22C55E]/50 bg-[#F0FDF4] p-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#DCFCE7' }}>
                    <ScrollText size={18} className="text-[#16A34A]" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#0F172A]">Oficio de Liberación</p>
                    <p className="text-[11px] text-[#64748B]">
                        No. {numeroOficio && numeroOficio !== 'NO_DATA' ? numeroOficio : '—'}
                    </p>
                </div>
                {urlOficio && (
                    <button
                        onClick={() => abrirDocumento(urlOficio)}
                        className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-colors"
                        style={{ background: '#22C55E' }}
                    >
                        <Eye size={13} />
                        Ver oficio
                    </button>
                )}
            </div>
        </div>
    )
}

export default function DocumentosLiberadosSection({ detalle }: { detalle: DetalleCompleto }) {
    const h = detalle.Header;
    const [docsLiberacion, setDocsLiberacion] = useState<{ tipo: string; label: string; url: string }[]>([]);
    const [loadingLiberacion, setLoadingLiberacion] = useState(true);
    const [descargandoOrden, setDescargandoOrden] = useState(false);

    const handleDownloadOrden = async () => {
        if (!h?.id_infraccion) return;
        setDescargandoOrden(true);
        try {
            const res = await fetch(`/api/liberaciones/descargarOrden/${h.id_infraccion}`);
            if (!res.ok) throw new Error('Error al generar la orden');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const folio = h.folio_de_infraccion?.replace(/[^a-zA-Z0-9_-]/g, '_') || h.id_infraccion;
            a.download = `orden_salida_${folio}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('[DESCARGAR ORDEN]', error);
        } finally {
            setDescargandoOrden(false);
        }
    };

    useEffect(() => {
        if (!h?.id_infraccion) return;
        fetch(`/api/liberaciones/documentos/${h.id_infraccion}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data?.solicitud) {
                    const map: Record<string, string> = {
                        factura: 'Factura',
                        ine_titular: 'INE del Titular',
                        ine_representante_legal: 'INE del Rep. Legal',
                        comprobante_domicilio: 'Comprobante de Domicilio',
                        tarjeta_circulacion: 'Tarjeta de Circulación',
                        oficio_liberacion_fiscalia: 'Oficio Lib. Fiscalía',
                        oficio_liberacion_juzgado: 'Oficio Lib. Juzgado Cívico',
                        poder_notarial: 'Poder Notarial',
                        constancia_situacion_fiscal: 'Cte. Situación Fiscal',
                    };
                    setDocsLiberacion(
                        (data.documentos || []).map((d: any) => ({
                            tipo: d.tipo,
                            label: map[d.tipo] || d.tipo,
                            url: d.url,
                        })),
                    );
                }
            })
            .catch(() => { })
            .finally(() => setLoadingLiberacion(false));
    }, [h?.id_infraccion]);

    const rawDocs: ({ name: string; url: string; icon: React.ReactNode } | null)[] = [
        h?.url_ine && h.url_ine !== 'NO_DATA' ? { name: 'INE', url: h.url_ine, icon: <FileText size={14} /> } : null,
        h?.url_inapam && h.url_inapam !== 'NO_DATA' ? { name: 'INAPAM', url: h.url_inapam, icon: <FileText size={14} /> } : null,
        h?.url_tarjeta_circulacion && h.url_tarjeta_circulacion !== 'NO_DATA' ? { name: 'Tarjeta de Circulación', url: h.url_tarjeta_circulacion, icon: <FileText size={14} /> } : null,
    ];
    const docs = rawDocs.filter(Boolean) as { name: string; url: string; icon: React.ReactNode }[];

    const evidencias = (h?.url_evidencias ?? []).map((url, i) => ({
        name: `Evidencia ${i + 1}`,
        url,
        icon: <FileText size={14} />,
    }));

    const allDocs = [...docs, ...evidencias];
    const tieneLiberacion = docsLiberacion.length > 0;

    return (
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#DCFCE7' }}>
                    <ShieldCheck size={17} className="text-[#16A34A]" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-[#0F172A] tracking-tight">Historial de Documentación</h3>
                    <p className="text-[12px] text-[#64748B]">Infracción liberada por liberaciones</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {h?.url_orden_salida_liberaciones && h.url_orden_salida_liberaciones !== 'NO_DATA' && (
                        <button
                            onClick={() => abrirDocumento(h.url_orden_salida_liberaciones!)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all duration-150 border"
                            style={{
                                background: '#EFF6FF',
                                borderColor: '#BFDBFE',
                                color: '#2563EB',
                            }}
                        >
                            <Eye size={14} />
                            Ver
                        </button>
                    )}
                    <button
                        onClick={handleDownloadOrden}
                        disabled={descargandoOrden}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-all duration-150 disabled:opacity-50"
                        style={{ background: '#2563EB' }}
                        onMouseEnter={(e) => { if (!descargandoOrden) e.currentTarget.style.background = '#1D4ED8'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#2563EB'; }}
                    >
                        <Download size={14} />
                        {descargandoOrden ? 'Generando...' : 'Descargar'}
                    </button>
                </div>
            </div>

            <div className="p-5 space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <FileText size={14} className="text-[#64748B]" />
                        <h4 className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider">
                            Documentos de la infracción
                        </h4>
                    </div>
                    {allDocs.length === 0 ? (
                        <p className="text-[13px] text-[#94A3B8]">Sin documentos adjuntos</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {allDocs.map((doc) => {
                                const esOficio = doc.name === 'Oficio de Liberación';
                                return (
                                    <div
                                        key={doc.name}
                                        className="flex items-center gap-3 p-3 rounded-lg border transition-colors"
                                        style={{
                                            background: esOficio ? '#F0FDF4' : '#F8FAFC',
                                            borderColor: esOficio ? '#BBF7D0' : '#E2E8F0',
                                        }}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ background: esOficio ? '#DCFCE7' : '#EFF6FF' }}
                                        >
                                            <span className={esOficio ? 'text-[#16A34A]' : 'text-[#2563EB]'}>{doc.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-medium text-[#0F172A] truncate">{doc.name}</p>
                                            <p className="text-[11px] text-[#94A3B8]">Digital</p>
                                        </div>
                                        <button
                                            onClick={() => abrirDocumento(doc.url)}
                                            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-colors"
                                            style={{ background: '#2563EB' }}
                                        >
                                            <Eye size={11} />
                                            Ver
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {tieneLiberacion && (
                    <>
                        <div className="h-px bg-[#E2E8F0]" />
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <FileText size={14} className="text-[#F59E0B]" />
                                <h4 className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider">
                                    Documentos subidos por el ciudadano
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {docsLiberacion.map((doc) => (
                                    <div
                                        key={doc.tipo}
                                        className="flex items-center gap-3 p-3 rounded-lg border transition-colors"
                                        style={{
                                            background: '#FFFBEB',
                                            borderColor: '#FDE68A',
                                        }}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ background: '#FEF3C7' }}
                                        >
                                            <FileText size={14} className="text-[#D97706]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-medium text-[#0F172A] truncate">{doc.label}</p>
                                            <p className="text-[11px] text-[#94A3B8]">Liberación</p>
                                        </div>
                                        <button
                                            onClick={() => abrirDocumento(doc.url)}
                                            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-colors"
                                            style={{ background: '#F59E0B' }}
                                        >
                                            <Eye size={11} />
                                            Ver
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {h?.url_oficio_fiscalia && h.url_oficio_fiscalia !== 'NO_DATA' && (
                    <>
                        <div className="h-px bg-[#E2E8F0]" />
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <FileText size={14} className="text-[#F59E0B]" />
                                <h4 className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider">
                                    Documentos externos
                                </h4>
                            </div>
                            <DocOficioRow
                                numeroOficio={h.no_oficio_fiscalia}
                                urlOficio={h.url_oficio_fiscalia}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
