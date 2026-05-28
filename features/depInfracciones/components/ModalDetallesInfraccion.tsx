import React from 'react';

export interface InfraccionDetalle {
    id: string;
    folio: string;
    seq_valor: string;
    estatus: 'PAGADA' | 'PENDIENTE' | 'CANCELADA' | 'REGISTRADA' | string;
    oficial_id: string;
    patrulla_id: string | null;
    placa_patrulla: string | null;
    articulo_id: string;
    fraccion_id: string;
    grua_id: string | null;
    ciudadano_presente: boolean;
    es_titular: boolean;
    presenta_ine: boolean;
    curp_infractor: string;
    nombre_infractor: string;
    apellido_paterno_infractor: string;
    apellido_materno_infractor: string;
    marca: string;
    modelo: string;
    color: string;
    placa: string;
    latitud: string;
    longitud: string;
    codigo_postal: string;
    colonia: string | null;
    calle: string;
    numero: string;
    municipio: string;
    estado: string;
    tipo_garantia: string;
    garantia_entregada: boolean;
    motivo_retencion: string | null;
    monto_total: string;
    aplica_descuento_inapam: boolean;
    descuento_aplicado: string;
    pago_al_momento: boolean;
    fecha_limite_descuento: string | null;
    monto_final: string;
    created_at: string;
    updated_at: string;
}

interface ModalDetalleInfraccionProps {
    isOpen: boolean;
    onClose: () => void;
    loading: boolean;
    detalle: InfraccionDetalle | null;
}

type EstatusKey = 'PAGADA' | 'PENDIENTE' | 'CANCELADA' | 'REGISTRADA' | (string & {});

const STATUS_THEME: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    PAGADA: { bg: 'bg-[#EAF8F1]', text: 'text-[#1F7A4D]', dot: 'bg-[#22A06B]', label: 'Pagada' },
    PENDIENTE: { bg: 'bg-[#FFF4E8]', text: 'text-[#B76A1E]', dot: 'bg-[#F08A24]', label: 'Pendiente' },
    REGISTRADA: { bg: 'bg-[#F0F4FF]', text: 'text-[#1F69E7]', dot: 'bg-[#1F69E7]', label: 'Registrada' },
    CANCELADA: { bg: 'bg-[#FFF0F0]', text: 'text-[#B54747]', dot: 'bg-[#E55353]', label: 'Cancelada' },
};

const getStatusTheme = (status?: string) =>
    STATUS_THEME[status ?? ''] ?? { bg: 'bg-[#FAFBFF]', text: 'text-[#6B778C]', dot: 'bg-[#8A96B0]', label: status ?? 'Desconocido' };

export const ModalDetalleInfraccion: React.FC<ModalDetalleInfraccionProps> = ({
    isOpen,
    onClose,
    loading,
    detalle,
}) => {
    if (!isOpen) return null;

    const fmt = (val: string) =>
        new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(parseFloat(val || '0'));

    const fd = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const st = getStatusTheme(detalle?.estatus);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col bg-[#FFFFFF] border border-[#EAF1FC] rounded-[20px] shadow-[0px_8px_30px_rgba(31,105,231,0.06)] font-['Poppins',_sans-serif] animate-[fadeIn_200ms_ease-out]">

                {/* ─── HEADER ─── */}
                <div className="px-6 py-5 border-b border-[#EAF1FC] flex items-center justify-between sticky top-0 bg-[#FFFFFF]/95 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-[#F0F4FF] text-[#1F69E7] shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="text-[11px] font-medium tracking-[0.12em] text-[#8A96B0] uppercase">
                                    Boleta de Infracción
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold ${st.bg} ${st.text} border border-current/10`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                    {loading ? 'Cargando…' : st.label}
                                </span>
                            </div>
                            <h2 className="text-[20px] sm:text-[22px] font-semibold text-[#1A2340] mt-0.5 truncate">
                                {loading ? 'Obteniendo datos…' : `Folio: ${detalle?.folio}`}
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 p-2 rounded-xl text-[#8A96B0] hover:text-[#1A2340] hover:bg-[#EFF4FE] transition-colors"
                        aria-label="Cerrar"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* ─── BODY ─── */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-10 h-10 border-[3px] border-[#1F69E7] border-t-transparent rounded-full animate-spin" />
                        <p className="text-[14px] text-[#6B778C]">Consultando base de datos…</p>
                    </div>
                ) : detalle ? (
                    <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">

                        {/* ── FILA 1: Infractor + Vehículo ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <SectionCard icon={<UserIcon />} title="Datos del Infractor">
                                <DataRow label="Nombre Completo" value={`${detalle.nombre_infractor} ${detalle.apellido_paterno_infractor} ${detalle.apellido_materno_infractor}`} bold />
                                <DataRow label="CURP" value={detalle.curp_infractor} monospace />
                                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#EAF1FC]">
                                    <CheckBadge label="Ciudadano presente" checked={detalle.ciudadano_presente} />
                                    <CheckBadge label="Es titular" checked={detalle.es_titular} />
                                    <CheckBadge label="Presentó INE" checked={detalle.presenta_ine} />
                                </div>
                            </SectionCard>

                            <SectionCard icon={<VehicleIcon />} title="Identificación del Vehículo">
                                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                    <DataRow label="Marca" value={detalle.marca} bold />
                                    <DataRow label="Modelo" value={detalle.modelo} bold />
                                    <DataRow label="Color" value={detalle.color} />
                                    <DataRow label="Placas" value={detalle.placa} monospace bold />
                                </div>
                            </SectionCard>
                        </div>

                        {/* ── FILA 2: Ubicación ── */}
                        <SectionCard icon={<LocationIcon />} title="Ubicación de la Infracción">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 space-y-3">
                                    <DataRow label="Dirección" value={`${detalle.calle} #${detalle.numero}${detalle.colonia ? `, Col. ${detalle.colonia}` : ''}`} />
                                    <DataRow label="Municipio / Estado" value={`${detalle.municipio}, ${detalle.estado} — CP ${detalle.codigo_postal}`} />
                                </div>
                                <div className="flex flex-col justify-center bg-[#F0F4FF] rounded-xl p-4 border border-[#DDE3F0]">
                                    <span className="text-[11px] font-semibold tracking-wider text-[#1F69E7] uppercase mb-1">Coordenadas</span>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${detalle.latitud},${detalle.longitud}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[13px] font-mono font-semibold text-[#1A2340] hover:text-[#1F69E7] inline-flex items-center gap-1.5 transition-colors group"
                                    >
                                        {detalle.latitud}, {detalle.longitud}
                                        <svg className="w-3.5 h-3.5 text-[#8A96B0] group-hover:text-[#1F69E7] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </SectionCard>

                        {/* ── FILA 3: Legal + Garantía ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <SectionCard icon={<LegalIcon />} title="Sustento Legal y Unidad" className="lg:col-span-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                                    <div className="space-y-3">
                                        <DataRow label="Artículo (ID)" value={detalle.articulo_id} monospace />
                                        <DataRow label="Fracción (ID)" value={detalle.fraccion_id} monospace />
                                    </div>
                                    <div className="space-y-3">
                                        <DataRow label="Oficial a cargo (ID)" value={detalle.oficial_id} monospace />
                                        <DataRow label="Patrulla / Placa" value={detalle.patrulla_id ? `${detalle.patrulla_id} [${detalle.placa_patrulla}]` : 'Sin asignar'} />
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard icon={<ShieldIcon />} title="Garantía">
                                <div className="flex flex-col h-full">
                                    <DataRow label="Tipo" value={detalle.tipo_garantia === 'TRJ_CIRCULACION' ? 'Tarjeta de Circulación' : detalle.tipo_garantia || 'Ninguna'} bold />
                                    <div className="mt-auto pt-4 border-t border-[#EAF1FC]">
                                        <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${detalle.garantia_entregada ? 'bg-[#EAF8F1] border-[#BFE8D1]' : 'bg-[#FAFBFF] border-dashed border-[#DDE3F0]'}`}>
                                            <span className={`w-2.5 h-2.5 rounded-full ${detalle.garantia_entregada ? 'bg-[#22A06B]' : 'bg-[#B0BBCC]'}`} />
                                            <span className={`text-sm font-semibold ${detalle.garantia_entregada ? 'text-[#1F7A4D]' : 'text-[#8A96B0]'}`}>
                                                {detalle.garantia_entregada ? 'Garantía entregada' : 'Garantía no entregada'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>

                        {/* ── FILA 4: Desglose Financiero ── */}
                        <div className="space-y-3">
                            <SectionHeader icon={<MoneyIcon />} title="Desglose Financiero" />
                            <div className="bg-[#F8FBFF] border-2 border-[#DDE3F0] rounded-[20px] p-5 sm:p-6">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                                    <FinanceBlock label="Monto Base" value={fmt(detalle.monto_total)} />
                                    <FinanceBlock
                                        label="Descuento INAPAM"
                                        value={detalle.aplica_descuento_inapam ? `- ${fmt(detalle.descuento_aplicado)}` : 'No aplica'}
                                        valueColor={detalle.aplica_descuento_inapam ? 'text-[#22A06B]' : 'text-[#8A96B0]'}
                                    />
                                    <FinanceBlock
                                        label="Pago al Momento"
                                        value={detalle.pago_al_momento ? 'Cubierto' : 'Diferido'}
                                        valueColor={detalle.pago_al_momento ? 'text-[#1F7A4D]' : 'text-[#B76A1E]'}
                                    />
                                    <div className="border-t lg:border-t-0 lg:border-l border-[#DDE3F0] pt-4 lg:pt-0 lg:pl-5 flex flex-col justify-center">
                                        <span className="text-[11px] font-semibold tracking-wider text-[#1F69E7] uppercase">Total a liquidar</span>
                                        <span className="text-[26px] font-black font-mono text-[#1A2340] leading-tight">{fmt(detalle.monto_final)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── PIE DE METADATOS ── */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#EAF1FC] text-[11px] text-[#8A96B0]">
                            <span>
                                Secuencia Valor:{' '}
                                <span className="font-mono font-semibold text-[#6B778C]">{detalle.seq_valor}</span>
                            </span>
                            <div className="flex flex-wrap gap-x-5 gap-y-1">
                                <span>
                                    Registro:{' '}
                                    <span className="font-medium text-[#6B778C]">{fd(detalle.created_at)}</span>
                                </span>
                                {detalle.created_at !== detalle.updated_at && (
                                    <span>
                                        Última actualización:{' '}
                                        <span className="font-medium text-[#6B778C]">{fd(detalle.updated_at)}</span>
                                    </span>
                                )}
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

                {/* ─── FOOTER ─── */}
                <div className="px-6 py-4 border-t border-[#EAF1FC] flex justify-end bg-[#FAFBFF]">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-[#1F69E7] text-[#FFFFFF] text-sm font-medium rounded-xl
                                   hover:bg-[#3E83F0] active:bg-[#1857C3]
                                   transition-colors shadow-sm hover:shadow-md"
                    >
                        Cerrar Detalles
                    </button>
                </div>

            </div>
        </div>
    );
};

/* ─── HELPERS ─── */

/* Section */

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-2.5">
        <span className="text-[#1F69E7]">{icon}</span>
        <h3 className="text-[13px] font-semibold text-[#1F69E7] uppercase tracking-wider">{title}</h3>
    </div>
);

const SectionCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    className?: string;
}> = ({ icon, title, children, className = '' }) => (
    <div className={`space-y-3 ${className}`}>
        <SectionHeader icon={icon} title={title} />
        <div className="bg-[#FFFFFF] border border-[#EAF1FC] rounded-[18px] p-5 shadow-[0px_4px_18px_rgba(31,105,231,0.04)] hover:shadow-[0px_4px_18px_rgba(31,105,231,0.08)] transition-shadow">
            {children}
        </div>
    </div>
);

/* DataRow */

interface DataRowProps {
    label: string;
    value: string | number | null;
    bold?: boolean;
    monospace?: boolean;
}

const DataRow: React.FC<DataRowProps> = ({ label, value, bold, monospace }) => (
    <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-semibold tracking-[0.06em] text-[#8A96B0] uppercase">{label}</span>
        {monospace ? (
            <span className="inline-block w-max max-w-full font-mono text-[12px] font-semibold px-2.5 py-1 rounded-lg bg-[#E8EDFA] text-[#1A2340] border border-[#DDE3F0] break-all">
                {value ?? '—'}
            </span>
        ) : (
            <span className={`text-[14px] text-[#1A2340] break-words ${bold ? 'font-semibold' : 'font-normal'}`}>
                {value ?? '—'}
            </span>
        )}
    </div>
);

/* CheckBadge — reemplaza StatusBadge con diseño más limpio */

const CheckBadge: React.FC<{ label: string; checked: boolean }> = ({ label, checked }) => (
    <div
        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center border transition-all duration-150
            ${checked
                ? 'bg-[#EAF8F1] border-[#BFE8D1] shadow-sm'
                : 'bg-[#FAFBFF] border border-dashed border-[#DDE3F0] opacity-70'
            }`}
    >
        {checked ? (
            <svg className="w-4 h-4 text-[#22A06B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        ) : (
            <svg className="w-4 h-4 text-[#B0BBCC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        )}
        <span className={`text-[10px] font-bold uppercase tracking-tight ${checked ? 'text-[#1F7A4D]' : 'text-[#B0BBCC]'}`}>
            {label}
        </span>
    </div>
);

/* FinanceBlock */

const FinanceBlock: React.FC<{ label: string; value: string; valueColor?: string }> = ({ label, value, valueColor = 'text-[#1A2340]' }) => (
    <div>
        <span className="text-[11px] font-semibold tracking-wider text-[#8A96B0] uppercase block mb-1">{label}</span>
        <span className={`text-[16px] font-bold font-mono ${valueColor}`}>{value}</span>
    </div>
);

/* ─── ICONOS SVG (inline, sin dependencias) ─── */

const UserIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

const VehicleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="6" width="22" height="12" rx="2" ry="2" /><circle cx="6" cy="16" r="2" /><circle cx="18" cy="16" r="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
);

const LocationIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);

const LegalIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const MoneyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);
