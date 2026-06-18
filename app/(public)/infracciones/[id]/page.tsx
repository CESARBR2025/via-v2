import PagoInfraccion from '@/features/infracciones/components/PagoInfraccion';
import SeccionLiberacion from '@/features/infracciones/components/SeccionLiberacion';
import { Card } from '@/features/infracciones/components/ui/Card';
import MapSectionCiudadano from '@/features/infracciones/components/MapSectionCiudadano';
import {
    CheckCircle2,
    AlertTriangle,
    FileText,
    Clock,
    User,
    IdCard,
    Car,
    Tag,
    Layers,
    Palette,
    Barcode,
    MapPin,
    BanknoteArrowDown,
    ShieldCheck,
    CreditCard,
    Gavel,
} from 'lucide-react';

// ─── UTILS ───

function formatDate(d: string | null): string {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function timeAgo(d: string | null): string {
    if (!d) return '';
    const now = new Date();
    const date = new Date(d);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 1) return 'recién registrada';
    if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays < 30) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    return formatDate(d);
}

function sanitize(value: string | number | null | undefined, fallback = '—'): string {
    if (value === null || value === undefined || value === '' || value === 'NO_DATA') return fallback;
    return String(value);
}

// ─── STATUS CONFIG ───

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string; icon: typeof CheckCircle2 }> = {
    PAGADA: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Pagada y liberada', icon: CheckCircle2 },
    PENDIENTE_PAGO: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Pago pendiente', icon: AlertTriangle },
    REGISTRADA: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Registrada', icon: FileText },
    CANCELADA: { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400', label: 'Cancelada', icon: AlertTriangle },
};

function getStatusStyle(status?: string) {
    return STATUS_STYLES[status ?? ''] ?? { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400', label: status ?? 'Desconocido', icon: AlertTriangle };
}

// ─── MAIN ───

export default async function InfraccionCiudadanoPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {

    const { id } = await params;

    const baseUrl =
        process.env.NODE_ENV === 'production'
            ? 'https://via-v2.vercel.app'
            : 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/infracciones/registradas/${id}`);
    const responseDataInfraccion = await res.json();
    const infraccion = responseDataInfraccion.data;

    const status = getStatusStyle(infraccion.estatusInfraccion);
    const StatusIcon = status.icon;

    const hasCoords =
        infraccion.latitud && infraccion.longitud &&
        !isNaN(Number(infraccion.latitud)) && !isNaN(Number(infraccion.longitud)) &&
        Number(infraccion.latitud) !== 0 && Number(infraccion.longitud) !== 0;

    const infractorNombre = [
        infraccion.nombreInfractor,
        infraccion.apellidoPaternoInfractor,
        infraccion.apellidoMaternoInfractor,
    ].filter(Boolean).join(' ');

    return (
        <main className="min-h-screen bg-slate-100">

            {/* ══ HERO HEADER ══ */}
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
                <div className="absolute top-20 -right-5 w-24 h-24 rounded-full bg-white/5" />
                <div className="absolute -bottom-8 left-1/3 w-32 h-32 rounded-full bg-white/5" />

                <div className="max-w-4xl mx-auto px-6 py-8 relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <FileText size={20} className="text-blue-200" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-blue-300/80">
                                    SSPM · San Juan del Río
                                </p>
                                <p className="text-xs text-blue-300/60 -mt-0.5">
                                    Sistema Digital de Infracciones
                                </p>
                            </div>
                        </div>

                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                        </div>
                    </div>

                    <div className="mt-5">
                        <h1 className="text-[28px] font-medium text-white tracking-tight">
                            Folio #{infraccion.folio}
                        </h1>
                        <p className="text-sm text-blue-200/70 mt-1.5 flex items-center gap-2">
                            <Clock size={13} strokeWidth={1.5} />
                            {formatDate(infraccion.created_at || infraccion.fechaInfraccion)}
                            <span className="text-blue-300/40">&middot;</span>
                            <span>{timeAgo(infraccion.created_at || infraccion.fechaInfraccion)}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* ══ CONTENT ══ */}
            <div className="max-w-4xl mx-auto px-6 -mt-5 relative z-10 pb-10 space-y-5">

                {/* ▸ MONTO A PAGAR */}
                <Card className="overflow-hidden p-0 shadow-[0_4px_12px_rgba(29,78,216,0.2)]">
                    <div className="bg-gradient-to-br from-blue-700 to-blue-900 px-6 pt-6 pb-5 relative overflow-hidden">
                        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
                        <div className="absolute top-12 -right-3 w-16 h-16 rounded-full bg-white/5" />

                        <div className="relative">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/15 text-white text-[10px] font-medium tracking-wider uppercase">
                                    Monto a pagar
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-[36px] font-medium text-white leading-none tracking-tight">
                                    ${infraccion.total_pesos}
                                </span>
                                <span className="text-sm text-blue-300/80 font-medium">MXN</span>
                            </div>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-xl font-medium text-blue-200/90 leading-none">
                                    {infraccion.total_umas}
                                </span>
                                <span className="text-xs text-blue-300/70 font-medium">UMAs equivalentes</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 flex flex-col gap-2.5">
                        <MontoRow label="Monto total de UMAs" value={`${infraccion.montoTotal} UMAs`} />
                        <MontoRow label="Descuento aplicado" value={`${Number(infraccion.descuento_aplicado)}%`} />
                        <MontoRow label="Total UMAs a pagar" value={`${infraccion.total_umas} UMAs`} />
                        <div className="h-px bg-slate-200" />
                        <MontoRow
                            label="Estatus"
                            value={infraccion.estatus === 'I' ? 'Por pagar' : 'Pagada'}
                            valueClass={infraccion.estatus === 'I' ? 'text-red-500' : 'text-green-600'}
                        />
                    </div>
                </Card>

                {/* ▸ PAGO DIGITAL */}
                {infraccion.estatusInfraccion === 'PENDIENTE_PAGO' && (
                    <section className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
                        <div className="px-6 py-[18px] border-b border-slate-200 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                <CreditCard size={18} className="text-green-500" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-medium text-slate-900">Pago Digital</h3>
                                <p className="text-xs text-slate-500">Plataforma segura</p>
                            </div>
                        </div>
                        <PagoInfraccion
                            infraccionId={infraccion.id}
                            ordenPagoId={infraccion.orden_pago_id}
                            urlPago={infraccion.url_pago}
                            estatus={infraccion.estatus}
                            estatusDependencia={infraccion.estatusDependencia}
                            estatusInfraccion={infraccion.estatusInfraccion}
                        />
                    </section>
                )}

                {/* ▸ FUNDAMENTO LEGAL */}
                {(infraccion.articulo_numero || infraccion.fraccion_numero) && (
                    <Card>
                        <Section icon={Gavel} iconBg="bg-slate-50" iconColor="text-slate-700" title="Fundamento Legal">
                            <div className="space-y-3">
                                {infraccion.articulo_numero && (
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                                        <span className="shrink-0 px-2 py-1 rounded-md bg-blue-700 text-white text-[11px] font-medium font-mono leading-none">
                                            Art. {infraccion.articulo_numero}
                                        </span>
                                        {infraccion.articulo_descripcion && (
                                            <p className="text-sm text-slate-700 leading-snug pt-0.5">
                                                {infraccion.articulo_descripcion}
                                            </p>
                                        )}
                                    </div>
                                )}
                                {infraccion.fraccion_numero && (
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                                        <span className="shrink-0 px-2 py-1 rounded-md bg-slate-600 text-white text-[11px] font-medium font-mono leading-none">
                                            Frac. {infraccion.fraccion_numero}
                                        </span>
                                        {infraccion.fraccion_descripcion && (
                                            <p className="text-sm text-slate-700 leading-snug pt-0.5">
                                                {infraccion.fraccion_descripcion}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Section>
                    </Card>
                )}

                {/* ▸ LIBERACIÓN (solo si la garantía retenida es el vehículo) */}
                {infraccion.tipoGarantia === 'VEHICULO' && (
                <SeccionLiberacion
                    dependenciaReceptora={infraccion.dependenciaReceptora}
                    noOficio={infraccion.noOficio}
                    urlOficio={infraccion.urlOficio}
                    estatusDependencia={infraccion.estatusDependencia}
                    estatusInfraccion={infraccion.estatusInfraccion}
                    nombreTitular={infraccion.nombreTitular}
                    correoTitular={infraccion.correoTitular}
                    curpTitular={infraccion.curpTitular}
                    noCarpetaInvestigacion={infraccion.noCarpetaInvestigacion}
                    motivoRetencion={infraccion.motivoRetencion}
                    infraccionId={infraccion.id}
                    documentosLiberacion={infraccion.documentosLiberacion || {}}
                    esTitular={infraccion.esTitular}
                />
                )}

                {/* ▸ INFRACTOR (solo datos capturados) */}
                {(infractorNombre || (infraccion.curpInfractor && String(infraccion.curpInfractor) !== 'NO_DATA')) && (
                    <Card>
                        <Section icon={User} iconBg="bg-blue-50" iconColor="text-blue-700" title="Infractor">
                            <div className="space-y-3">
                                {infractorNombre && (
                                    <FieldWithIcon icon={User} label="Nombre completo" value={infractorNombre} />
                                )}
                                {infraccion.curpInfractor && String(infraccion.curpInfractor) !== 'NO_DATA' && (
                                    <div>
                                        <p className="text-xs font-medium text-slate-500">CURP</p>
                                        <p className="text-sm text-slate-900 mt-0.5 leading-snug flex items-center gap-1.5 font-mono tracking-wide">
                                            <IdCard size={13} className="text-slate-400 shrink-0" strokeWidth={1.5} />
                                            {infraccion.curpInfractor}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Section>
                    </Card>
                )}

                {/* ▸ VEHÍCULO */}
                <Card>
                    <Section icon={Car} iconBg="bg-indigo-50" iconColor="text-indigo-700" title="Vehículo">
                        {infraccion.placa && (
                            <div className="px-4 py-2.5 rounded-lg bg-indigo-50 border border-indigo-200 mb-4 inline-block">
                                <p className="text-[10px] font-medium tracking-widest text-indigo-600 uppercase mb-0.5">Placa</p>
                                <p className="text-lg font-medium text-indigo-900 tracking-[0.2em] font-mono">
                                    {infraccion.placa}
                                </p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                            <FieldWithIcon icon={Tag} label="Marca" value={sanitize(infraccion.marca)} />
                            <FieldWithIcon icon={Layers} label="Modelo" value={sanitize(infraccion.modelo)} />
                            <FieldWithIcon icon={Palette} label="Color" value={sanitize(infraccion.color)} />
                            <FieldWithIcon icon={Car} label="Tipo" value={sanitize(infraccion.tipoVehiculo)} />
                            <FieldWithIcon icon={Barcode} label="VIN (Número de serie)" value={sanitize(infraccion.noSerieVehiculo)} />
                        </div>
                    </Section>
                </Card>

                {/* ▸ UBICACIÓN */}
                <Card>
                    <Section icon={MapPin} iconBg="bg-emerald-50" iconColor="text-emerald-700" title="Ubicación">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                            <FieldWithIcon icon={MapPin} label="Calle" value={sanitize(infraccion.calle)} />
                            <FieldWithIcon icon={MapPin} label="Número" value={sanitize(infraccion.numero, 's/n')} />
                            <FieldWithIcon icon={MapPin} label="Colonia" value={sanitize(infraccion.colonia)} />
                            <FieldWithIcon icon={MapPin} label="Municipio" value={sanitize(infraccion.municipio)} />
                            <FieldWithIcon icon={MapPin} label="Estado" value={sanitize(infraccion.estado)} />
                        </div>
                    </Section>

                    {hasCoords && (
                        <div className="mt-5">
                            <MapSectionCiudadano
                                lat={Number(infraccion.latitud)}
                                lng={Number(infraccion.longitud)}
                            />
                        </div>
                    )}
                </Card>

                {/* ▸ DESCUENTOS */}
                {infraccion.descuento_aplicado && Number(infraccion.descuento_aplicado) > 0 && (
                    <Card>
                        <Section icon={BanknoteArrowDown} iconBg="bg-amber-50" iconColor="text-amber-600" title="Descuento">
                            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-amber-50 border border-amber-200">
                                <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                                    <BanknoteArrowDown size={16} className="text-white" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-amber-900">
                                        {Number(infraccion.descuento_aplicado)}% de descuento aplicado
                                    </p>
                                    <p className="text-xs text-amber-700/70 mt-0.5">
                                        Válido hasta {formatDate(infraccion.fecha_limite_descuento)}
                                    </p>
                                </div>
                            </div>
                        </Section>
                    </Card>
                )}

                {/* ▸ GARANTÍA */}
                {infraccion.tipoGarantia && (
                    <Card>
                        <Section icon={ShieldCheck} iconBg="bg-amber-50" iconColor="text-amber-700" title="Garantía">
                            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-amber-50 border border-amber-200">
                                <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                                    <ShieldCheck size={16} className="text-white" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-amber-900">
                                        {infraccion.garantiaEntregada ? 'Entregada' : 'No entregada'} — {infraccion.tipoGarantia}
                                    </p>
                                    <p className="text-xs text-amber-700/70 mt-0.5">
                                        {infraccion.garantiaEntregada ? 'Documento resguardado en delegación' : 'No se retuvo garantía'}
                                    </p>
                                </div>
                            </div>
                        </Section>
                    </Card>
                )}

            </div>
        </main>
    );
}

// ─── SUB-COMPONENTS ───

function Section({
    icon: Icon,
    title,
    iconBg,
    iconColor,
    children,
}: {
    icon: React.ElementType;
    title: string;
    iconBg: string;
    iconColor: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <h3 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                <span className={`w-6 h-6 rounded-md ${iconBg} flex items-center justify-center`}>
                    <Icon size={13} className={iconColor} strokeWidth={1.5} />
                </span>
                {title}
            </h3>
            <div>
                {children}
            </div>
        </div>
    );
}

function FieldWithIcon({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="text-sm text-slate-900 mt-0.5 leading-snug flex items-center gap-1.5">
                <Icon size={13} className="text-slate-400 shrink-0" strokeWidth={1.5} />
                {value}
            </p>
        </div>
    );
}

function MontoRow({
    label,
    value,
    valueClass = 'text-slate-900',
}: {
    label: string;
    value: string;
    valueClass?: string;
}) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">{label}</span>
            <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
        </div>
    );
}


