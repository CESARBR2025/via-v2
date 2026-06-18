'use client';

import { useState, useEffect, useCallback } from 'react';
import { abrirDocumento } from '@/features/expediente/helpers/abrirDocumento';
import {
    FileText,
    CheckCircle2,
    XCircle,
    Eye,
    Loader2,
    MessageSquare,
    Receipt,
    IdCard,
    Home,
    Car,
    FileBadge2,
    ScrollText,
    FileCheck,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

type Documento = {
    id: string;
    tipo: string;
    url: string;
    estatusRevision: string | null;
    observaciones: string | null;
};

const DOC_ICONS: Record<string, React.ReactNode> = {
    factura: <Receipt size={14} />,
    ine_titular: <IdCard size={14} />,
    ine_representante_legal: <IdCard size={14} />,
    comprobante_domicilio: <Home size={14} />,
    tarjeta_circulacion: <Car size={14} />,
    oficio_liberacion_fiscalia: <FileBadge2 size={14} />,
    oficio_liberacion_juzgado: <FileCheck size={14} />,
    poder_notarial: <ScrollText size={14} />,
    constancia_situacion_fiscal: <FileText size={14} />,
};

const DOC_LABELS: Record<string, string> = {
    factura: 'Factura',
    ine_titular: 'INE del Titular',
    comprobante_domicilio: 'Comprobante de Domicilio',
    tarjeta_circulacion: 'Tarjeta de Circulación',
    oficio_liberacion_fiscalia: 'Oficio Lib. Fiscalía',
    oficio_liberacion_juzgado: 'Oficio Lib. Juzgado Cívico',
    ine_representante_legal: 'INE del Rep. Legal',
    poder_notarial: 'Poder Notarial',
    constancia_situacion_fiscal: 'Cte. Situación Fiscal',
};

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
    ACEPTADO: { bg: '#DCFCE7', text: '#166534', label: 'Aceptado', icon: <CheckCircle2 size={10} /> },
    RECHAZADO: { bg: '#FEE2E2', text: '#991B1B', label: 'Rechazado', icon: <XCircle size={10} /> },
};

export default function RevisionDocumentosSection({
    infraccionId,
    onValidated,
}: {
    infraccionId: string;
    onValidated?: () => void;
}) {
    const [documentos, setDocumentos] = useState<Documento[]>([]);
    const [loading, setLoading] = useState(true);
    const [accionando, setAccionando] = useState<string | null>(null);
    const [rechazoDoc, setRechazoDoc] = useState<string | null>(null);
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [mostrarObs, setMostrarObs] = useState(false);

    const fetchDocs = useCallback(async () => {
        setLoading(true);
        const res = await fetch(`/api/liberaciones/documentos/${infraccionId}`);
        if (res.ok) {
            const data = await res.json();
            setDocumentos(data.documentos);
        }
        setLoading(false);
    }, [infraccionId]);
    useEffect(() => { fetchDocs(); }, [fetchDocs]);

    const handleRevision = async (docId: string, accion: 'ACEPTADO' | 'RECHAZADO', observaciones?: string) => {
        setAccionando(docId);
        try {
            await fetch('/api/liberaciones/revisarDocumento', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentoId: docId, accion, observaciones }),
            });
            await fetchDocs();
        } finally {
            setAccionando(null);
        }
    };

    const [finalizando, setFinalizando] = useState(false);
    const [finalizadoEstatus, setFinalizadoEstatus] = useState<string | null>(null);

    const handleFinalizar = async () => {
        if (stats.pendientes > 0) return;
        setFinalizando(true);
        try {
            const res = await fetch('/api/liberaciones/finalizarRevision', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ infraccionId }),
            });
            if (res.ok) {
                const data = await res.json();
                setFinalizadoEstatus(data.estatus);
                onValidated?.();
            } else {
                const data = await res.json();
                console.error('[FINALIZAR]', data.error);
            }
        } catch (err) {
            console.error('[FINALIZAR]', err);
        } finally {
            setFinalizando(false);
        }
    };

    const stats = {
        pendientes: documentos.filter((d) => !d.estatusRevision || d.estatusRevision === 'PENDIENTE').length,
        aceptados: documentos.filter((d) => d.estatusRevision === 'ACEPTADO').length,
        rechazados: documentos.filter((d) => d.estatusRevision === 'RECHAZADO').length,
    };

    if (loading) {
        return (
            <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-8 flex items-center justify-center gap-3 text-[14px] text-[#64748B] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-3">
                    <Loader2 size={18} className="animate-spin text-[#2563EB]" />
                    <span>Cargando documentos del ciudadano</span>
                </div>
            </div>
        );
    }

    if (documentos.length === 0) return null;

    const tieneObservaciones = documentos.some((d) => d.observaciones);

    return (
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">

            {/* HEADER */}
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#EFF6FF' }}>
                    <FileText size={17} className="text-[#2563EB]" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-[#0F172A] tracking-tight">Documentos del Ciudadano</h3>
                    <p className="text-[12px] text-[#64748B]">Revisa y dictamina cada documento</p>
                </div>

                {/* STATS */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: '#F8FAFC' }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: '#94A3B8' }} />
                        <span className="text-[12px] font-semibold text-[#64748B]">{stats.pendientes}</span>
                        <span className="text-[10px] text-[#94A3B8]">pend.</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: '#F0FDF4' }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
                        <span className="text-[12px] font-semibold text-[#16A34A]">{stats.aceptados}</span>
                        <span className="text-[10px] text-[#22C55E]">acept.</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: '#FEF2F2' }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: '#EF4444' }} />
                        <span className="text-[12px] font-semibold text-[#DC2626]">{stats.rechazados}</span>
                        <span className="text-[10px] text-[#EF4444]">rechaz.</span>
                    </div>
                </div>
            </div>

            {/* PROGRESS BAR */}
            {documentos.length > 0 && (
                <div className="h-1 w-full flex">
                    <div
                        className="h-full transition-all duration-500"
                        style={{
                            width: `${(stats.aceptados / documentos.length) * 100}%`,
                            background: '#22C55E',
                        }}
                    />
                    <div
                        className="h-full transition-all duration-500"
                        style={{
                            width: `${(stats.rechazados / documentos.length) * 100}%`,
                            background: '#EF4444',
                        }}
                    />
                    <div
                        className="h-full transition-all duration-500"
                        style={{
                            width: `${(stats.pendientes / documentos.length) * 100}%`,
                            background: '#E2E8F0',
                        }}
                    />
                </div>
            )}

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr style={{ background: '#F8FAFC' }}>
                            <th className="text-left px-6 py-3.5 text-[11px] font-semibold tracking-widest uppercase text-[#64748B]">
                                Documento
                            </th>
                            <th className="text-left px-6 py-3.5 text-[11px] font-semibold tracking-widest uppercase text-[#64748B]">
                                Estatus
                            </th>
                            <th className="text-right px-6 py-3.5 text-[11px] font-semibold tracking-widest uppercase text-[#64748B]">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: '#F1F5F9' }}>
                        {documentos.map((doc, idx) => {
    const pendiente = !doc.estatusRevision || doc.estatusRevision === 'PENDIENTE';
    const aceptado = doc.estatusRevision === 'ACEPTADO';
    const rechazado = doc.estatusRevision === 'RECHAZADO';
    const badge = (aceptado || rechazado) ? STATUS_BADGE[doc.estatusRevision!] : null;

                            return (
                                <tr
                                    key={doc.id}
                                    className="group transition-all duration-200"
                                    style={{
                                        background: aceptado
                                            ? 'rgba(34,197,94,0.03)'
                                            : rechazado
                                                ? 'rgba(239,68,68,0.03)'
                                                : undefined,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!aceptado && !rechazado) e.currentTarget.style.background = '#F8FAFC';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!aceptado && !rechazado) e.currentTarget.style.background = '';
                                    }}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3.5">
                                            <div
                                                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200"
                                                style={{
                                                    background: aceptado
                                                        ? '#DCFCE7'
                                                        : rechazado
                                                            ? '#FEE2E2'
                                                            : '#F1F5F9',
                                                }}
                                            >
                                                <span className={aceptado ? 'text-[#16A34A]' : rechazado ? 'text-[#DC2626]' : 'text-[#64748B]'}>
                                                    {DOC_ICONS[doc.tipo] || <FileText size={14} />}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-medium text-[#0F172A] truncate">
                                                    {DOC_LABELS[doc.tipo] || doc.tipo}
                                                </p>
                                                <p className="text-[11px] text-[#94A3B8]">
                                                    Documento #{idx + 1}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        {pendiente ? (
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] animate-pulse" />
                                                <span className="text-[12px] font-medium text-[#94A3B8]">Pendiente de revisión</span>
                                            </div>
                                        ) : badge ? (
                                            <span
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
                                                style={{ background: badge.bg, color: badge.text }}
                                            >
                                                {badge.icon}
                                                {badge.label}
                                            </span>
                                        ) : null}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => abrirDocumento(doc.url)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] active:bg-[#F1F5F9] text-[11px] font-semibold text-[#64748B] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150"
                                            >
                                                <Eye size={13} />
                                                Ver
                                            </button>

                                            {pendiente && accionando !== doc.id && (
                                                <>
                                                    <button
                                                        onClick={() => handleRevision(doc.id, 'ACEPTADO')}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white shadow-[0_1px_2px_rgba(34,197,94,0.3)] transition-all duration-150 hover:shadow-[0_2px_8px_rgba(34,197,94,0.4)] active:scale-[0.97]"
                                                        style={{ background: '#22C55E' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#16A34A'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = '#22C55E'}
                                                    >
                                                        <CheckCircle2 size={12} />
                                                        Aceptar
                                                    </button>
                                                    <button
                                                        onClick={() => { setRechazoDoc(doc.id); setMotivoRechazo(''); }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white shadow-[0_1px_2px_rgba(239,68,68,0.3)] transition-all duration-150 hover:shadow-[0_2px_8px_rgba(239,68,68,0.4)] active:scale-[0.97]"
                                                        style={{ background: '#EF4444' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#DC2626'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = '#EF4444'}
                                                    >
                                                        <XCircle size={12} />
                                                        Rechazar
                                                    </button>
                                                </>
                                            )}

                                            {accionando === doc.id && (
                                                <div className="flex items-center gap-2 px-3 py-1.5">
                                                    <Loader2 size={14} className="animate-spin text-[#2563EB]" />
                                                    <span className="text-[11px] font-medium text-[#2563EB]">Procesando...</span>
                                                </div>
                                            )}

                                            {aceptado && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold select-none"
                                                    style={{ background: '#DCFCE7', color: '#16A34A' }}>
                                                    <CheckCircle2 size={12} />
                                                    Bloqueado
                                                </span>
                                            )}

                                            {rechazado && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold select-none"
                                                    style={{ background: '#FEE2E2', color: '#DC2626' }}>
                                                    <XCircle size={12} />
                                                    Bloqueado
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE RECHAZO */}
            {rechazoDoc && (
                <div className="border-t border-[#E2E8F0] animate-in slide-in-from-bottom-2 duration-200">
                    <div className="px-6 py-5" style={{ background: 'linear-gradient(0deg, #FEF2F2, #FFFFFF)' }}>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-[0_1px_3px_rgba(239,68,68,0.15)]" style={{ background: '#FEE2E2' }}>
                                <AlertTriangle size={18} className="text-[#DC2626]" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <p className="text-[14px] font-semibold text-[#DC2626]">Rechazar documento</p>
                                    <p className="text-[12px] text-[#64748B]">
                                        {DOC_LABELS[documentos.find((d) => d.id === rechazoDoc)?.tipo || ''] || 'Documento'}
                                    </p>
                                </div>
                                <textarea
                                    value={motivoRechazo}
                                    onChange={(e) => setMotivoRechazo(e.target.value)}
                                    placeholder="Describe el motivo del rechazo..."
                                    rows={3}
                                    className="w-full rounded-lg border border-[#FECACA] bg-[#FFFFFF] px-4 py-2.5 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)] focus:outline-none resize-none transition-all duration-150"
                                />
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-[#94A3B8]">
                                        {motivoRechazo.length} / 500 caracteres
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setRechazoDoc(null)}
                                            className="px-4 py-2 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[12px] font-semibold text-[#64748B] transition-all duration-150"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (motivoRechazo.trim()) {
                                                    handleRevision(rechazoDoc, 'RECHAZADO', motivoRechazo.trim());
                                                    setRechazoDoc(null);
                                                    setMotivoRechazo('');
                                                }
                                            }}
                                            disabled={!motivoRechazo.trim()}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-all duration-150 disabled:opacity-50 shadow-[0_1px_2px_rgba(239,68,68,0.3)]"
                                            style={{ background: '#EF4444' }}
                                        >
                                            <XCircle size={13} />
                                            Confirmar rechazo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* OBSERVACIONES EXPANDIBLE */}
            {tieneObservaciones && (
                <div className="border-t border-[#E2E8F0]">
                    <button
                        onClick={() => setMostrarObs(!mostrarObs)}
                        className="w-full flex items-center justify-between px-6 py-3 text-[12px] font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <MessageSquare size={13} />
                            Observaciones ({documentos.filter((d) => d.observaciones).length})
                        </span>
                        {mostrarObs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {mostrarObs && (
                        <div className="divide-y" style={{ borderColor: '#F1F5F9' }}>
                            {documentos.filter((d) => d.observaciones).map((doc) => (
                                <div key={`obs-${doc.id}`} className="px-6 py-3 flex items-start gap-3 bg-[#F8FAFC]">
                                    <MessageSquare size={13} className="text-[#64748B] mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold text-[#0F172A]">{DOC_LABELS[doc.tipo] || doc.tipo}</p>
                                        <p className="text-[12px] text-[#64748B] italic mt-0.5">&ldquo;{doc.observaciones}&rdquo;</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* BOTÓN FINALIZAR */}
            <div className="border-t border-[#E2E8F0] px-6 py-4">
                {finalizadoEstatus === 'REGISTRADA' ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
                        <AlertTriangle size={18} className="text-[#D97706] shrink-0" />
                        <p className="text-[13px] font-medium text-[#92400E]">
                            Se requiere corrección del ciudadano titular, espera a que los suba nuevamente
                        </p>
                    </div>
                ) : finalizadoEstatus === 'PENDIENTE_PAGO' ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                        <CheckCircle2 size={18} className="text-[#16A34A] shrink-0" />
                        <p className="text-[13px] font-medium text-[#166534]">
                            Documentos aprobados, pendiente de pago
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                    background: stats.pendientes === 0 ? '#22C55E' : '#F59E0B',
                                }}
                            />
                            {stats.pendientes === 0
                                ? 'Todos los documentos han sido revisados'
                                : `${stats.pendientes} documento(s) pendiente(s) de revisión`}
                        </div>
                        <button
                            onClick={handleFinalizar}
                            disabled={stats.pendientes > 0 || finalizando}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: stats.pendientes === 0 ? '#2563EB' : '#94A3B8',
                            }}
                            onMouseEnter={(e) => {
                                if (stats.pendientes === 0) e.currentTarget.style.background = '#1D4ED8';
                            }}
                            onMouseLeave={(e) => {
                                if (stats.pendientes === 0) e.currentTarget.style.background = '#2563EB';
                            }}
                        >
                            {finalizando ? (
                                <Loader2 size={15} className="animate-spin" />
                            ) : (
                                <CheckCircle2 size={15} />
                            )}
                            {finalizando ? 'Finalizando...' : 'Finalizar revisión'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
