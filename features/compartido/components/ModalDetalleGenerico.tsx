'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    X, FileText, Clock, AlertCircle, User, Shield, MapPin,
    CheckCircle2, UserX, ExternalLink, DollarSign, Car,
    Scale, Hash, FileSpreadsheet, CalendarDays, Image, Receipt,
    ScrollText, Eye, Upload, Loader2
} from 'lucide-react';
import MapboxLocationPreview from '@/features/depInfracciones/components/TablaDevInfracciones/components/MapaPreview';
import { abrirDocumento } from '@/features/expediente/helpers/abrirDocumento';


// ══════════════════════════════ TIPOS ══════════════════════════════

export type DetalleHeader = {
    id_infraccion: string;
    folio_de_infraccion: string;
    fecha_de_registro_de_infraccion: string;
    estatus_de_infraccion: string;
    url_ine: string;
    url_tarjeta_circulacion: string;
    url_inapam: string;
    url_evidencias: string[];
    no_oficio_fiscalia?: string;
    url_oficio_fiscalia?: string;
    estatus_dependencia: string
    no_carpeta_investigacion: string
    appaterno_infractor: string
    url_oficio_pago_corralon?: string
    estatus_orden_pago?: string
    estatus: string
};

export type DetalleInfraccion = {
    articulo_descripcion: string;
    fraccion_descripcion: string;
    total_umas: string | number;
    total_pesos: string | number;
};

export type DetalleInfractor = {
    nombre_infractor: string;
    correo_infractor: string;
    curp_infractor: string;
    es_titular: boolean;
    apmaterno_infractor: string
    appaterno_infractor: string
    nombre_titular_liberacion: string
};

export type DetalleVehiculo = {
    placa: string;
    tipo: string;
    marca: string;
    modelo: string;
    anio: string;
    color: string;
};

export type DetalleGarantia = {
    garantia_retenida: string;
};

export type DetalleUbicacion = {
    latitud: string;
    longitud: string;
    calle: string;
    cod_postal: string;
    numero: string;
    municipio: string;
    estado: string;
};

export type DetalleCompleto = {
    Header: DetalleHeader;
    Infraccion: DetalleInfraccion;
    datos_infractor: DetalleInfractor;
    vehiculo: DetalleVehiculo;
    garantia: DetalleGarantia;
    ubicacion: DetalleUbicacion;
};

interface ModalDetalleGenericoProps {
    isOpen: boolean;
    onClose: () => void;
    loading: boolean;
    detalle: DetalleCompleto | null;
    role: string;
    onRefresh?: () => Promise<void>;
    antesContenido?: React.ReactNode;
    sidebarExtra?: React.ReactNode[];
    mainExtra?: React.ReactNode[];
    fullWidthExtra?: React.ReactNode[];
}

// ══════════════════════════════ HELPERS ══════════════════════════════

const STATUS_MAP: Record<string, { dot: string; bg: string; text: string; label: string }> = {
    PAGADA: { dot: '#22C55E', bg: '#DCFCE7', text: '#166534', label: 'Pagada' },
    PENDIENTE: { dot: '#F59E0B', bg: '#FEF3C7', text: '#92400E', label: 'Pendiente de Pago' },
    REGISTRADA: { dot: '#3B82F6', bg: '#DBEAFE', text: '#1E40AF', label: 'Registrada' },
    CANCELADA: { dot: '#EF4444', bg: '#FEE2E2', text: '#991B1B', label: 'Cancelada' },
};

function getStatus(status?: string) {
    return STATUS_MAP[status ?? ''] ?? { dot: '#94A3B8', bg: '#F1F5F9', text: '#475569', label: status ?? 'Desconocido' };
}

function fmtDate(d: string): string {
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtCurrency(v: string | number): string {
    const n = typeof v === 'string' ? parseFloat(v || '0') : v;
    if (isNaN(n)) return String(v);
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

function sani(value: string | null | undefined, fallback = '—'): string {
    if (!value || value === 'NO_DATA') return fallback;
    return value;
}

// ══════════════════════════════ COMPONENTE PRINCIPAL ══════════════════════════════

export default function ModalDetalleGenerico({
    isOpen, onClose, loading, detalle, role, onRefresh,
    antesContenido, sidebarExtra, mainExtra, fullWidthExtra,
}: ModalDetalleGenericoProps) {
    const ref = useRef<HTMLDivElement>(null);
    console.log(detalle)



    useEffect(() => {
        if (!isOpen) return;
        const cb = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', cb);
        return () => document.removeEventListener('keydown', cb);
    }, [isOpen, onClose]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const h = detalle?.Header;
    const status = getStatus(h?.estatus_de_infraccion);
    const latOk = !isNaN(Number(detalle?.ubicacion.latitud));
    const lngOk = !isNaN(Number(detalle?.ubicacion.longitud));

    const docs: { name: string; path: string; isEvidence?: boolean }[] = [
        h?.url_ine && h.url_ine !== 'NO_DATA' ? { name: 'INE', path: h.url_ine } : null,
        h?.url_inapam && h.url_inapam !== 'NO_DATA' ? { name: 'INAPAM', path: h.url_inapam } : null,
        h?.url_tarjeta_circulacion && h.url_tarjeta_circulacion !== 'NO_DATA' ? { name: 'Tarjeta de Circulación', path: h.url_tarjeta_circulacion } : null,
        h?.url_oficio_pago_corralon ? { name: 'Comprobante de Pago (Corralón)', path: h.url_oficio_pago_corralon } : null,
    ].filter(Boolean) as { name: string; path: string }[];

    const evidence = (h?.url_evidencias ?? []).map((p, i) => ({ name: `Evidencia ${i + 1}`, path: p, isEvidence: true }));
    const allFiles = [...docs, ...evidence];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            style={{ background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog" aria-modal="true"
        >
            <div
                ref={ref}
                className="w-full max-w-5xl flex flex-col rounded-2xl overflow-hidden"
                style={{ maxHeight: 'calc(100vh - 48px)', background: '#FFFFFF', boxShadow: '0 25px 60px rgba(15,23,42,0.25), 0 0 0 1px rgba(226,232,240,0.5)' }}
            >
                {/* ─── HEADER ─── */}
                <div className="relative shrink-0" style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #1D4ED8 100%)' }}>
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.08]" style={{ background: '#FFFFFF', transform: 'translate(30%, -30%)' }} />
                    <div className="absolute -bottom-6 left-1/4 w-24 h-24 rounded-full opacity-[0.06]" style={{ background: '#FFFFFF' }} />

                    <div className="relative px-6 sm:px-8 pt-5 pb-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
                                    <FileText size={20} strokeWidth={1.8} className="text-white" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2.5 flex-wrap mb-0.5">
                                        {loading ? (
                                            <span className="text-[11px] font-semibold tracking-widest uppercase text-white/50">Consultando…</span>
                                        ) : (
                                            <>
                                                <span className="text-[11px] font-semibold tracking-widest uppercase text-white/60">Boleta de Infracción</span>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                                                    style={{ background: status.bg, color: status.text }}>
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
                                                    {status.label}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                        {loading ? 'Consultando infracción…' : `Folio #${h?.folio_de_infraccion ?? '—'}`}
                                    </h2>
                                    {!loading && h && (
                                        <p className="text-[12px] text-white/50 mt-1 flex items-center gap-1.5">
                                            <Clock size={11} strokeWidth={2.5} />
                                            {fmtDate(h.fecha_de_registro_de_infraccion)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button onClick={onClose} aria-label="Cerrar"
                                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                style={{ background: 'rgba(255,255,255,0.15)' }}>
                                <X size={15} strokeWidth={2.5} className="text-white/80" />
                            </button>
                        </div>

                        {antesContenido && (
                            <div className="mt-4 flex items-center gap-3 flex-wrap">{antesContenido}</div>
                        )}
                    </div>
                </div>

                {/* ─── BODY ─── */}
                <div className="flex-1 overflow-y-auto" style={{ background: '#F8FAFC' }}>
                    {loading ? <LoadingState /> : !detalle ? <EmptyState /> : (
                        <div className="p-5 sm:p-7">
                            {fullWidthExtra?.map((s, i) => (
                                <div key={`fwe-${i}`} className="mb-6">{s}</div>
                            ))}
                            <div className="flex flex-col gap-5">

                                {/* 1 ─── FECHA / FOLIO ─── */}
                                <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
                                    <div className="flex items-stretch">
                                        <div className="flex items-center gap-4 px-5 py-4 flex-1">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#EFF6FF' }}>
                                                <CalendarDays size={18} className="text-[#2563EB]" />
                                            </div>
                                            <div>


                                                <p className="text-[11px] text-[#64748B] mt-0.5">
                                                    Folio <span className="font-semibold text-[#0F172A]">{h?.folio_de_infraccion ?? '—'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-5 py-4 shrink-0 border-l border-[#E2E8F0]">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                                                style={{ background: status.bg, color: status.text }}>
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2 ─── UBICACIÓN ─── */}
                                <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
                                    <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center gap-2.5">
                                        <MapPin size={15} className="text-[#0F766E]" />
                                        <h3 className="text-[13px] font-semibold text-[#0F172A]">Ubicación123</h3>
                                    </div>
                                    <div className="p-5 space-y-3">
                                        <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: '#F0FDFA', border: '1px solid #CCFBF1' }}>
                                            <MapPin size={16} className="text-[#0F766E] mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-[14px] font-bold text-[#134E4A]">
                                                    {detalle.ubicacion.calle} #{detalle.ubicacion.numero}
                                                </p>
                                                <p className="text-[12px] text-[#0F766E] mt-0.5">
                                                    CP {detalle.ubicacion.cod_postal} &middot; {detalle.ubicacion.municipio}, {detalle.ubicacion.estado}
                                                </p>
                                            </div>
                                        </div>
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${detalle.ubicacion.latitud},${detalle.ubicacion.longitud}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2.5 p-3 rounded-xl group transition-all"
                                            style={{ background: '#F0FDFA', border: '1px solid #CCFBF1' }}>
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#0F766E' }}>
                                                <MapPin size={14} className="text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-semibold tracking-widest text-[#0F766E] uppercase">Ver en Google Maps</p>
                                                <p className="text-[11px] font-mono font-semibold text-[#134E4A] truncate">{detalle.ubicacion.latitud}, {detalle.ubicacion.longitud}</p>
                                            </div>
                                            <ExternalLink size={14} className="text-[#0F766E]/50 group-hover:text-[#0F766E] transition-colors shrink-0" />
                                        </a>
                                        {latOk && lngOk && (
                                            <div className="rounded-xl overflow-hidden border border-[#CCFBF1]">
                                                <MapboxLocationPreview lat={Number(detalle.ubicacion.latitud)} lng={Number(detalle.ubicacion.longitud)} height="240px" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 3 ─── DATOS DEL INFRACTOR ─── */}
                                <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
                                    <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center gap-2.5">
                                        <User size={15} className="text-[#475569]" />
                                        <h3 className="text-[13px] font-semibold text-[#0F172A]">Datos del Infractor</h3>
                                    </div>
                                    <div className="p-5">
                                        {role === 'fiscalia' && !!detalle.datos_infractor.nombre_titular_liberacion ? (
                                            <TitularVerificado detalle={detalle} />
                                        ) : role === 'fiscalia' ? (
                                            <CapturaTitular />
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
                                                    <p className="text-[10px] font-semibold tracking-widest uppercase text-[#94A3B8] mb-1">Nombre Completo</p>
                                                    <p className="text-[14px] font-semibold text-[#0F172A]">{sani(detalle.datos_infractor.nombre_infractor)} {sani(detalle.datos_infractor.appaterno_infractor)} {sani(detalle.datos_infractor.apmaterno_infractor)}</p>
                                                </div>
                                                <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
                                                    <p className="text-[10px] font-semibold tracking-widest uppercase text-[#94A3B8] mb-1">Correo</p>
                                                    <p className="text-[14px] font-semibold text-[#0F172A]">{sani(detalle.datos_infractor.correo_infractor, 'No registrado')}</p>
                                                </div>
                                                <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
                                                    <p className="text-[10px] font-semibold tracking-widest uppercase text-[#94A3B8] mb-1">CURP</p>
                                                    <p className="text-[14px] font-semibold font-mono text-[#0F172A] tracking-wider">{sani(detalle.datos_infractor.curp_infractor, 'No registrado')}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 4 ─── DATOS DEL TITULAR (condicional) ─── */}
                                {!!detalle.datos_infractor.nombre_titular_liberacion && (
                                    <div className="rounded-xl border border-[#22C55E]/40 bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
                                        <div className="px-5 py-3.5 border-b border-[#22C55E]/20 flex items-center gap-2.5" style={{ background: '#F0FDF4' }}>
                                            <CheckCircle2 size={15} className="text-[#16A34A]" />
                                            <h3 className="text-[13px] font-semibold text-[#0F172A]">Titular Verificado</h3>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                                                <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#22C55E' }}>
                                                    <CheckCircle2 size={24} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-bold text-[#166534]">
                                                        {sani(detalle.datos_infractor.nombre_titular_liberacion)} {sani(detalle.datos_infractor.appaterno_infractor)} {sani(detalle.datos_infractor.apmaterno_infractor)}
                                                    </p>
                                                    <p className="text-[12px] text-[#16A34A] mt-0.5">El ciudadano se identificó como titular</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 5 ─── VEHÍCULO ─── */}
                                <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
                                    <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center gap-2.5">
                                        <Car size={15} className="text-[#0891B2]" />
                                        <h3 className="text-[13px] font-semibold text-[#0F172A]">Vehículo</h3>
                                    </div>
                                    <div className="p-5">
                                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 mb-4" style={{ borderColor: '#0891B2', background: '#F0F9FF' }}>
                                            <Car size={16} className="text-[#0891B2]" />
                                            <div>
                                                <p className="text-[9px] font-semibold tracking-widest text-[#0891B2] uppercase">Placa</p>
                                                <p className="text-lg font-bold tracking-[0.2em] text-[#0C4A6E]" style={{ fontFamily: "'DM Mono', 'Fira Code', monospace" }}>
                                                    {sani(detalle.vehiculo.placa)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <Fld label="Marca" value={sani(detalle.vehiculo.marca)} />
                                            <Fld label="Modelo" value={sani(detalle.vehiculo.modelo)} />
                                            <Fld label="Año" value={sani(detalle.vehiculo.anio, 'N/E')} />
                                            <Fld label="Color" value={sani(detalle.vehiculo.color)} />
                                        </div>
                                    </div>
                                </div>

                                {/* 6 ─── FUNDAMENTO LEGAL ─── */}
                                <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
                                    <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center gap-2.5">
                                        <Scale size={15} className="text-[#7C3AED]" />
                                        <h3 className="text-[13px] font-semibold text-[#0F172A]">Fundamento Legal</h3>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: '#F5F3FF', border: '1px solid #EDE9FE' }}>
                                            <Hash size={16} className="text-[#7C3AED] mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-semibold tracking-widest text-[#7C3AED] uppercase mb-0.5">Artículo</p>
                                                <p className="text-[14px] font-medium text-[#0F172A]">{detalle.Infraccion.articulo_descripcion}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: '#F5F3FF', border: '1px solid #EDE9FE' }}>
                                            <FileSpreadsheet size={16} className="text-[#7C3AED] mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-semibold tracking-widest text-[#7C3AED] uppercase mb-0.5">Fracción</p>
                                                <p className="text-[14px] font-medium text-[#0F172A]">{detalle.Infraccion.fraccion_descripcion}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 7 ─── GARANTÍA + EVIDENCIAS ─── */}
                                <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
                                    <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center gap-2.5">
                                        <Shield size={15} className="text-[#D97706]" />
                                        <h3 className="text-[13px] font-semibold text-[#0F172A]">Garantía Retenida</h3>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#F59E0B' }}>
                                                <Shield size={16} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold tracking-widest text-[#92400E] uppercase">Tipo</p>
                                                <p className="text-[15px] font-bold text-[#78350F]">
                                                    {detalle.garantia.garantia_retenida === 'TRJ_CIRCULACION' ? 'Tarjeta de Circulación'
                                                        : detalle.garantia.garantia_retenida === 'VEHICULO' ? 'Vehículo'
                                                            : sani(detalle.garantia.garantia_retenida, 'Ninguna')}
                                                </p>
                                            </div>
                                        </div>

                                        {evidence.length > 0 && (
                                            <div>
                                                <p className="text-[11px] font-semibold text-[#64748B] mb-2.5 flex items-center gap-1.5">
                                                    <Image size={13} />
                                                    Evidencias ({evidence.length})
                                                </p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {evidence.map((ev) => (
                                                        <div key={ev.name}
                                                            className="flex items-center gap-2.5 p-2.5 rounded-lg transition-colors cursor-pointer hover:bg-[#F8FAFC]"
                                                            style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                                                            onClick={() => abrirDocumento(ev.path)}
                                                        >
                                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#F1F5F9' }}>
                                                                <Image size={14} className="text-[#64748B]" />
                                                            </div>
                                                            <span className="text-[12px] font-medium text-[#0F172A] truncate flex-1 min-w-0">{ev.name}</span>
                                                            <Eye size={12} className="text-[#94A3B8] shrink-0" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 8 ─── MONTOS ─── */}
                                <div className="rounded-xl border border-[#E2E8F0] bg-gradient-to-br from-[#FFFFFF] to-[#F8FAFC] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
                                    <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center gap-2.5">
                                        <DollarSign size={15} className="text-[#2563EB]" />
                                        <h3 className="text-[13px] font-semibold text-[#0F172A]">UMAs a Pagar</h3>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-semibold tracking-widest uppercase text-[#64748B]">Total UMAs</p>
                                                <p className="text-2xl font-bold text-[#0F172A]">{detalle.Infraccion.total_umas} UMAs</p>
                                                <p className="text-[14px] text-[#64748B] font-medium">
                                                    Equivalente a <span className="font-bold text-[#2563EB]">{fmtCurrency(detalle.Infraccion.total_pesos)}</span>
                                                </p>
                                            </div>
                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: '#2563EB', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
                                                <DollarSign size={26} className="text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {role !== 'corralon_mw' && role !== 'corralon_mejia' && <>
                                    {/* 9 ─── HISTORIAL DE DOCUMENTACIÓN ─── */}
                                    <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
                                        <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center gap-2.5">
                                            <FileText size={15} className="text-[#2563EB]" />
                                            <h3 className="text-[13px] font-semibold text-[#0F172A]">Historial de Documentación</h3>
                                        </div>
                                        <div className="p-5">
                                            {allFiles.length === 0 ? (
                                                <div className="rounded-xl border border-dashed p-6 text-center" style={{ borderColor: '#E2E8F0' }}>
                                                    <FileText size={24} className="mx-auto mb-2 text-[#CBD5E1]" />
                                                    <p className="text-[13px] text-[#94A3B8]">Sin documentos adjuntos</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                    {allFiles.map((f) => (
                                                        <div key={`${f.name}-${f.path}`}
                                                            className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                                                            style={{
                                                                background: f.isEvidence ? '#FFFBEB' : '#F8FAFC',
                                                                border: f.isEvidence ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                                                            }}>
                                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                                                style={{ background: f.isEvidence ? '#FEF3C7' : '#EFF6FF' }}>
                                                                {f.isEvidence
                                                                    ? <Image size={15} className="text-[#D97706]" />
                                                                    : <FileText size={15} className="text-[#2563EB]" />
                                                                }
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[12px] font-medium text-[#0F172A] truncate">{f.name}</p>
                                                                <p className="text-[10px] text-[#94A3B8]">{f.isEvidence ? 'Evidencia' : 'Documento'}</p>
                                                            </div>
                                                            <button onClick={() => abrirDocumento(f.path)}
                                                                className="shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white transition-colors"
                                                                style={{ background: '#2563EB' }}>
                                                                <Eye size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>}

                                {/* 10 ─── COMPROBANTE DE PAGO (Corralón MW) ─── */}
                                {(role === 'corralon_mw' || role === 'corralon_mejia') && (
                                    <ComprobantePagoSection
                                        infraccionId={h?.id_infraccion ?? ''}
                                        urlExistente={h?.url_oficio_pago_corralon}
                                        onSuccess={() => onRefresh?.()}
                                    />
                                )}

                                {mainExtra?.map((s, i) => (
                                    <div key={`me-${i}`}>{s}</div>
                                ))}

                                {sidebarExtra?.map((s, i) => (
                                    <div key={`se-${i}`}>{s}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── FOOTER ─── */}
                <div className="shrink-0 px-6 sm:px-8 py-3.5 flex items-center justify-between gap-4 border-t" style={{ borderColor: '#E2E8F0', background: '#FFFFFF' }}>
                    <span className="text-[11px] text-[#94A3B8] hidden sm:block">Sistema de Gesti&oacute;n de Infracciones &middot; Municipio de Quer&eacute;taro</span>
                    <button onClick={onClose}
                        className="ml-auto px-5 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors"
                        style={{ background: '#2563EB' }}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════ DATOS INFRACTOR (role-aware) ══════════════════════════════

function DatosInfractorSection({ detalle, role }: { detalle: DetalleCompleto; role: string }) {
    const esTitular = !!detalle.datos_infractor.nombre_titular_liberacion;
    console.log(detalle)
    console.log(esTitular)

    if (role === 'fiscalia') {
        return esTitular ? <TitularVerificado detalle={detalle} /> : <CapturaTitular />;
    }

    return (
        <Card label="Datos del Infractor" accent="#475569" icon={<User size={14} strokeWidth={2.5} />}>
            <div className="space-y-3">
                <Fld label="Nombre Completo" value={sani(detalle.datos_infractor.nombre_infractor)} bold />
                <Fld label="Correo" value={sani(detalle.datos_infractor.correo_infractor, 'No registrado')} />
                <Fld label="CURP" value={sani(detalle.datos_infractor.curp_infractor, 'No registrado')} />
            </div>
        </Card>
    );
}

function TitularVerificado({ detalle }: { detalle: DetalleCompleto }) {
    return (
        <Card label="Titular Verificado" accent="#16A34A" icon={<CheckCircle2 size={14} strokeWidth={2.5} />}>
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#22C55E' }}>
                        <CheckCircle2 size={20} strokeWidth={2.2} className="text-white" />
                    </div>
                    <div>
                        <p className="text-[14px] font-semibold text-[#166534]">Datos corroborados en campo</p>
                        <p className="text-[12px] text-[#16A34A]">El ciudadano se identific&oacute; como titular.</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="p-3.5 rounded-lg" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        <p className="text-[10px] font-semibold tracking-widest text-[#64748B] uppercase mb-0.5">Nombre Completo</p>
                        <p className="text-[15px] font-bold text-[#0F172A]">{sani(detalle.datos_infractor.nombre_infractor)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-lg" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                            <p className="text-[10px] font-semibold tracking-widest text-[#64748B] uppercase mb-0.5">Correo</p>
                            <p className="text-[13px] font-medium text-[#0F172A] break-all">{sani(detalle.datos_infractor.correo_infractor, 'N/R')}</p>
                        </div>
                        <div className="p-3.5 rounded-lg" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                            <p className="text-[10px] font-semibold tracking-widest text-[#64748B] uppercase mb-0.5">CURP</p>
                            <p className="text-[13px] font-bold text-[#0F172A] tracking-wider font-mono">{sani(detalle.datos_infractor.curp_infractor, 'N/R')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function CapturaTitular() {
    const [nombre, setNombre] = useState('');
    const [paterno, setPaterno] = useState('');
    const [materno, setMaterno] = useState('');
    const [correo, setCorreo] = useState('');
    const [curp, setCurp] = useState('');
    const [loading, setLoading] = useState(false);
    const [exitoso, setExitoso] = useState(false);

    const submit = async () => {
        if (!nombre.trim() || !paterno.trim() || !materno.trim() || !correo.trim() || !curp.trim()) {
            alert('Todos los campos son obligatorios');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/buscadorGlobal/registrarInfractor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre_infractor: nombre,
                    ap_Paterno_Infractor: paterno,
                    ap_Materno_Infractor: materno,
                    correo_infractor: correo,
                    curp_infractor: curp,
                }),
            });
            if (!res.ok) throw new Error();
            setExitoso(true);
        } catch {
            alert('Error registrando informaci&oacute;n');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card label="Captura de Datos del Titular" accent="#DC2626" icon={<UserX size={14} strokeWidth={2.5} />}>
            <div style={{ border: '1px solid #FECACA', background: '#FEF2F2' }} className="rounded-xl p-5 space-y-5">
                <div>
                    <p className="text-[15px] font-semibold text-[#991B1B]">El ciudadano no es el titular</p>
                    <p className="mt-1 text-[13px] text-[#DC2626]">Capture los datos reales del titular del veh&iacute;culo.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Campo label="Nombre(s)" value={nombre} onChange={setNombre} placeholder="Nombre(s)" />
                    <Campo label="Apellido Paterno" value={paterno} onChange={setPaterno} placeholder="Paterno" />
                    <Campo label="Apellido Materno" value={materno} onChange={setMaterno} placeholder="Materno" />
                    <Campo label="Correo" value={correo} onChange={setCorreo} placeholder="correo@ejemplo.com" type="email" />
                    <Campo label="CURP" value={curp} onChange={(v) => setCurp(v.toUpperCase())} placeholder="CURP (18 caracteres)" maxLength={18} mono className="md:col-span-2" />
                </div>
                <button onClick={submit} disabled={loading || exitoso}
                    className="w-full rounded-lg px-5 py-2.5 text-[14px] font-semibold text-white transition-colors"
                    style={{ background: loading ? '#94A3B8' : exitoso ? '#22C55E' : '#DC2626' }}>
                    {loading ? 'Registrando...' : exitoso ? '\u2713 Datos registrados' : 'Registrar Datos del Titular'}
                </button>
            </div>
        </Card>
    );
}

// ══════════════════════════════ SUBCOMPONENTES ══════════════════════════════

function Card({ label, accent, icon, children }: { label: string; accent: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div className="px-5 py-2.5 flex items-center gap-2.5 border-b" style={{ borderColor: '#F1F5F9' }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: accent }}>
                    {icon}
                </div>
                <h3 className="text-[12px] font-semibold tracking-wider uppercase" style={{ color: accent }}>{label}</h3>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

function Fld({ label, value, bold = false }: { label: string; value: string | number | null | undefined; bold?: boolean }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold tracking-widest text-[#94A3B8] uppercase">{label}</span>
            <span className={`text-[14px] text-[#0F172A] leading-snug ${bold ? 'font-bold' : 'font-medium'}`}>{value ?? '—'}</span>
        </div>
    );
}

function Campo({ label, value, onChange, placeholder, type = 'text', maxLength, mono, className }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string;
    type?: string; maxLength?: number; mono?: boolean; className?: string;
}) {
    return (
        <div className={`space-y-1 ${className ?? ''}`}>
            <label className="text-[13px] font-medium text-[#0F172A]">{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder} maxLength={maxLength}
                className={`w-full rounded-lg border px-3 py-2 text-[14px] outline-none transition-all
                    ${mono ? 'font-mono tracking-wider' : ''}`}
                style={{ borderColor: '#E2E8F0', background: '#FFFFFF', color: '#0F172A' }}
                onFocus={(e) => { e.target.style.borderColor = '#DC2626'; e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
            />
        </div>
    );
}

// ══════════════════════════════ LOADING / EMPTY ══════════════════════════════

function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: '#DBEAFE' }} />
                <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: '#2563EB' }} />
            </div>
            <div className="text-center">
                <p className="text-[15px] font-bold text-[#0F172A]">Consultando base de datos</p>
                <p className="text-[13px] text-[#94A3B8] mt-1">Obteniendo informaci&oacute;n de la infracci&oacute;n…</p>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: '#F1F5F9' }}>
                <AlertCircle size={26} strokeWidth={1.5} className="text-[#94A3B8]" />
            </div>
            <div className="text-center">
                <p className="text-[15px] font-bold text-[#475569]">No se encontr&oacute; informaci&oacute;n</p>
                <p className="text-[13px] text-[#94A3B8] mt-1">No se pudo obtener el detalle de esta infracci&oacute;n.</p>
            </div>
        </div>
    );
}

// ══════════════════════════════ COMPROBANTE DE PAGO (Corralón MW) ══════════════════════════════

function ComprobantePagoSection({
    infraccionId,
    urlExistente,
    onSuccess,
}: {
    infraccionId: string;
    urlExistente?: string;
    onSuccess: () => void;
}) {
    const [archivo, setArchivo] = useState<File | null>(null);
    const [subiendo, setSubiendo] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const yaSubido = !!urlExistente && urlExistente !== 'NO_DATA';

    const handleSubmit = async () => {
        if (!archivo) return;
        setSubiendo(true);
        try {
            const fd = new FormData();
            fd.append('infraccionId', infraccionId);
            fd.append('archivo', archivo);

            const res = await fetch('/api/corralon-mw/subirComprobante', {
                method: 'POST',
                body: fd,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Error al subir comprobante');
            }

            onSuccess();
        } catch (error) {
            console.error('[COMPROBANTE PAGO]', error);
        } finally {
            setSubiendo(false);
        }
    };

    return (
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center gap-2.5">
                <Receipt size={15} className="text-[#D97706]" />
                <h3 className="text-[13px] font-semibold text-[#0F172A]">Comprobante de Pago</h3>
            </div>
            <div className="p-5">
                {yaSubido ? (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#F0FDF4' }}>
                            <CheckCircle2 size={28} className="text-[#16A34A]" />
                        </div>
                        <div className="text-center">
                            <p className="text-[14px] font-semibold text-[#0F172A]">Comprobante registrado</p>
                            <p className="text-[12px] text-[#64748B] mt-1">El comprobante de pago ya fue subido correctamente</p>
                        </div>
                        <button
                            onClick={() => abrirDocumento(urlExistente)}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-[12px] font-semibold text-white transition-colors"
                            style={{ background: '#2563EB' }}
                        >
                            <Eye size={14} />
                            Ver comprobante
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div
                            onClick={() => inputRef.current?.click()}
                            className="w-full rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-3 cursor-pointer transition-colors"
                            style={{ borderColor: archivo ? '#2563EB' : '#E2E8F0', background: archivo ? '#EFF6FF' : '#FAFAFA' }}
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                            />
                            {archivo ? (
                                <>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#2563EB' }}>
                                        <FileText size={18} className="text-white" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[13px] font-semibold text-[#0F172A]">{archivo.name}</p>
                                        <p className="text-[11px] text-[#64748B]">{(archivo.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setArchivo(null); if (inputRef.current) inputRef.current.value = ''; }}
                                        className="text-[11px] text-[#EF4444] font-medium hover:underline"
                                    >
                                        Quitar archivo
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F1F5F9' }}>
                                        <Upload size={18} className="text-[#64748B]" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[13px] font-semibold text-[#0F172A]">Seleccionar comprobante</p>
                                        <p className="text-[11px] text-[#94A3B8]">JPG, PNG o PDF &middot; Máx 10 MB</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!archivo || subiendo}
                            className="w-full h-11 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-2 transition disabled:opacity-50"
                            style={{ background: archivo ? '#D97706' : '#E2E8F0' }}
                        >
                            {subiendo ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Subiendo...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    Subir comprobante y finalizar proceso
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
