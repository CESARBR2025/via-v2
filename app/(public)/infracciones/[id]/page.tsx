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


    //=============================================================================

    const baseUrl =
        process.env.NODE_ENV === 'production'
            ? 'https://via-v2.vercel.app'
            : 'http://localhost:3000';

    const res = await fetch(
        `${baseUrl}/api/infracciones/registradas/${id}`,
        { cache: 'no-store' }
    );

    const responseDataInfraccion = await res.json();

    const infraccion = responseDataInfraccion.data;
    console.log("Infracción obtenida en page.tsx:", infraccion);

    const nombreInfractor: string = [responseDataInfraccion.data.nombreInfractor,
    responseDataInfraccion.data.apellidoPaternoInfractor, responseDataInfraccion.data.apellidoMaternoInfractor]
        .filter(Boolean)
        .join(' ');

    console.log(nombreInfractor)

    //=============================================================================





    type EstatusPago = 'PENDIENTE' | 'PAGADO';

    const estatusPago: EstatusPago = 'PENDIENTE';
    // posteriormente:
    // const estatusPago = infraccion.estatus_pago;

    return (
        <main className="min-h-screen bg-slate-100">

            {/* HEADER */}
            <div className="bg-[#0b3b60] text-white border-b border-slate-800">
                <div className="max-w-5xl mx-auto px-4 py-8">

                    <div className="flex items-center gap-3">

                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur">
                            <FileText className="w-7 h-7" />
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-blue-200 font-bold">
                                Sistema Digital de Infracciones
                            </p>

                            <h1 className="text-2xl sm:text-3xl font-black">
                                Consulta Ciudadana
                            </h1>
                        </div>
                    </div>

                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

                {/* ESTATUS */}
                <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

                    <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                        <div className="space-y-2">

                            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                                Folio de infracción
                            </p>

                            <h2 className="text-2xl font-black text-slate-800 break-all">
                                {infraccion.folio}
                            </h2>

                        </div>

                        <div className="flex flex-wrap gap-3">


                            {infraccion.estatus === "P" ? (
                                <div className="
                                    inline-flex items-center gap-2
                                    px-4 py-2 rounded-2xl
                                    bg-emerald-500/10 text-emerald-700
                                    border border-emerald-500/20
                                    text-sm font-bold
                                ">
                                    <CheckCircle2 size={16} />
                                    Infracción pagada y liberada
                                </div>
                            ) : (
                                <div className="
                                    inline-flex items-center gap-2
                                    px-4 py-2 rounded-2xl
                                    bg-red-500/10 text-red-700
                                    border border-red-500/20
                                    text-sm font-bold
                                ">
                                    <AlertTriangle size={16} />
                                    Pago pendiente de infracción
                                </div>
                            )}

                        </div>

                    </div>

                </section>

                {/* GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* INFORMACIÓN */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* VEHICULO */}
                        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

                            <div className="flex items-center gap-3 mb-5">

                                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0076aa] flex items-center justify-center">
                                    <Car size={20} />
                                </div>

                                <div>
                                    <h3 className="font-black text-slate-800">
                                        Vehículo
                                    </h3>

                                    <p className="text-xs text-slate-500">
                                        Información registrada
                                    </p>
                                </div>

                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

                                <InfoItem
                                    label="Placa"
                                    value={infraccion.placa}
                                />

                                <InfoItem
                                    label="Marca"
                                    value={infraccion.marca}
                                />

                                <InfoItem
                                    label="Modelo"
                                    value={infraccion.modelo}
                                />

                                <InfoItem
                                    label="Color"
                                    value={infraccion.color}
                                />

                            </div>

                        </section>

                        {/* UBICACION */}
                        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

                            <div className="flex items-center gap-3 mb-5">

                                <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                                    <MapPin size={20} />
                                </div>

                                <div>
                                    <h3 className="font-black text-slate-800">
                                        Ubicación
                                    </h3>

                                    <p className="text-xs text-slate-500">
                                        Lugar de la infracción
                                    </p>
                                </div>

                            </div>

                            <div className="space-y-4 text-sm">

                                <InfoItem
                                    label="Dirección"
                                    value={`${infraccion.calle || '-'} ${infraccion.numero || ''}`}
                                />

                                <InfoItem
                                    label="Municipio"
                                    value={infraccion.municipio}
                                />

                                <InfoItem
                                    label="Estado"
                                    value={infraccion.estado}
                                />

                            </div>

                        </section>


                        {/* MONTO */}
                        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

                            <div className="bg-[#0b3b60] text-white p-5">

                                <p className="text-xs uppercase tracking-widest text-blue-200 font-bold">
                                    Monto a pagar
                                </p>

                                <h2 className="text-4xl font-black mt-2">
                                    ${infraccion.total_pesos}
                                </h2>
                                <p className="text-sm text-blue-100 mt-1">
                                    MXN
                                </p>

                                <h2 className="text-4xl font-black mt-2">
                                    {infraccion.total_umas} UMAs
                                </h2>



                            </div>

                            <div className="p-5 text-sm space-y-3">

                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Total Umas
                                    </span>

                                    <span className="font-bold text-slate-700">
                                        ${infraccion.total_umas}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Monto total a pagar
                                    </span>

                                    <span className="font-bold text-slate-700">
                                        ${infraccion.total_pesos}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Estatus Infracción
                                    </span>

                                    <span className="font-bold text-slate-700">
                                        {infraccion.estatus === 'I' ? 'Por pagar' : 'Pagada'}
                                    </span>
                                </div>

                            </div>

                        </section>


                        {/* SECCIÓN PAGO */}
                        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

                            <div className="p-5 border-b border-slate-100 flex items-center gap-3">

                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <CreditCard size={18} />
                                </div>

                                <div>
                                    <h3 className="font-black text-slate-800">
                                        Pago Digital
                                    </h3>

                                    <p className="text-xs text-slate-500">
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
                    <div className="space-y-6">


                        {/* GARANTIA */}
                        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

                            <div className="flex items-center gap-3 mb-5">

                                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Shield size={20} />
                                </div>

                                <div>
                                    <h3 className="font-black text-slate-800">
                                        Garantía
                                    </h3>

                                    <p className="text-xs text-slate-500">
                                        Documento retenido
                                    </p>
                                </div>

                            </div>

                            <div className="space-y-4 text-sm">

                                <InfoItem
                                    label="Tipo"
                                    value={infraccion.tipoGarantia}
                                />

                                <InfoItem
                                    label="Entregada"
                                    value={
                                        infraccion.garantiaEntregada
                                            ? 'Sí'
                                            : 'No'
                                    }
                                />

                            </div>

                        </section>





                    </div>

                </div>

            </div>

        </main>
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
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                {label}
            </p>

            <p className="font-bold text-slate-700 break-words">
                {value || 'No disponible'}
            </p>
        </div>
    );
}