// components/ModalDetalleInfraccion.tsx
import React from 'react';

// Tipado estricto basado en tu objeto de datos
export interface InfraccionDetalle {
    id: string;
    folio: string;
    seq_valor: string;
    estatus: 'PAGADA' | 'PENDIENTE' | 'CANCELADA' | string;
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

export const ModalDetalleInfraccion: React.FC<ModalDetalleInfraccionProps> = ({
    isOpen,
    onClose,
    loading,
    detalle,
}) => {
    if (!isOpen) return null;

    // Formateador de moneda interno
    const formatCurrency = (val: string) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(parseFloat(val || '0'));
    };

    // Formateador de fecha
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col font-sans">

                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-10">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Boleta de Infracción</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${detalle?.estatus === 'PAGADA'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                }`}>
                                {loading ? 'Cargando...' : detalle?.estatus}
                            </span>
                        </div>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-1">
                            {loading ? 'Obteniendo datos...' : detalle?.folio}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Contenido principal */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-zinc-500 font-medium">Consultando base de datos...</p>
                    </div>
                ) : detalle ? (
                    <div className="p-6 space-y-8 overflow-y-auto">

                        {/* Grid Secciones Superiores */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Sección 1: Infractor */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Datos del Infractor</h3>
                                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl space-y-3 border border-zinc-100 dark:border-zinc-900/50">
                                    <DataRow label="Nombre Completo" value={`${detalle.nombre_infractor} ${detalle.apellido_paterno_infractor} ${detalle.apellido_materno_infractor}`} bold />
                                    <DataRow label="CURP" value={detalle.curp_infractor} monospace />
                                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                                        <StatusBadge label="Ciudadano" condition={detalle.ciudadano_presente} />
                                        <StatusBadge label="Es Titular" condition={detalle.es_titular} />
                                        <StatusBadge label="Presenta INE" condition={detalle.presenta_ine} />
                                    </div>
                                </div>
                            </div>

                            {/* Sección 2: Vehículo */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Identificación del Vehículo</h3>
                                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl space-y-3 border border-zinc-100 dark:border-zinc-900/50">
                                    <div className="grid grid-cols-2 gap-4">
                                        <DataRow label="Marca" value={detalle.marca} />
                                        <DataRow label="Modelo" value={detalle.modelo} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <DataRow label="Color" value={detalle.color} />
                                        <DataRow label="Placas" value={detalle.placa} monospace bold />
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Sección 3: Ubicación del Hecho */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Ubicación de la Infracción</h3>
                            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-900/50">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2 space-y-3">
                                        <DataRow label="Dirección" value={`${detalle.calle} #${detalle.numero}${detalle.colonia ? `, Col. ${detalle.colonia}` : ''}`} />
                                        <DataRow label="Municipio / Estado" value={`${detalle.municipio}, ${detalle.estado} — CP ${detalle.codigo_postal}`} />
                                    </div>
                                    <div className="space-y-2 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pt-3 md:pt-0 md:pl-4">
                                        <span className="text-[11px] font-medium text-zinc-400 block">Coordenadas Geográficas</span>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${detalle.latitud},${detalle.longitud}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1 font-mono"
                                        >
                                            {detalle.latitud}, {detalle.longitud}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sección 4: Fundamento Legal y Operación */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-4">
                                <h3 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Sustento Legal y Unidad</h3>
                                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl grid grid-cols-2 gap-4 border border-zinc-100 dark:border-zinc-900/50">
                                    <DataRow label="ID Artículo" value={detalle.articulo_id} monospace className="text-[11px]" />
                                    <DataRow label="ID Fracción" value={detalle.fraccion_id} monospace className="text-[11px]" />
                                    <DataRow label="Oficial a Cargo (ID)" value={detalle.oficial_id} monospace className="text-[11px]" />
                                    <DataRow label="Patrulla / Placa" value={detalle.patrulla_id ? `${detalle.patrulla_id} [${detalle.placa_patrulla}]` : 'N/A'} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Garantía Retenida</h3>
                                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl space-y-3 border border-zinc-100 dark:border-zinc-900/50 flex flex-col justify-between h-[calc(100%-2rem)]">
                                    <DataRow label="Tipo de Garantía" value={detalle.tipo_garantia === 'TRJ_CIRCULACION' ? 'Tarjeta de Circulación' : detalle.tipo_garantia || detalle.tipo_garantia} bold />
                                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900">
                                        <StatusBadge label="Garantía Entregada" condition={detalle.garantia_entregada} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sección 5: Desglose Financiero */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Desglose Financiero</h3>
                            <div className="bg-zinc-900 text-zinc-100 dark:bg-black p-5 rounded-xl border border-zinc-800">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div>
                                        <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">Monto Base</span>
                                        <span className="text-lg font-semibold font-mono text-zinc-200">{formatCurrency(detalle.monto_total)}</span>
                                    </div>

                                    <div>
                                        <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">Pago al Momento</span>
                                        <span className="text-sm font-medium mt-1 block">{detalle.pago_al_momento ? '✅ Sí' : '❌ No'}</span>
                                    </div>
                                    <div className="border-t pt-3 md:pt-0 md:border-t-0 md:border-l border-zinc-800 md:pl-6">
                                        <span className="text-[11px] font-medium text-violet-400 block uppercase tracking-wider">Monto Total Liquidado</span>
                                        <span className="text-2xl font-bold font-mono text-white">{formatCurrency(detalle.monto_final)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fechas de Registro */}
                        <div className="flex flex-wrap justify-between items-center text-[11px] text-zinc-400 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <span>Secuencia Valor: <strong className="font-mono text-zinc-600 dark:text-zinc-300">{detalle.seq_valor}</strong></span>
                            <div className="flex gap-4">
                                <span>Creado: <strong>{formatDate(detalle.created_at)}</strong></span>
                                {detalle.created_at !== detalle.updated_at && (
                                    <span>Actualizado: <strong>{formatDate(detalle.updated_at)}</strong></span>
                                )}
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="text-center py-12 text-zinc-500">No se pudo encontrar el detalle de esta infracción.</div>
                )}

                {/* Footer */}
                <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end bg-zinc-50 dark:bg-zinc-900/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        Cerrar Detalles
                    </button>
                </div>

            </div>
        </div>
    );
};

/* --- Componentes Helper Internos para modularidad y limpieza --- */

interface DataRowProps {
    label: string;
    value: string | number | null;
    bold?: boolean;
    monospace?: boolean;
    className?: string;
}

const DataRow: React.FC<DataRowProps> = ({ label, value, bold, monospace, className = "" }) => (
    <div className={`flex flex-col ${className}`}>
        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{label}</span>
        <span className={`text-sm mt-0.5 text-zinc-800 dark:text-zinc-200 break-words ${bold ? 'font-semibold' : ''} ${monospace ? 'font-mono tracking-tight text-xs bg-zinc-200/50 dark:bg-zinc-800/60 px-1.5 py-0.5 rounded w-max max-w-full' : ''}`}>
            {value ?? 'N/A'}
        </span>
    </div>
);

const StatusBadge: React.FC<{ label: string; condition: boolean }> = ({ label, condition }) => (
    <div className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center ${condition
        ? 'bg-zinc-100/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
        : 'bg-zinc-50 dark:bg-zinc-950 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400'
        }`}>
        <span className="text-[10px] font-medium block uppercase tracking-tight mb-1">{label}</span>
        <span className="text-xs">{condition ? '✅' : '❌'}</span>
    </div>
);