import PagoInfraccion from '@/features/infracciones/components/PagoInfraccion';
import {
    CheckCircle2,
    CreditCard,
    MapPin,
    Shield,
    Car,
    FileText,
    AlertTriangle,
    BanknoteArrowDown,
} from 'lucide-react';

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
    console.log(infraccion)

    return (
        <main className="min-h-screen bg-[#F1F5F9]">
            {/* HEADER */}
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] border-b border-[#1E40AF]">
                <div className="max-w-5xl mx-auto px-6 py-7">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#2563EB]/30 flex items-center justify-center">
                            <FileText size={22} className="text-[#93C5FD]" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#93C5FD]">
                                Sistema Digital de Infracciones
                            </p>
                            <h1 className="text-2xl font-bold text-[#FFFFFF] leading-tight">
                                Consulta Ciudadana
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-7 space-y-5">

                {/* FOLIO + STATUS */}
                <section className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#94A3B8] mb-1">
                                Folio de infracción
                            </p>
                            <h2 className="text-[26px] font-bold text-[#0F172A] break-all">
                                {infraccion.folio}
                            </h2>
                        </div>

                        {infraccion.estatus === 'P' ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#DCFCE7] border border-[#22C55E]/30 text-[#16A34A] text-sm font-semibold shrink-0">
                                <CheckCircle2 size={16} />
                                Infracción pagada y liberada
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-sm font-semibold shrink-0">
                                <AlertTriangle size={16} />
                                Pago pendiente de infracción
                            </div>
                        )}
                    </div>
                </section>

                {/* GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* COLUMNA IZQUIERDA */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* VEHÍCULO */}
                        <section className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                            <SectionHeader
                                icon={<Car size={18} className="text-[#2563EB]" />}
                                iconBg="#EFF6FF"
                                title="Vehículo"
                                subtitle="Información registrada"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <InfoItem label="Placa" value={infraccion.placa} />
                                <InfoItem label="Marca" value={infraccion.marca} />
                                <InfoItem label="Modelo" value={infraccion.modelo} />
                                <InfoItem label="Color" value={infraccion.color} />
                            </div>
                        </section>

                        {/* UBICACIÓN */}
                        <section className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                            <SectionHeader
                                icon={<MapPin size={18} className="text-[#EF4444]" />}
                                iconBg="#FEE2E2"
                                title="Ubicación"
                                subtitle="Lugar de la infracción"
                            />
                            <div className="space-y-3">
                                <InfoItem
                                    label="Dirección"
                                    value={`${infraccion.calle || '-'} ${infraccion.numero || ''}`}
                                />
                                <InfoItem label="Municipio" value={infraccion.municipio} />
                                <InfoItem label="Estado" value={infraccion.estado} />
                            </div>
                        </section>

                        {/* DESCUENTOS */}
                        <section className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                            <SectionHeader
                                icon={<BanknoteArrowDown size={18} className="text-[#F59E0B]" />}
                                iconBg="#FEF3C7"
                                title="Descuentos"
                                subtitle="Descuentos en infracción"
                            />
                            <div className="space-y-3">
                                <InfoItem
                                    label="Fecha limite de descuento"
                                    value={infraccion.fecha_limite_descuento}
                                />
                                <InfoItem label="Porcentaje" value={`${Number(infraccion.descuento_aplicado)}%`} />
                            </div>
                        </section>

                        {/* MONTO */}
                        <section className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-6 pt-6 pb-5">
                                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#93C5FD] mb-2">
                                    Monto a pagar
                                </p>

                                <div className="flex items-baseline gap-2">
                                    <span className="text-[38px] font-bold text-[#FFFFFF] leading-none">
                                        ${infraccion.total_pesos}
                                    </span>
                                    <span className="text-sm text-[#93C5FD] font-medium">MXN</span>
                                </div>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <span className="text-[26px] font-semibold text-[#DBEAFE] leading-none">
                                        {infraccion.total_umas}
                                    </span>
                                    <span className="text-sm text-[#93C5FD] font-medium">UMAs</span>
                                </div>
                            </div>

                            <div className="px-6 py-4 flex flex-col gap-2.5">
                                <MontoRow label="Monto total de UMAs" value={`${infraccion.montoTotal} UMAs`} />
                                <MontoRow label="Descuento aplicado" value={`${Number(infraccion.descuento_aplicado)}%`} />
                                <MontoRow label="Total UMAs a pagar" value={`${infraccion.total_umas} UMAs`} />

                                <div className="h-px bg-[#E2E8F0]" />
                                <MontoRow
                                    label="Estatus infracción"
                                    value={infraccion.estatus === 'I' ? 'Por pagar' : 'Pagada'}
                                    valueColor={infraccion.estatus === 'I' ? '#EF4444' : '#22C55E'}
                                />
                            </div>
                        </section>

                        {/* PAGO */}
                        <section className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                            <div className="px-6 py-[18px] border-b border-[#E2E8F0] flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#DCFCE7] flex items-center justify-center">
                                    <CreditCard size={18} className="text-[#22C55E]" />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-semibold text-[#0F172A]">
                                        Pago Digital
                                    </h3>
                                    <p className="text-xs text-[#64748B]">
                                        Plataforma segura
                                    </p>
                                </div>
                            </div>
                            <PagoInfraccion
                                infraccionId={infraccion.id}
                                ordenPagoId={infraccion.orden_pago_id}
                                urlPago={infraccion.url_pago}
                                estatus={infraccion.estatus}
                            />
                        </section>
                    </div>

                    {/* SIDEBAR */}
                    <div className="space-y-5">
                        <section className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                            <SectionHeader
                                icon={<Shield size={18} className="text-[#22C55E]" />}
                                iconBg="#DCFCE7"
                                title="Garantía"
                                subtitle="Documento retenido"
                            />
                            <div className="space-y-3">
                                <InfoItem label="Tipo" value={infraccion.tipoGarantia} />
                                <InfoItem
                                    label="Entregada"
                                    value={infraccion.garantiaEntregada ? 'Sí' : 'No'}
                                />
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}

function SectionHeader({
    icon,
    iconBg,
    title,
    subtitle,
}: {
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex items-center gap-3 mb-[18px]">
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: iconBg }}
            >
                {icon}
            </div>
            <div>
                <h3 className="text-[15px] font-semibold text-[#0F172A]">{title}</h3>
                <p className="text-xs text-[#64748B]">{subtitle}</p>
            </div>
        </div>
    );
}

function InfoItem({
    label,
    value,
}: {
    label: string;
    value: string | number | null;
}) {
    return (
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#94A3B8] mb-1">
                {label}
            </p>
            <p className="text-sm font-semibold text-[#0F172A] break-all">
                {value || 'No disponible'}
            </p>
        </div>
    );
}

function MontoRow({
    label,
    value,
    valueColor = '#0F172A',
}: {
    label: string;
    value: string;
    valueColor?: string;
}) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-[#64748B]">{label}</span>
            <span className="text-sm font-semibold" style={{ color: valueColor }}>{value}</span>
        </div>
    );
}
