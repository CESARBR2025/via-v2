import React, { useEffect, useRef } from 'react';
import {
    FileText,
    X,
    Clock,
    CircleDollarSign,
    User,
    Car,
    Shield,
    MapPin,
    AlertCircle,
    Info,
    Loader2,
    SearchX,
} from 'lucide-react';

/* ─── INTERFACES ─── */

export interface InfraccionHeader {
    folio_de_infraccion: string;
    fecha_de_registro_de_infraccion: string;
    estatus_de_infraccion: string;
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
}

/* ─── STATUS CONFIG ─── */

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
    PAGADA: {
        bg: 'bg-[#DCFCE7]',
        text: 'text-[#166534]',
        border: 'border-[#86EFAC]',
        dot: 'bg-[#16A34A]',
        label: 'Pagada',
    },
    PENDIENTE: {
        bg: 'bg-[#FEF3C7]',
        text: 'text-[#78350F]',
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

export const ModalDetallesPublico: React.FC<ModalDetalleInfraccionProps> = ({
    isOpen,
    onClose,
    loading,
    detalle,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

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

    if (!isOpen) return null;

    const h = detalle?.Header;
    const cfg = getStatusConfig(h?.estatus_de_infraccion);

    const tieneNombre = detalle?.datos_infractor?.nombre_infractor !== 'NO_DATA';
    const tieneCorreo = detalle?.datos_infractor?.correo_infractor !== 'NO_DATA';
    const ciudadanoPresente = tieneNombre && tieneCorreo;

    const latMapa = ciudadanoPresente
        ? Number(detalle?.ubicacion.latitud)
        : 20.382396874639216;

    const lngMapa = ciudadanoPresente
        ? Number(detalle?.ubicacion.longitud)
        : -99.96107593302017;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0F172A]/[0.72] backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-label="Detalle de infracción"
        >
            <div
                ref={modalRef}
                className="flex w-full max-w-6xl flex-col rounded-2xl overflow-hidden bg-[#F1F5F9]"
                style={{
                    maxHeight: 'calc(100vh - 40px)',
                    boxShadow: '0 32px 80px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(255,255,255,0.10)',
                }}
            >
                {/* ══════════ HERO HEADER ══════════ */}
                <div className="relative bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] overflow-hidden shrink-0">
                    <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/20 opacity-15" />
                    <div className="absolute -right-4 top-8 h-28 w-28 rounded-full bg-white/30 opacity-10" />
                    <div className="absolute -bottom-8 left-1/3 h-36 w-36 rounded-full bg-white/20 opacity-10" />

                    <div className="relative px-6 sm:px-8 pt-6 pb-7">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 min-w-0">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm sm:h-14 sm:w-14">
                                    <FileText size={22} className="text-white" strokeWidth={1.5} />
                                </div>

                                <div className="min-w-0">
                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                        <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-white/60">
                                            Boleta de Infracción
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] font-bold shadow-sm ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                                            {loading ? 'Cargando…' : cfg.label}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                                        {loading ? 'Consultando…' : `Folio #${h?.folio_de_infraccion ?? '—'}`}
                                    </h2>

                                    {!loading && h && (
                                        <p className="mt-1 flex items-center gap-1.5 text-[12px] text-white/60">
                                            <Clock size={11} strokeWidth={2.5} />
                                            Registrada el {formatDate(h.fecha_de_registro_de_infraccion)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                aria-label="Cerrar modal"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white/70 backdrop-blur-sm transition-all duration-150 hover:text-white"
                            >
                                <X size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══════════ BODY ══════════ */}
                <div className="flex-1 overflow-y-auto bg-[#F1F5F9]">
                    {loading ? (
                        <ModalLoadingState />
                    ) : detalle ? (
                        <div className="p-5 sm:p-7">
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">

                                {/* ─── Columna Principal (3/5) ─── */}
                                <div className="flex flex-col gap-5 lg:col-span-3">

                                    <MontoCard
                                        pesos={detalle.Infraccion.total_pesos}
                                        umas={detalle.Infraccion.total_umas}
                                    />

                                    {ciudadanoPresente ? (
                                        <Section
                                            icon={<User size={14} />}
                                            title="Datos del Infractor"
                                            accent="#7C3AED"
                                            accentBg="#F5F3FF"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-lg font-black text-white">
                                                    {sanitize(detalle.datos_infractor.nombre_infractor, 'N')[0].toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <Field label="Nombre Completo" value={sanitize(detalle.datos_infractor.nombre_infractor)} bold />
                                                    <Field label="Correo Electrónico" value={sanitize(detalle.datos_infractor.correo_infractor, 'No registrado')} />
                                                </div>
                                            </div>
                                        </Section>
                                    ) : (
                                        <Section
                                            icon={<AlertCircle size={14} />}
                                            title="Validación Presencial Requerida"
                                            accent="#DC2626"
                                            accentBg="#FEF2F2"
                                        >
                                            <div className="space-y-4 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-5">
                                                <div>
                                                    <h4 className="text-base font-semibold text-[#991B1B]">
                                                        El ciudadano no estuvo presente
                                                    </h4>
                                                    <p className="mt-1 text-sm leading-relaxed text-[#B91C1C]">
                                                        Para continuar con el proceso de validación de la infracción, el titular deberá presentarse en las oficinas de Vive Oriente con la siguiente documentación:
                                                    </p>
                                                </div>

                                                <div className="space-y-3">
                                                    {[
                                                        { title: 'Credencial INE vigente', desc: 'Identificación oficial del titular.' },
                                                        { title: 'Tarjeta de circulación o factura del vehículo', desc: 'Documento para validar la propiedad y la placa del vehículo.' },
                                                    ].map((doc) => (
                                                        <div key={doc.title} className="flex items-start gap-3 rounded-xl border border-[#FECACA] bg-white p-4">
                                                            <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#EF4444]" />
                                                            <div>
                                                                <p className="font-medium text-[#0F172A]">{doc.title}</p>
                                                                <p className="text-sm text-[#64748B]">{doc.desc}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="rounded-xl border border-[#FCD34D] bg-[#FEF3C7] px-4 py-3">
                                                    <p className="text-sm leading-relaxed text-[#92400E]">
                                                        La documentación deberá presentarse físicamente para validar la identidad del propietario y continuar con el proceso administrativo.
                                                    </p>
                                                </div>
                                            </div>
                                        </Section>
                                    )}

                                    <Section
                                        icon={<Car size={14} />}
                                        title="Datos del Vehículo"
                                        accent="#0891B2"
                                        accentBg="#F0F9FF"
                                    >
                                        <div className="mb-5 flex items-center gap-4">
                                            <div className="rounded-xl border-2 border-[#0891B2] bg-[#F0F9FF] px-5 py-2.5">
                                                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0891B2]">Placa</p>
                                                <p className="text-2xl font-black tracking-[0.25em] text-[#0C4A6E]">
                                                    {sanitize(detalle.vehiculo.placa)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                                            <Field label="Marca" value={sanitize(detalle.vehiculo.marca)} />
                                            <Field label="Modelo" value={sanitize(detalle.vehiculo.modelo)} />
                                            <Field label="Año" value={sanitize(detalle.vehiculo.anio, 'No especificado')} />
                                            <Field label="Tipo" value={sanitize(detalle.vehiculo.tipo, 'No especificado')} />
                                            <Field label="Color" value={sanitize(detalle.vehiculo.color)} />
                                        </div>
                                    </Section>

                                    <Section
                                        icon={<FileText size={14} />}
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
                                <div className="flex flex-col gap-5 lg:col-span-2">

                                    <Section
                                        icon={<MapPin size={14} />}
                                        title={ciudadanoPresente ? 'Ubicación de la Infracción' : 'Atención Presencial Requerida'}
                                        accent="#0F766E"
                                        accentBg="#F0FDFA"
                                    >
                                        <div className="space-y-4">
                                            <div className="rounded-xl border border-[#99F6E4] bg-[#F0FDFA] p-3">
                                                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#0F766E]">
                                                    {ciudadanoPresente ? 'Dirección' : 'Oficina de Atención'}
                                                </p>
                                                <p className="text-[15px] font-bold text-[#134E4A]">
                                                    {ciudadanoPresente
                                                        ? `${detalle.ubicacion.calle} #${detalle.ubicacion.numero}`
                                                        : 'Vive Oriente'}
                                                </p>
                                                <p className="mt-0.5 text-[12px] text-[#0F766E]">
                                                    {ciudadanoPresente
                                                        ? `CP ${detalle.ubicacion.cod_postal} · ${detalle.ubicacion.municipio}, ${detalle.ubicacion.estado}`
                                                        : 'Acuda presencialmente para validar la información de la infracción'}
                                                </p>
                                            </div>

                                            {!ciudadanoPresente && (
                                                <div className="rounded-xl border border-[#FCD34D] bg-[#FEF3C7] p-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#F59E0B]" />
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-semibold text-[#78350F]">Validación presencial requerida</p>
                                                            <p className="text-sm leading-relaxed text-[#92400E]">
                                                                No fue posible validar los datos del infractor durante el levantamiento de la infracción. Por favor acuda a Vive Oriente con su documentación oficial para continuar el proceso.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Section>

                                    <Section
                                        icon={<Shield size={14} />}
                                        title="Garantía Retenida"
                                        accent="#F59E0B"
                                        accentBg="#FFFBEB"
                                    >
                                        <div className="flex items-center gap-3 rounded-xl border border-[#FCD34D] bg-[#FFFBEB] p-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B]">
                                                <Shield size={16} className="text-white" strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#92400E]">Garantía</p>
                                                <p className="text-[14px] font-bold text-[#78350F]">
                                                    {detalle.garantia.garantia_retenida === 'TRJ_CIRCULACION'
                                                        ? 'Tarjeta de Circulación'
                                                        : sanitize(detalle.garantia.garantia_retenida, 'Ninguna')}
                                                </p>
                                            </div>
                                        </div>
                                    </Section>

                                </div>
                            </div>
                        </div>
                    ) : (
                        <ModalEmptyState />
                    )}
                </div>

                {/* ══════════ FOOTER ══════════ */}
                <div className="flex shrink-0 items-center justify-between gap-4 border-t border-[#E2E8F0] bg-white px-6 py-4 sm:px-8">
                    <p className="hidden text-[12px] text-[#94A3B8] sm:block">
                        Sistema de Gestión de Infracciones · Municipio de Querétaro
                    </p>
                    <button
                        onClick={onClose}
                        className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] px-6 py-2.5 text-[14px] font-bold text-white shadow-[0_8px_24px_rgba(37,99,235,0.35)] transition-all duration-200 active:scale-95"
                    >
                        <X size={14} strokeWidth={2.5} />
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ══════════ SUBCOMPONENTES ══════════ */

const MontoCard: React.FC<{ pesos: string; umas: string }> = ({ pesos, umas }) => (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#1D4ED8] p-5 shadow-[0_8px_24px_rgba(37,99,235,0.35)]">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-[30%] -translate-y-[30%] rounded-full bg-white/10" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">Monto Total de la Infracción</p>
                <p className="text-4xl font-black tracking-tight text-white">
                    {formatCurrency(pesos)}
                </p>
                <p className="mt-1 text-[13px] font-medium text-white/60">{umas} UMAs equivalentes</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                <CircleDollarSign size={26} className="text-white" strokeWidth={1.5} />
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
    <div className={`overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] ${className}`}>
        <div className="flex items-center gap-3 border-b px-5 py-3.5" style={{ background: accentBg, borderColor: `${accent}22` }}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: accent }}>
                {icon}
            </div>
            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em]" style={{ color: accent }}>
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
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">{label}</span>
        <span className={`break-words text-[14px] leading-snug text-[#1E293B] ${bold ? 'font-bold' : 'font-medium'}`}>
            {value ?? '—'}
        </span>
    </div>
);

/* Divider */
const Divider = () => <div className="h-px bg-[#E2E8F0]" />;

/* Loading State */
const ModalLoadingState = () => (
    <div className="flex flex-col items-center justify-center gap-5 py-32">
        <Loader2 size={36} className="animate-spin text-[#2563EB]" strokeWidth={2} />
        <div className="text-center">
            <p className="text-[15px] font-bold text-[#0F172A]">Consultando base de datos</p>
            <p className="mt-1 text-[13px] text-[#94A3B8]">Obteniendo información de la infracción…</p>
        </div>
    </div>
);

/* Empty State */
const ModalEmptyState = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-28 text-[#94A3B8]">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#F1F5F9]">
            <SearchX size={28} className="text-[#94A3B8]" strokeWidth={1.5} />
        </div>
        <div className="text-center">
            <p className="text-[15px] font-bold text-[#475569]">No se encontró información</p>
            <p className="mt-1 text-[13px] text-[#94A3B8]">No se pudo obtener el detalle de esta infracción.</p>
        </div>
    </div>
);
