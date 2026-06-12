'use client'

import { FileText, CheckCircle2 } from "lucide-react"
import { abrirDocumento } from '@/features/expediente/helpers/abrirDocumento'

export default function OficioLiberacionSection({ numeroOficio, urlOficio }: { numeroOficio?: string; urlOficio?: string }) {
    const tieneOficio = urlOficio && urlOficio !== 'NO_DATA'

    return (
        <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
            <div className="px-5 py-3 flex items-center gap-3 border-b" style={{ background: '#EFF6FF', borderColor: '#2563EB22' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#2563EB' }}>
                    <FileText size={14} strokeWidth={2.2} className="text-white" />
                </div>
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#2563EB' }}>Oficio de Liberación</h3>
            </div>
            <div className="p-5 space-y-4">
                <div className="space-y-0.5">
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#94A3B8]">Número de Oficio</p>
                    <p className="text-[14px] font-bold text-[#0F172A]">{numeroOficio && numeroOficio !== 'NO_DATA' ? numeroOficio : '—'}</p>
                </div>

                {tieneOficio ? (
                    <div className="rounded-xl border border-[#22C55E] bg-[#F0FDF4] p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#DCFCE7' }}>
                                    <CheckCircle2 size={18} strokeWidth={2.5} className="text-[#22C55E]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[13px] font-medium text-[#0F172A] truncate">Oficio adjuntado</p>
                                    <p className="text-[11px] text-[#64748B]">Documento digital registrado</p>
                                </div>
                            </div>
                            <button
                                onClick={() => abrirDocumento(urlOficio)}
                                className="shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white transition-colors"
                                style={{ background: '#2563EB' }}
                            >
                                Ver
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed p-4 text-center" style={{ borderColor: '#E2E8F0' }}>
                        <p className="text-[12px] text-[#94A3B8]">Sin oficio de liberación</p>
                    </div>
                )}
            </div>
        </div>
    )
}
