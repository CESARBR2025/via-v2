import PagoInfraccion from '@/features/infracciones/components/PagoInfraccion';
import {
    CheckCircle2,
    CreditCard,
    MapPin,
    Shield,
    Car,
    FileText,
    AlertTriangle,
} from 'lucide-react';

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    console.log(id)

    const baseUrl =
        process.env.NODE_ENV === 'production'
            ? 'https://via-v2.vercel.app'
            : 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/infracciones/registradas/${id}`);
    const responseDataInfraccion = await res.json();
    const infraccion = responseDataInfraccion.data;

    const nombreInfractor: string = [
        responseDataInfraccion.data.nombreInfractor,
        responseDataInfraccion.data.apellidoPaternoInfractor,
        responseDataInfraccion.data.apellidoMaternoInfractor,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <main
            className="min-h-screen"
            style={{ background: '#FAFBFF', fontFamily: "'Inter', sans-serif" }}
        >
            {/* HEADER */}
            <div style={{ background: '#1A2340', borderBottom: '1px solid #111827' }}>
                <div className="max-w-5xl mx-auto px-6 py-7">
                    <div className="flex items-center gap-4">
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 14,
                                background: 'rgba(31,105,231,0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <FileText size={22} color="#93C5FD" />
                        </div>
                        <div>
                            <p
                                style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    color: '#93C5FD',
                                    margin: 0,
                                }}
                            >
                                Sistema Digital de Infracciones
                            </p>
                            <h1
                                style={{
                                    fontSize: 24,
                                    fontWeight: 700,
                                    color: '#FFFFFF',
                                    margin: 0,
                                    lineHeight: 1.3,
                                }}
                            >
                                Consulta Ciudadana
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-7 space-y-5">

                {/* ESTATUS */}
                <section
                    style={{
                        background: '#FFFFFF',
                        border: '1px solid #EAF1FC',
                        borderRadius: 20,
                        boxShadow: '0px 4px 18px rgba(31,105,231,0.05)',
                        padding: '24px',
                    }}
                >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <p
                                style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    color: '#B0BBCC',
                                    margin: '0 0 6px',
                                }}
                            >
                                Folio de infracción
                            </p>
                            <h2
                                style={{
                                    fontSize: 26,
                                    fontWeight: 700,
                                    color: '#1A2340',
                                    margin: 0,
                                    wordBreak: 'break-all',
                                }}
                            >
                                {infraccion.folio}
                            </h2>
                        </div>

                        {infraccion.estatus === 'P' ? (
                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 16px',
                                    borderRadius: 10,
                                    background: '#EAF8F1',
                                    border: '1px solid #BFE8D1',
                                    color: '#1F7A4D',
                                    fontSize: 13,
                                    fontWeight: 600,
                                }}
                            >
                                <CheckCircle2 size={15} />
                                Infracción pagada y liberada
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 16px',
                                    borderRadius: 10,
                                    background: '#FFF0F0',
                                    border: '1px solid #FFC2C2',
                                    color: '#B54747',
                                    fontSize: 13,
                                    fontWeight: 600,
                                }}
                            >
                                <AlertTriangle size={15} />
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
                        <section style={cardStyle}>
                            <SectionHeader
                                icon={<Car size={18} color="#1F69E7" />}
                                iconBg="#EFF4FE"
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
                        <section style={cardStyle}>
                            <SectionHeader
                                icon={<MapPin size={18} color="#B54747" />}
                                iconBg="#FFF0F0"
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

                        {/* MONTO */}
                        <section
                            style={{
                                background: '#FFFFFF',
                                border: '1px solid #EAF1FC',
                                borderRadius: 20,
                                boxShadow: '0px 4px 18px rgba(31,105,231,0.05)',
                                overflow: 'hidden',
                            }}
                        >
                            <div style={{ background: '#1A2340', padding: '24px 24px 20px' }}>
                                <p
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        letterSpacing: '0.18em',
                                        textTransform: 'uppercase',
                                        color: '#93C5FD',
                                        margin: '0 0 10px',
                                    }}
                                >
                                    Monto a pagar
                                </p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                    <span style={{ fontSize: 38, fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>
                                        ${infraccion.total_pesos}
                                    </span>
                                    <span style={{ fontSize: 13, color: '#93C5FD', fontWeight: 500 }}>MXN</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                                    <span style={{ fontSize: 26, fontWeight: 600, color: '#DBEAFE', lineHeight: 1 }}>
                                        {infraccion.total_umas}
                                    </span>
                                    <span style={{ fontSize: 13, color: '#93C5FD', fontWeight: 500 }}>UMAs</span>
                                </div>
                            </div>

                            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <MontoRow label="Total UMAs" value={`${infraccion.total_umas}`} />
                                <div style={{ height: '0.5px', background: '#EAF1FC' }} />
                                <MontoRow label="Monto total a pagar" value={`$${infraccion.total_pesos}`} />
                                <div style={{ height: '0.5px', background: '#EAF1FC' }} />
                                <MontoRow
                                    label="Estatus infracción"
                                    value={infraccion.estatus === 'I' ? 'Por pagar' : 'Pagada'}
                                    valueColor={infraccion.estatus === 'I' ? '#B54747' : '#1F7A4D'}
                                />
                            </div>
                        </section>

                        {/* PAGO */}
                        <section style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                            <div
                                style={{
                                    padding: '18px 24px',
                                    borderBottom: '1px solid #EAF1FC',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                }}
                            >
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        background: '#EAF8F1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <CreditCard size={18} color="#22A06B" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1A2340', margin: 0 }}>
                                        Pago Digital
                                    </h3>
                                    <p style={{ fontSize: 12, color: '#8A96B0', margin: 0 }}>
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
                        <section style={cardStyle}>
                            <SectionHeader
                                icon={<Shield size={18} color="#22A06B" />}
                                iconBg="#EAF8F1"
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

const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid #EAF1FC',
    borderRadius: 20,
    boxShadow: '0px 4px 18px rgba(31,105,231,0.05)',
    padding: '24px',
};

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                {icon}
            </div>
            <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1A2340', margin: 0 }}>
                    {title}
                </h3>
                <p style={{ fontSize: 12, color: '#8A96B0', margin: 0 }}>
                    {subtitle}
                </p>
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
        <div
            style={{
                borderRadius: 10,
                border: '1px solid #EAF1FC',
                background: '#FAFBFF',
                padding: '10px 14px',
            }}
        >
            <p
                style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#B0BBCC',
                    margin: '0 0 4px',
                }}
            >
                {label}
            </p>
            <p
                style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1A2340',
                    margin: 0,
                    wordBreak: 'break-all',
                }}
            >
                {value || 'No disponible'}
            </p>
        </div>
    );
}

function MontoRow({
    label,
    value,
    valueColor = '#1A2340',
}: {
    label: string;
    value: string;
    valueColor?: string;
}) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#6B778C' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: valueColor }}>{value}</span>
        </div>
    );
}