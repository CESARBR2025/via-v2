'use client';


import { Card } from '../ui/Card';
import { CardTitle } from '../ui/CardTitle';


import MapaSelector from '@/features/oficiales/components/MapaSelector';

import { useInfraccionStore } from '@/stores/useInfraccionStore';

interface Props {
    latInicial: number | null;
    lngInicial: number | null;
    setDireccion: (data: any) => void;
}

export default function PasoUbicacion({
    latInicial,
    lngInicial,
    setDireccion,
}: Props) {

    //========================
    // STORE
    //========================
    const datos =
        useInfraccionStore((s) => s.datos);

    const actualizarDatos =
        useInfraccionStore((s) => s.actualizarDatos);

    console.log(datos)
    return (
        <Card>

            <CardTitle>
                Ubicación del incidente
            </CardTitle>

            <div className="h-80 overflow-hidden rounded-xl border border-[#E2E8F0]">

                {latInicial !== null && lngInicial !== null ? (

                    <MapaSelector
                        initialLat={latInicial.toString()}
                        initialLng={lngInicial.toString()}
                        editable

                        //=====================================================
                        // DIRECCION
                        //=====================================================
                        onAddressChange={(addressData) => {

                            setDireccion(addressData);

                            actualizarDatos({

                                // Coordenadas
                                latitud:
                                    addressData.latitud ?? null,

                                longitud:
                                    addressData.longitud ?? null,

                                // Dirección
                                calle:
                                    addressData.calle ?? '',

                                numero:
                                    addressData.numero ?? '',

                                colonia:
                                    addressData.colonia ?? '',

                                codigoPostal:
                                    addressData.codigoPostal ?? '',

                                municipio:
                                    addressData.municipio ?? '',

                                estado:
                                    addressData.estado ?? '',
                            });
                        }}
                    />

                ) : (

                    <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] animate-pulse">

                        <svg
                            className="h-8 w-8 animate-bounce text-[#2563EB]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />

                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                            />
                        </svg>

                        <span className="text-sm font-medium text-[#2563EB]">
                            Obteniendo ubicación…
                        </span>

                        <span className="text-xs text-[#2563EB]/60">
                            Asegúrate de permitir el acceso a tu ubicación
                        </span>

                    </div>

                )}

            </div>

            {/* ===================================================== */}
            {/* UBICACIÓN DETECTADA */}
            {/* ===================================================== */}

            {(datos.calle ||
                datos.colonia ||
                datos.municipio) && (

                    <div className="mt-5 space-y-4">

                        {/* ===================================================== */}
                        {/* CARD DIRECCIÓN */}
                        {/* ===================================================== */}

                        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">

                            <div className="flex items-center justify-between border-b border-[#F1F5F9] bg-[#F8FAFC] px-4 py-3">

                                <div className="flex items-center gap-2">

                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10">

                                        <svg
                                            className="h-4 w-4 text-[#2563EB]"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                            />

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                            />
                                        </svg>

                                    </div>

                                    <div>

                                        <p className="text-sm font-semibold text-[#0F172A]">
                                            Ubicación detectada
                                        </p>

                                        <p className="text-[11px] text-[#64748B]">
                                            Dirección obtenida mediante geolocalización
                                        </p>

                                    </div>

                                </div>

                                <div className="rounded-full border border-[#22C55E]/30 bg-[#DCFCE7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#16A34A]">
                                    Activa
                                </div>

                            </div>

                            <div className="space-y-4 px-4 py-4">

                                <div>

                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                                        Dirección completa
                                    </p>

                                    <p className="text-sm leading-relaxed text-[#0F172A]">

                                        {[
                                            datos.calle,
                                            datos.numero,
                                            datos.colonia,
                                            datos.municipio,
                                            datos.estado,
                                            datos.codigoPostal,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}

                                    </p>

                                </div>

                                {/* CHIPS */}
                                <div className="flex flex-wrap gap-2">

                                    {datos.calle && (
                                        <span className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#0F172A]">
                                            Calle: {datos.calle}
                                        </span>
                                    )}

                                    {datos.numero && (
                                        <span className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#0F172A]">
                                            Núm: {datos.numero}
                                        </span>
                                    )}

                                    {datos.colonia && (
                                        <span className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#0F172A]">
                                            Colonia: {datos.colonia}
                                        </span>
                                    )}

                                    {datos.codigoPostal && (
                                        <span className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#0F172A]">
                                            CP: {datos.codigoPostal}
                                        </span>
                                    )}

                                    {datos.municipio && (
                                        <span className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#0F172A]">
                                            Municipio: {datos.municipio}
                                        </span>
                                    )}

                                    {datos.estado && (
                                        <span className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#0F172A]">
                                            Estado: {datos.estado}
                                        </span>
                                    )}

                                </div>

                                {/* ===================================================== */}
                                {/* COORDENADAS */}
                                {/* ===================================================== */}

                                {datos.latitud !== null &&
                                    datos.longitud !== null && (

                                        <div className="grid grid-cols-1 gap-3 pt-2 md:grid-cols-2">

                                            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">

                                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                                                    Latitud
                                                </p>

                                                <p className="font-mono text-sm font-semibold text-[#0F172A]">
                                                    {Number(datos.latitud).toFixed(6)}
                                                </p>

                                            </div>

                                            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">

                                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                                                    Longitud
                                                </p>

                                                <p className="font-mono text-sm font-semibold text-[#0F172A]">
                                                    {Number(datos.longitud).toFixed(6)}
                                                </p>

                                            </div>

                                        </div>

                                    )}

                            </div>

                        </div>

                    </div>

                )}

        </Card>
    );
}