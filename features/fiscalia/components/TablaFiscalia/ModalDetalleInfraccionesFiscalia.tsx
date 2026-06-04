'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Upload, X, FileText, CheckCircle2, UserCheck, UserX } from 'lucide-react';
import CardTable from '@/features/sidebar/components/CardTable';
import MapboxLocationPreview from '@/features/depInfracciones/components/TablaDevInfracciones/components/MapaPreview';
import { abrirDocumento } from '@/features/expediente/helpers/abrirDocumento';
/* ─── INTERFACES ─── */

export interface InfraccionHeader {
    id_infraccion: string
    folio_de_infraccion: string;
    fecha_de_registro_de_infraccion: string;
    estatus_de_infraccion: string;
    url_ine: string
    url_tarjeta_circulacion: string
    url_inapam: string
    url_evidencias: string[]
    no_oficio_fiscalia?: string;
    url_oficio_fiscalia?: string;
}

export interface InfraccionLegal {
    articulo_descripcion: string;
    fraccion_descripcion: string;
    total_umas: string;
    total_pesos: string;
}

export interface InfraccionInfractor {
    nombre_infractor: string;
    correo_infractor: string;
    curp_infractor: string;
    es_titular: boolean;
}

export interface InfraccionVehiculo {
    placa: string;
    tipo: string;
    marca: string;
    modelo: string;
    anio: string;
    color: string;
}

export interface InfraccionGarantia {
    garantia_retenida: string;
}

export interface InfraccionUbicacion {
    latitud: string;
    longitud: string;
    calle: string;
    cod_postal: string;
    numero: string;
    municipio: string;
    estado: string;
}

export interface InfraccionDetalle {
    Header: InfraccionHeader;
    Infraccion: InfraccionLegal;
    datos_infractor: InfraccionInfractor;
    vehiculo: InfraccionVehiculo;
    garantia: InfraccionGarantia;
    ubicacion: InfraccionUbicacion;
}

interface ModalDetalleInfraccionProps {
    isOpen: boolean;
    onClose: () => void;
    loading: boolean;
    detalle: InfraccionDetalle | null;
    onRefresh?: () => Promise<void>;
}

interface ArchivoAdjunto {
    nombre: string;
    ruta: string;
    esEvidencia?: boolean;
}

/* ─── STATUS CONFIG ─── */

const STATUS_CONFIG: Record<string, {
    bg: string;
    text: string;
    border: string;
    dot: string;
    label: string;
}> = {
    PAGADA: {
        bg: 'bg-[#DCFCE7]',
        text: 'text-[#166534]',
        border: 'border-[#86EFAC]',
        dot: 'bg-[#16A34A]',
        label: 'Pagada',
    },
    PENDIENTE: {
        bg: 'bg-[#FEF3C7]',
        text: 'text-[#92400E]',
        border: 'border-[#FCD34D]',
        dot: 'bg-[#F59E0B]',
        label: 'Pendiente de Pago',
    },
    REGISTRADA: {
        bg: 'bg-[#DBEAFE]',
        text: 'text-[#1E40AF]',
        border: 'border-[#93C5FD]',
        dot: 'bg-[#3B82F6]',
        label: 'Registrada',
    },
    CANCELADA: {
        bg: 'bg-[#FEE2E2]',
        text: 'text-[#991B1B]',
        border: 'border-[#FCA5A5]',
        dot: 'bg-[#EF4444]',
        label: 'Cancelada',
    },
};

const getStatusConfig = (status?: string) =>
    STATUS_CONFIG[status ?? ''] ?? {
        bg: 'bg-[#F1F5F9]',
        text: 'text-[#475569]',
        border: 'border-[#CBD5E1]',
        dot: 'bg-[#94A3B8]',
        label: status ?? 'Desconocido',
    };

/* ─── UTILS ─── */

const formatDate = (d: string): string => {
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatCurrency = (v: string): string => {
    const num = parseFloat(v || '0');
    if (isNaN(num)) return v;
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num);
};

const sanitize = (value: string | null | undefined, fallback = '—'): string => {
    if (!value || value === 'NO_DATA') return fallback;
    return value;
};

/* ─── COMPONENTE PRINCIPAL ─── */

export const ModalDetalleInfraccionesFiscalia: React.FC<ModalDetalleInfraccionProps> = ({
    isOpen,
    onClose,
    loading,
    detalle,
    onRefresh
}) => {
    console.log(detalle)
    const modalRef = useRef<HTMLDivElement>(null);

    const [nombreInfractor, setNombreInfractor] = useState('');
    const [apPaternoInfractor, setapPaternoInfractor] = useState('');
    const [apMaternoInfractor, setapMaternoInfractor] = useState('');
    const [correoInfractor, setCorreoInfractor] = useState('');
    const [curpInfractor, setCurpInfractor] = useState('');
    const [numeroOficio, setNumeroOficio] = useState('');
    const [archivoOficio, setArchivoOficio] = useState<File | null>(null);
    const [loadingRegistro, setLoadingRegistro] = useState(false);
    const [loadingOficio, setLoadingOficio] = useState(false);
    const [registroExitoso, setRegistroExitoso] = useState(false);
    const [oficioGuardado, setOficioGuardado] = useState(false);


    const oficioInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        setNombreInfractor('');
        setapPaternoInfractor('');
        setapMaternoInfractor('');
        setCorreoInfractor('');
        setCurpInfractor('');
        setArchivoOficio(null);

        const noOficio = detalle?.Header?.no_oficio_fiscalia;
        if (noOficio && noOficio !== 'NO_DATA') {
            setNumeroOficio(noOficio);
            setOficioGuardado(true);
        } else {
            setNumeroOficio('');
            setOficioGuardado(false);
        }
    }, [isOpen, detalle?.Header?.no_oficio_fiscalia]);

    if (!isOpen) return null;

    const h = detalle?.Header;
    const cfg = getStatusConfig(h?.estatus_de_infraccion);

    const esTitular = detalle?.datos_infractor?.es_titular === true;
    const latMapa = Number(detalle?.ubicacion.latitud)
    const lngMapa = Number(detalle?.ubicacion.longitud)
    const urlOficioExistente = detalle?.Header?.url_oficio_fiscalia;
    const noOficioFiscalia = detalle?.Header.no_oficio_fiscalia
    console.log(urlOficioExistente)
    console.log(noOficioFiscalia)
    const tieneOficioExistente = urlOficioExistente && noOficioFiscalia !== 'NO_DATA';
    console.log(tieneOficioExistente)

    const handleRegistrarInfractor = async () => {
        try {
            setLoadingRegistro(true);

            if (!nombreInfractor.trim()) {
                alert('Nombre requerido');
                return;
            }
            if (!apPaternoInfractor.trim()) {
                alert('Apellido paterno requerido');
                return;
            }
            if (!apMaternoInfractor.trim()) {
                alert('Apellido materno requerido');
                return;
            }
            if (!correoInfractor.trim()) {
                alert('Correo requerido');
                return;
            }
            if (!curpInfractor.trim()) {
                alert('CURP requerido');
                return;
            }

            const response = await fetch(
                '/api/buscadorGlobal/registrarInfractor',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        folio: detalle?.Header.folio_de_infraccion,
                        nombre_infractor: nombreInfractor,
                        ap_Paterno_Infractor: apPaternoInfractor,
                        ap_Materno_Infractor: apMaternoInfractor,
                        correo_infractor: correoInfractor,
                        curp_infractor: curpInfractor,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('Error registrando infractor');
            }

            const data = await response.json();
            setRegistroExitoso(true);

            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            console.error('[HANDLE_REGISTRAR_INFRACCION]', error);
            alert('Error registrando información');
        } finally {
            setLoadingRegistro(false);
        }
    };

    const handleGuardarOficio = async () => {
        try {
            setLoadingOficio(true);

            if (!numeroOficio.trim()) {
                alert('Número de oficio requerido');
                return;
            }
            if (!archivoOficio) {
                alert('Archivo del oficio requerido');
                return;
            }

            const formData = new FormData();
            formData.append('folio', detalle?.Header.id_infraccion ?? '');
            formData.append('numero_oficio', numeroOficio);
            formData.append('archivo_oficio', archivoOficio);

            const response = await fetch('/api/fiscalia/guardarOficio', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Error guardando oficio');

            console.log(response)

            // 💡 AQUÍ OBTIENES LA DATA:
            const resultado = await response.json();

            // Ahora puedes acceder a lo que te interesa:
            console.log("Mensaje:", resultado.message);
            console.log("Número de Oficio:", resultado.data.numero_oficio);
            console.log("URL del Oficio:", resultado.data.url_oficio_fiscalia);



            setOficioGuardado(true);

            if (onRefresh) await onRefresh();
        } catch (error) {
            console.error('[HANDLE_GUARDAR_OFICIO]', error);
            alert('Error guardando el oficio de liberación');
        } finally {
            setLoadingOficio(false);
        }
    };

    // LOOP para renderizar docukentos
    const HOST =
        process.env.NEXT_PUBLIC_EXPEDIENTE_HOST;

    const documentos: ArchivoAdjunto[] = [
        detalle?.Header.url_ine &&
            detalle?.Header.url_ine !== 'NO_DATA'
            ? {
                nombre: 'INE',
                ruta: detalle?.Header.url_ine,
            }
            : null,

        detalle?.Header.url_inapam &&
            detalle?.Header.url_inapam !== 'NO_DATA'
            ? {
                nombre: 'INAPAM',
                ruta: detalle?.Header.url_inapam,
            }
            : null,

        detalle?.Header.url_tarjeta_circulacion &&
            detalle?.Header.url_tarjeta_circulacion !== 'NO_DATA'
            ? {
                nombre: 'Tarjeta de Circulación',
                ruta: detalle?.Header.url_tarjeta_circulacion,
            }
            : null,
    ].filter(Boolean) as ArchivoAdjunto[];


    const evidencias: ArchivoAdjunto[] =
        (detalle?.Header.url_evidencias ?? []).map(
            (ruta: string, index: number) => ({
                nombre: `Evidencia ${index + 1}`,
                ruta,
                esEvidencia: true,
            })
        );

    console.log(evidencias)
    const archivosAdjuntos: ArchivoAdjunto[] = [
        ...documentos,
        ...evidencias,
    ];
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
            style={{ background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-label="Detalle de infracción"
        >
            <div
                ref={modalRef}
                className="w-full max-w-6xl flex flex-col rounded-xl overflow-hidden"
                style={{
                    maxHeight: 'calc(100vh - 40px)',
                    background: '#F5F7FB',
                    boxShadow: '0 32px 80px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(255,255,255,0.10)',
                }}
            >
                {/* ══════════ HERO HEADER ══════════ */}
                <div className="relative bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] overflow-hidden shrink-0">
                    <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-15 bg-white/30" />
                    <div className="absolute top-8 -right-4 w-28 h-28 rounded-full opacity-10 bg-white/40" />
                    <div className="absolute -bottom-8 left-1/3 w-36 h-36 rounded-full opacity-10 bg-white/30" />

                    <div className="relative px-6 sm:px-8 pt-6 pb-7">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 min-w-0">
                                <div
                                    className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center mt-0.5"
                                    style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)' }}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10 9 9 9 8 9" />
                                    </svg>
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/60">
                                            Boleta de Infracción
                                        </span>
                                        <span className={`
                                            inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full
                                            text-[11px] font-semibold border
                                            ${cfg.bg} ${cfg.text} ${cfg.border}
                                        `}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                            {loading ? 'Cargando…' : cfg.label}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
                                        {loading ? 'Consultando…' : `Folio #${h?.folio_de_infraccion ?? '—'}`}
                                    </h2>

                                    {!loading && h && (
                                        <p className="text-[12px] text-white/60 mt-1 flex items-center gap-1.5">
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            Registrada el {formatDate(h.fecha_de_registro_de_infraccion)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                aria-label="Cerrar modal"
                                className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-all duration-150"
                                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══════════ BODY ══════════ */}
                <div className="flex-1 overflow-y-auto bg-[#F5F7FB]">
                    {loading ? (
                        <LoadingState />
                    ) : detalle ? (
                        <div className="p-5 sm:p-7">
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                                {/* ─── Columna Principal (3/5) ─── */}
                                <div className="lg:col-span-3 flex flex-col gap-5">

                                    {/* Monto Destacado */}
                                    <MontoCard
                                        pesos={detalle.Infraccion.total_pesos}
                                        umas={detalle.Infraccion.total_umas}
                                    />

                                    {/* ======================== */}
                                    {/* DATOS DEL TITULAR */}
                                    {/* ======================== */}
                                    {esTitular ? (
                                        <Section
                                            icon={<UserCheckIcon />}
                                            title="Titular Verificado"
                                            accent="#16A34A"
                                            accentBg="#F0FDF4"
                                        >
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 p-4 rounded-xl border border-[#86EFAC] bg-[#F0FDF4]">
                                                    <div className="shrink-0 w-10 h-10 rounded-lg bg-[#16A34A] flex items-center justify-center text-white">
                                                        <CheckCircle2 size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[14px] font-semibold text-[#166534]">
                                                            Datos corroborados en campo
                                                        </p>
                                                        <p className="text-[12px] text-[#16A34A]">
                                                            El ciudadano se identificó como titular. Verifique que los datos sean correctos.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                                                        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#64748B] mb-1">
                                                            Nombre Completo
                                                        </p>
                                                        <p className="text-[15px] font-bold text-[#0F172A]">
                                                            {sanitize(detalle.datos_infractor.nombre_infractor)}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                                                            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#64748B] mb-1">
                                                                Correo Electrónico
                                                            </p>
                                                            <p className="text-[14px] font-medium text-[#0F172A] break-all">
                                                                {sanitize(detalle.datos_infractor.correo_infractor, 'No registrado')}
                                                            </p>
                                                        </div>
                                                        <div className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                                                            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#64748B] mb-1">
                                                                CURP
                                                            </p>
                                                            <p className="text-[14px] font-bold text-[#0F172A] tracking-[0.08em] font-mono">
                                                                {sanitize(detalle.datos_infractor.curp_infractor, 'No registrado')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Section>
                                    ) : (
                                        <Section
                                            icon={<UserXIcon />}
                                            title="Captura de Datos del Titular"
                                            accent="#DC2626"
                                            accentBg="#FEF2F2"
                                        >
                                            <div className="border border-[#FCA5A5] bg-[#FEF2F2] rounded-xl p-5 space-y-5">
                                                <div>
                                                    <h4 className="text-[16px] font-semibold text-[#991B1B]">
                                                        El ciudadano no es el titular
                                                    </h4>
                                                    <p className="mt-1 text-[14px] text-[#DC2626] leading-relaxed">
                                                        Capture los datos reales del titular del vehículo. Todos los campos son obligatorios para continuar con el proceso de liberación.
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[13px] font-medium text-[#0F172A]">Nombre(s)</label>
                                                        <input
                                                            type="text"
                                                            value={nombreInfractor}
                                                            onChange={(e) => setNombreInfractor(e.target.value)}
                                                            placeholder="Ingrese nombre(s)"
                                                            className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-[14px] text-[#0F172A] placeholder-[#94A3B8] transition-all focus:outline-none focus:border-[#DC2626] focus:ring-4 focus:ring-[#FEE2E2]"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[13px] font-medium text-[#0F172A]">Apellido Paterno</label>
                                                        <input
                                                            type="text"
                                                            value={apPaternoInfractor}
                                                            onChange={(e) => setapPaternoInfractor(e.target.value)}
                                                            placeholder="Ingrese apellido paterno"
                                                            className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-[14px] text-[#0F172A] placeholder-[#94A3B8] transition-all focus:outline-none focus:border-[#DC2626] focus:ring-4 focus:ring-[#FEE2E2]"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[13px] font-medium text-[#0F172A]">Apellido Materno</label>
                                                        <input
                                                            type="text"
                                                            value={apMaternoInfractor}
                                                            onChange={(e) => setapMaternoInfractor(e.target.value)}
                                                            placeholder="Ingrese apellido materno"
                                                            className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-[14px] text-[#0F172A] placeholder-[#94A3B8] transition-all focus:outline-none focus:border-[#DC2626] focus:ring-4 focus:ring-[#FEE2E2]"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[13px] font-medium text-[#0F172A]">Correo Electrónico</label>
                                                        <input
                                                            type="email"
                                                            value={correoInfractor}
                                                            onChange={(e) => setCorreoInfractor(e.target.value)}
                                                            placeholder="correo@ejemplo.com"
                                                            className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-[14px] text-[#0F172A] placeholder-[#94A3B8] transition-all focus:outline-none focus:border-[#DC2626] focus:ring-4 focus:ring-[#FEE2E2]"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5 md:col-span-2">
                                                        <label className="text-[13px] font-medium text-[#0F172A]">CURP</label>
                                                        <input
                                                            type="text"
                                                            value={curpInfractor}
                                                            onChange={(e) => setCurpInfractor(e.target.value.toUpperCase())}
                                                            placeholder="Ingrese CURP del titular (18 caracteres)"
                                                            maxLength={18}
                                                            className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-[14px] text-[#0F172A] placeholder-[#94A3B8] transition-all focus:outline-none focus:border-[#DC2626] focus:ring-4 focus:ring-[#FEE2E2] font-mono tracking-wider"
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleRegistrarInfractor}
                                                    disabled={loadingRegistro || registroExitoso}
                                                    className={`
                                                        w-full rounded-lg px-5 py-2.5 text-[14px] font-semibold text-white transition-all duration-200
                                                        ${loadingRegistro
                                                            ? 'cursor-not-allowed bg-[#94A3B8]'
                                                            : registroExitoso
                                                                ? 'cursor-not-allowed bg-[#22C55E]'
                                                                : 'bg-[#DC2626] hover:bg-[#991B1B]'
                                                        }
                                                    `}
                                                >
                                                    {loadingRegistro
                                                        ? 'Registrando...'
                                                        : registroExitoso
                                                            ? '✓ Datos registrados'
                                                            : 'Registrar Datos del Titular'
                                                    }
                                                </button>
                                            </div>
                                        </Section>
                                    )}

                                    {/* Datos del Vehículo */}
                                    <Section
                                        icon={<VehicleIcon />}
                                        title="Datos del Vehículo"
                                        accent="#0891B2"
                                        accentBg="#F0F9FF"
                                    >
                                        <div className="mb-4 flex items-center gap-4">
                                            <div className="px-4 py-2 rounded-lg border-2 border-[#0891B2] bg-[#F0F9FF]">
                                                <p className="text-[10px] font-semibold tracking-[0.15em] text-[#0891B2] uppercase mb-0.5">Placa</p>
                                                <p className="text-xl font-bold tracking-[0.25em] text-[#0C4A6E]" style={{ fontFamily: "'DM Mono', 'Fira Code', monospace" }}>
                                                    {sanitize(detalle.vehiculo.placa)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                                            <Field label="Marca" value={sanitize(detalle.vehiculo.marca)} />
                                            <Field label="Modelo" value={sanitize(detalle.vehiculo.modelo)} />
                                            <Field label="Año" value={sanitize(detalle.vehiculo.anio, 'No especificado')} />
                                            <Field label="Tipo" value={sanitize(detalle.vehiculo.tipo, 'No especificado')} />
                                            <Field label="Color" value={sanitize(detalle.vehiculo.color)} />
                                        </div>
                                    </Section>

                                    {/* Fundamento Legal */}
                                    <Section
                                        icon={<LegalIcon />}
                                        title="Fundamento Legal"
                                        accent="#2563EB"
                                        accentBg="#EFF6FF"
                                    >
                                        <div className="space-y-4">
                                            <Field label="Artículo" value={detalle.Infraccion.articulo_descripcion} />
                                            <Divider />
                                            <Field label="Fracción" value={detalle.Infraccion.fraccion_descripcion} />
                                        </div>
                                    </Section>

                                </div>

                                {/* ─── Columna Lateral (2/5) ─── */}
                                <div className="lg:col-span-2 flex flex-col gap-5">

                                    {/* Ubicación */}
                                    <Section
                                        icon={<LocationIcon />}
                                        title="Ubicación de la Infracción"
                                        accent="#0F766E"
                                        accentBg="#F0FDFA"
                                    >
                                        <div className="space-y-4">
                                            <div className="p-3 rounded-lg border border-[#99F6E4] bg-[#F0FDFA]">
                                                <p className="text-[10px] font-semibold tracking-widest text-[#0F766E] uppercase mb-1">Dirección</p>
                                                <p className="text-[15px] font-bold text-[#134E4A]">
                                                    {`${detalle.ubicacion.calle} #${detalle.ubicacion.numero}`}
                                                </p>
                                                <p className="text-[12px] text-[#0F766E] mt-0.5">
                                                    {`CP ${detalle.ubicacion.cod_postal} · ${detalle.ubicacion.municipio}, ${detalle.ubicacion.estado}`}
                                                </p>
                                            </div>

                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${detalle.ubicacion.latitud},${detalle.ubicacion.longitud}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2.5 p-3 rounded-lg border border-[#A7F3D0] hover:border-[#0F766E] hover:shadow-sm transition-all duration-200 group bg-[#F0FDFA]"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                        <circle cx="12" cy="10" r="3" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-semibold tracking-widest text-[#0F766E] uppercase">Ver en Google Maps</p>
                                                    <p className="text-[11px] font-mono font-semibold text-[#134E4A] truncate">
                                                        {detalle.ubicacion.latitud}, {detalle.ubicacion.longitud}
                                                    </p>
                                                </div>
                                                <svg className="w-3.5 h-3.5 text-[#0F766E] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                    <polyline points="15 3 21 3 21 9" />
                                                    <line x1="10" y1="14" x2="21" y2="3" />
                                                </svg>
                                            </a>

                                            <div className="rounded-lg overflow-hidden border border-[#A7F3D0]">
                                                <MapboxLocationPreview
                                                    lat={latMapa}
                                                    lng={lngMapa}
                                                    height="260px"
                                                />
                                            </div>
                                        </div>
                                    </Section>

                                    {/* Garantía Retenida */}
                                    <Section
                                        icon={<ShieldIcon />}
                                        title="Garantía Retenida"
                                        accent="#F59E0B"
                                        accentBg="#FFFBEB"
                                    >
                                        <div className="flex items-center gap-3 p-3 rounded-lg border border-[#FCD34D] bg-[#FFFBEB]">
                                            <div className="w-9 h-9 rounded-lg bg-[#F59E0B] flex items-center justify-center shrink-0">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold tracking-widest text-[#92400E] uppercase">Garantía</p>
                                                <p className="text-[14px] font-bold text-[#78350F]">
                                                    {detalle.garantia.garantia_retenida === 'TRJ_CIRCULACION'
                                                        ? 'Tarjeta de Circulación'
                                                        : sanitize(detalle.garantia.garantia_retenida, 'Ninguna')}
                                                </p>
                                            </div>
                                        </div>
                                    </Section>

                                    <Section
                                        icon={<ShieldIcon />}
                                        title="Documentación"
                                        accent="#F59E0B"
                                        accentBg="#FFFBEB"
                                    >
                                        <div className="space-y-3">

                                            {archivosAdjuntos.length === 0 ? (
                                                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
                                                    No existen documentos adjuntos
                                                </div>
                                            ) : (
                                                archivosAdjuntos.map((archivo) => (
                                                    <div
                                                        key={`${archivo?.nombre}-${archivo?.ruta}`}
                                                        className="
                        flex
                        items-center
                        justify-between
                        rounded-lg
                        border
                        border-[#FCD34D]
                        bg-[#FFFBEB]
                        p-3
                    "
                                                    >
                                                        <div>
                                                            <p className="text-[10px] font-semibold tracking-widest text-[#92400E] uppercase">
                                                                {archivo?.esEvidencia
                                                                    ? 'Evidencia'
                                                                    : 'Documento'}
                                                            </p>

                                                            <p className="text-[14px] font-bold text-[#78350F]">
                                                                {archivo?.nombre}
                                                            </p>
                                                        </div>

                                                        <button
                                                            onClick={() =>
                                                                abrirDocumento(
                                                                    archivo?.ruta
                                                                )
                                                            }
                                                            className="
                            rounded-lg
                            bg-amber-500
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-white
                        "
                                                        >
                                                            Ver
                                                        </button>
                                                    </div>
                                                ))
                                            )}

                                        </div>
                                    </Section>

                                    {/* ═══════════════════════ */}
                                    {/* OFICIO DE LIBERACIÓN */}
                                    {/* ═══════════════════════ */}
                                    <Section
                                        icon={<FileText size={14} />}
                                        title="Oficio de Liberación"
                                        accent="#2563EB"
                                        accentBg="#EFF6FF"
                                    >
                                        <div className="space-y-4">


                                            {
                                                tieneOficioExistente ? (
                                                    <div>No oficio: {detalle.Header.no_oficio_fiscalia}</div>
                                                ) : (

                                                    <div className="space-y-1.5">
                                                        <p className="text-[12px] text-[#64748B] leading-relaxed">
                                                            Capture el número de oficio y adjunte el documento digital para realizar el match en el sistema.
                                                        </p>
                                                        <label className="text-[12px] font-semibold text-[#0F172A]">
                                                            Número de Oficio
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={numeroOficio}
                                                            onChange={(e) => setNumeroOficio(e.target.value)}
                                                            placeholder="Ej: OFI-LIB-2025-00123"
                                                            disabled={oficioGuardado}
                                                            className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-[14px] text-[#0F172A] placeholder-[#94A3B8] transition-all focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#DBEAFE] disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:cursor-not-allowed"
                                                        />
                                                    </div>

                                                )
                                            }
                                            <div className="space-y-1.5">
                                                <label className="text-[12px] font-semibold text-[#0F172A]">
                                                    Archivo del Oficio (PDF)
                                                </label>

                                                {tieneOficioExistente ? (
                                                    <div className="rounded-xl border border-[#22C55E] bg-[#F0FDF4] p-4">
                                                        <div className="flex items-center justify-between gap-3">


                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="shrink-0 w-9 h-9 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#22C55E]">
                                                                    <CheckCircle2 size={18} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-[13px] font-medium text-[#0F172A] truncate">
                                                                        Oficio adjuntado
                                                                    </p>
                                                                    <p className="text-[11px] text-[#64748B]">
                                                                        Documento digital registrado
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => abrirDocumento(urlOficioExistente)}
                                                                className="shrink-0 rounded-lg bg-[#2563EB] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
                                                            >
                                                                Ver
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <UploadZone
                                                        disabled={oficioGuardado}
                                                        file={archivoOficio}
                                                        inputRef={oficioInputRef}
                                                        onChange={() => {
                                                            const file = oficioInputRef.current?.files?.[0] || null;
                                                            setArchivoOficio(file);
                                                        }}
                                                        onRemove={() => {
                                                            setArchivoOficio(null);
                                                            if (oficioInputRef.current) oficioInputRef.current.value = '';
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            {!tieneOficioExistente && (
                                                <button
                                                    onClick={handleGuardarOficio}
                                                    disabled={loadingOficio || oficioGuardado}
                                                    className={`
                                                        w-full rounded-lg px-5 py-2.5 text-[14px] font-semibold text-white transition-all duration-200
                                                        ${loadingOficio
                                                            ? 'cursor-not-allowed bg-[#94A3B8]'
                                                            : oficioGuardado
                                                                ? 'cursor-not-allowed bg-[#22C55E]'
                                                                : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
                                                        }
                                                    `}
                                                >
                                                    {loadingOficio
                                                        ? 'Guardando...'
                                                        : oficioGuardado
                                                            ? '✓ Oficio registrado'
                                                            : 'Guardar Oficio de Liberación'
                                                    }
                                                </button>
                                            )}
                                        </div>
                                    </Section>

                                </div>
                            </div>
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                </div>

                {/* ══════════ FOOTER ══════════ */}
                <div className="shrink-0 px-6 sm:px-8 py-4 flex items-center justify-between gap-4 border-t border-[#E2E8F0] bg-[#FFFFFF]">
                    <p className="text-[12px] text-[#94A3B8] hidden sm:block">
                        Sistema de Gestión de Infracciones · Municipio de Querétaro
                    </p>
                    <button
                        onClick={onClose}
                        className="ml-auto px-5 py-2 rounded-lg text-[14px] font-semibold text-[#FFFFFF] bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-all duration-200"
                    >
                        Cerrar
                    </button>
                </div>

            </div>
        </div>
    );
};

/* ══════════ SUBCOMPONENTES ══════════ */

/* Monto Destacado */
const MontoCard: React.FC<{ pesos: string; umas: string }> = ({ pesos, umas }) => (
    <div
        className="rounded-xl p-5 relative overflow-hidden"
        style={{
            background: 'linear-gradient(135deg, #1E40AF, #2563EB, #1D4ED8)',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
        }}
    >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white translate-x-[30%] -translate-y-[30%]" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-white/60 mb-1">Monto Total de la Infracción</p>
                <p className="text-3xl font-bold text-white">
                    {formatCurrency(pesos)}
                </p>
                <p className="text-[13px] text-white/60 mt-1 font-medium">{umas} UMAs equivalentes</p>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            </div>
        </div>
    </div>
);

/* Section Card */
interface SectionProps {
    icon: React.ReactNode;
    title: string;
    accent: string;
    accentBg: string;
    children: React.ReactNode;
    className?: string;
}

const Section: React.FC<SectionProps> = ({ icon, title, accent, accentBg, children, className = '' }) => (
    <div
        className={`rounded-xl border overflow-hidden ${className}`}
        style={{ background: '#FFFFFF', borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
    >
        <div
            className="px-5 py-3 flex items-center gap-3 border-b"
            style={{ background: accentBg, borderColor: `${accent}22` }}
        >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: accent }}>
                {icon}
            </div>
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em]" style={{ color: accent }}>
                {title}
            </h3>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

/* Field */
interface FieldProps {
    label: string;
    value: string | number | null | undefined;
    bold?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, value, bold = false }) => (
    <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#94A3B8]">{label}</span>
        <span className={`text-[14px] text-[#0F172A] break-words leading-snug ${bold ? 'font-bold' : 'font-medium'}`}>
            {value ?? '—'}
        </span>
    </div>
);

/* Divider */
const Divider = () => <div className="h-px bg-[#E2E8F0]" />;

/* Loading State */
const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-32 gap-5">
        <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-[#DBEAFE]" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#3B82F6] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <div className="text-center">
            <p className="text-[15px] font-bold text-[#0F172A]">Consultando base de datos</p>
            <p className="text-[13px] text-[#94A3B8] mt-1">Obteniendo información de la infracción…</p>
        </div>
    </div>
);

/* Empty State */
const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-28 gap-4 text-[#94A3B8]">
        <div className="w-16 h-16 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
        </div>
        <div className="text-center">
            <p className="text-[15px] font-bold text-[#475569]">No se encontró información</p>
            <p className="text-[13px] text-[#94A3B8] mt-1">No se pudo obtener el detalle de esta infracción.</p>
        </div>
    </div>
);

/* ──────── UPLOAD ZONE ──────── */

const UploadZone: React.FC<{
    disabled: boolean;
    file: File | null;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: () => void;
    onRemove: () => void;
}> = ({ disabled, file, inputRef, onChange, onRemove }) => (
    <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled && !file) {
                e.preventDefault();
                inputRef.current?.click();
            }
        }}
        onClick={() => { if (!disabled && !file) inputRef.current?.click(); }}
        className={`
            relative rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer
            ${file
                ? 'border-[#22C55E] bg-[#F0FDF4]'
                : 'border-dashed border-[#E2E8F0] bg-white hover:border-[#2563EB] hover:bg-[#F8FAFC]'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
    >
        <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/*"
            disabled={disabled}
            onChange={onChange}
            className="hidden"
        />

        {file ? (
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#22C55E]">
                        <CheckCircle2 size={18} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#0F172A] truncate">{file.name}</p>
                        <p className="text-[11px] text-[#64748B]">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                </div>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="shrink-0 p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#EF4444] transition-colors"
                    aria-label="Eliminar archivo"
                >
                    <X size={15} />
                </button>
            </div>
        ) : (
            <div className="flex items-center gap-3">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
                    <Upload size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#0F172A]">Haz clic para adjuntar</p>
                    <p className="text-[11px] text-[#64748B]">PDF o imagen</p>
                </div>
            </div>
        )}
    </div>
);

/* ──────── ICONOS ──────── */

const LegalIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const UserIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const VehicleIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="6" width="22" height="12" rx="2" ry="2" />
        <circle cx="6" cy="16" r="2" />
        <circle cx="18" cy="16" r="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const LocationIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const UserCheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <polyline points="17 11 19 13 23 9" />
    </svg>
);

const UserXIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="18" y1="8" x2="23" y2="13" />
        <line x1="23" y1="8" x2="18" y2="13" />
    </svg>
);
