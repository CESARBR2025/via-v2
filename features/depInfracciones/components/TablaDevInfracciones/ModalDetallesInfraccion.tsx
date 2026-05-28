import React from 'react';
import CardTable from '@/features/sidebar/components/CardTable';

/* ─── NUEVA INTERFAZ (anidada, del endpoint) ─── */

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

/* ─── PROPS ─── */

interface ModalDetalleInfraccionProps {
    isOpen: boolean;
    onClose: () => void;
    loading: boolean;
    detalle: InfraccionDetalle | null;
}

/* ─── STATUS THEME ─── */

const STATUS_THEME: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    PAGADA: { bg: 'bg-[#EAF8F1]', text: 'text-[#1F7A4D]', dot: 'bg-[#22A06B]', label: 'Pagada' },
    PENDIENTE: { bg: 'bg-[#FFF4E8]', text: 'text-[#B76A1E]', dot: 'bg-[#F08A24]', label: 'Pendiente' },
    REGISTRADA: { bg: 'bg-[#F0F4FF]', text: 'text-[#1F69E7]', dot: 'bg-[#1F69E7]', label: 'Registrada' },
    CANCELADA: { bg: 'bg-[#FFF0F0]', text: 'text-[#B54747]', dot: 'bg-[#E55353]', label: 'Cancelada' },
};

const getStatusTheme = (status?: string) =>
    STATUS_THEME[status ?? ''] ?? {
        bg: 'bg-[#FAFBFF]', text: 'text-[#6B778C]', dot: 'bg-[#8A96B0]', label: status ?? 'Desconocido',
    };

/* ─── UTILITARIOS ─── */

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const formatCurrency = (v: string) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(parseFloat(v || '0'));

/* ─── COMPONENTE PRINCIPAL ─── */

export const ModalDetalleInfraccion: React.FC<ModalDetalleInfraccionProps> = ({
    isOpen,
    onClose,
    loading,
    detalle,
}) => {
    if (!isOpen) return null;

    console.log(detalle)

    const h = detalle?.Header;
    const st = getStatusTheme(h?.estatus_de_infraccion);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-3 sm:p-5">
            <div className="
        w-full max-w-5xl max-h-[90vh] overflow-y-auto
        flex flex-col
        bg-[#FFFFFF] border border-[#EAF1FC] rounded-[20px]
        shadow-[0px_8px_30px_rgba(31,105,231,0.06)]
        font-['Poppins',_sans-serif]
      ">

                {/* ──────── HEADER ──────── */}

                <div className="
          px-5 sm:px-7 py-4 sm:py-5
          border-b border-[#EAF1FC]
          flex items-center justify-between gap-4
          sticky top-0 bg-[#FFFFFF]/95 backdrop-blur-md z-10
        ">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="hidden sm:flex items-center justify-center w-[42px] h-[42px] rounded-xl bg-[#F0F4FF] text-[#1F69E7] shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="text-[11px] font-semibold tracking-[0.12em] text-[#8A96B0] uppercase">
                                    Boleta de Infracción
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold ${st.bg} ${st.text} border border-current/10`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                    {loading ? 'Cargando…' : st.label}
                                </span>
                            </div>
                            <h2 className="text-[18px] sm:text-[22px] font-semibold text-[#1A2340] mt-0.5 truncate">
                                {loading ? 'Obteniendo datos…' : `Folio: ${h?.folio_de_infraccion}`}
                            </h2>
                            {!loading && h && (
                                <p className="text-[12px] text-[#8A96B0] mt-0.5">
                                    Registrada el {formatDate(h.fecha_de_registro_de_infraccion)}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="ml-4 p-2 rounded-xl text-[#8A96B0] hover:text-[#1A2340] hover:bg-[#EFF4FE] transition-colors shrink-0"
                        aria-label="Cerrar"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* ──────── BODY ──────── */}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-10 h-10 border-[3px] border-[#1F69E7] border-t-transparent rounded-full animate-spin" />
                        <p className="text-[14px] text-[#6B778C]">Consultando base de datos…</p>
                    </div>
                ) : detalle ? (
                    <div className="p-5 sm:p-7 overflow-y-auto">

                        {/* Two‑column grid — 1 col en mobile, 2 en md+ */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

                            {/* ═══════ COLUMNA I (3/5) ═══════ */}
                            <div className="md:col-span-3 space-y-5">

                                {/* ─── Fundamento Legal ─── */}
                                <CardTable padding="p-5" className="border-[#EAF1FC]">
                                    <SectionHeading icon={<LegalIcon />} title="Fundamento Legal" />
                                    <div className="flex flex-col gap-4">
                                        <DataRow label="Artículo" value={detalle.Infraccion.articulo_descripcion} />
                                        <DataRow label="Fracción" value={detalle.Infraccion.fraccion_descripcion} />
                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                            <DataRow label="Total UMAs" value={detalle.Infraccion.total_umas} />
                                            <DataRow label="Total Pesos" value={formatCurrency(detalle.Infraccion.total_pesos)} bold />
                                        </div>

                                    </div>
                                </CardTable>

                                {/* ─── Datos del Infractor ─── */}
                                <CardTable padding="p-5" className="border-[#EAF1FC]">
                                    <SectionHeading icon={<UserIcon />} title="Datos del Infractor" />
                                    <div className="mt-4 flex flex-col gap-3">
                                        <DataRow label="Nombre Completo" value={detalle.datos_infractor.nombre_infractor} bold />
                                        <DataRow label="Correo Electrónico" value={detalle.datos_infractor.correo_infractor === 'NO_DATA' ? 'No registrado' : detalle.datos_infractor.correo_infractor} />
                                    </div>
                                </CardTable>

                                {/* ─── Datos del Vehículo ─── */}
                                <CardTable padding="p-5" className="border-[#EAF1FC]">
                                    <SectionHeading icon={<VehicleIcon />} title="Datos del Vehículo" />
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                        <DataRow label="Placa" value={detalle.vehiculo.placa} bold />
                                        <DataRow label="Tipo" value={detalle.vehiculo.tipo === 'NO_DATA' ? 'No especificado' : detalle.vehiculo.tipo} />
                                        <DataRow label="Marca" value={detalle.vehiculo.marca} />
                                        <DataRow label="Modelo" value={detalle.vehiculo.modelo} />
                                        <DataRow label="Año" value={detalle.vehiculo.anio === 'NO_DATA' ? 'No especificado' : detalle.vehiculo.anio} />
                                        <DataRow label="Color" value={detalle.vehiculo.color} />
                                    </div>
                                </CardTable>

                                {/* ─── Garantía Retenida ─── */}
                                <CardTable padding="p-5" className="border-[#EAF1FC]">
                                    <SectionHeading icon={<ShieldIcon />} title="Garantía Retenida" />
                                    <div className="mt-4">
                                        <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#F0F4FF] border border-[#DDE3F0]">
                                            <span className="w-2 h-2 rounded-full bg-[#1F69E7]" />
                                            <span className="text-[14px] font-semibold text-[#1A2340]">
                                                {detalle.garantia.garantia_retenida === 'TRJ_CIRCULACION'
                                                    ? 'Tarjeta de Circulación'
                                                    : detalle.garantia.garantia_retenida || 'Ninguna'}
                                            </span>
                                        </div>
                                    </div>
                                </CardTable>

                            </div>

                            {/* ═══════ COLUMNA II (2/5) ═══════ */}
                            <div className="md:col-span-2 space-y-5">

                                {/* ─── Ubicación ─── */}
                                <CardTable padding="p-5" className="border-[#EAF1FC] h-full">
                                    <SectionHeading icon={<LocationIcon />} title="Ubicación de la Infracción" />
                                    <div className="mt-4 space-y-4">
                                        <DataRow
                                            label="Dirección"
                                            value={`${detalle.ubicacion.calle} #${detalle.ubicacion.numero}`}
                                            bold
                                        />
                                        <DataRow label="Código Postal" value={detalle.ubicacion.cod_postal} />
                                        <DataRow
                                            label="Municipio / Estado"
                                            value={`${detalle.ubicacion.municipio}, ${detalle.ubicacion.estado}`}
                                        />

                                        <div className="pt-3 border-t border-[#EAF1FC]">
                                            <span className="text-[11px] font-semibold tracking-[0.06em] text-[#8A96B0] uppercase block mb-2">
                                                Coordenadas
                                            </span>
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${detalle.ubicacion.latitud},${detalle.ubicacion.longitud}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="
                          inline-flex items-center gap-2
                          px-4 py-2.5 rounded-xl
                          bg-[#F0F4FF] border border-[#DDE3F0]
                          text-[13px] font-mono font-semibold text-[#1A2340]
                          hover:bg-[#E8EDFA] hover:text-[#1F69E7]
                          transition-all duration-200 group w-full
                        "
                                            >
                                                <svg className="w-4 h-4 shrink-0 text-[#1F69E7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                <span className="truncate">{detalle.ubicacion.latitud}, {detalle.ubicacion.longitud}</span>
                                                <svg className="w-3.5 h-3.5 ml-auto shrink-0 text-[#8A96B0] group-hover:text-[#1F69E7] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </CardTable>

                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#8A96B0]">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p className="text-[14px] text-[#6B778C]">No se pudo encontrar el detalle de esta infracción.</p>
                    </div>
                )}

                {/* ──────── FOOTER ──────── */}

                <div className="px-5 sm:px-7 py-4 border-t border-[#EAF1FC] flex justify-end bg-[#FAFBFF]">
                    <button
                        onClick={onClose}
                        className="
              px-5 py-2.5 bg-[#1F69E7] text-[#FFFFFF] text-sm font-medium rounded-xl
              hover:bg-[#3E83F0] active:bg-[#1857C3]
              transition-colors shadow-sm hover:shadow-md
            "
                    >
                        Cerrar Detalles
                    </button>
                </div>

            </div>
        </div>
    );
};

/* ──────── HELPERS ──────── */

/* SectionHeading — icono + título primary */
const SectionHeading: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-2.5">
        <span className="text-[#1F69E7]">{icon}</span>
        <h3 className="text-[13px] font-semibold text-[#1F69E7] uppercase tracking-wider">{title}</h3>
    </div>
);

/* DataRow */
interface DataRowProps {
    label: string;
    value: string | number | null;
    bold?: boolean;
}

const DataRow: React.FC<DataRowProps> = ({ label, value, bold }) => (
    <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-semibold tracking-[0.06em] text-[#8A96B0] uppercase">{label}</span>
        <span className={`text-[14px] text-[#1A2340] break-words ${bold ? 'font-semibold' : 'font-normal'}`}>
            {value ?? '—'}
        </span>
    </div>
);

/* ──────── ICONOS SVG ──────── */

const LegalIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const UserIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

const VehicleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="6" width="22" height="12" rx="2" ry="2" /><circle cx="6" cy="16" r="2" />
        <circle cx="18" cy="16" r="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const LocationIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);
