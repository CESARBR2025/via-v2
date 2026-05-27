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

            <div className="h-80 overflow-hidden rounded-xl border border-slate-200">

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

                    <div className="flex h-full flex-col items-center justify-center gap-2 bg-linear-to-br from-[#dce9f5] to-[#c8ddf0] animate-pulse">

                        <svg
                            className="h-8 w-8 animate-bounce text-[#0076aa]"
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

                        <span className="text-sm font-medium text-[#0076aa]">
                            Obteniendo ubicación…
                        </span>

                        <span className="text-xs text-[#0076aa]/60">
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

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">

                            {/* HEADER */}
                            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">

                                <div className="flex items-center gap-2">

                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0076aa]/10">

                                        <svg
                                            className="h-4 w-4 text-[#0076aa]"
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

                                        <p className="text-sm font-semibold text-slate-800">
                                            Ubicación detectada
                                        </p>

                                        <p className="text-[11px] text-slate-500">
                                            Dirección obtenida mediante geolocalización
                                        </p>

                                    </div>

                                </div>

                                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                    Activa
                                </div>

                            </div>

                            {/* BODY */}
                            <div className="space-y-4 px-4 py-4">

                                {/* DIRECCIÓN COMPLETA */}
                                <div>

                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        Dirección completa
                                    </p>

                                    <p className="text-sm leading-relaxed text-slate-700">

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
                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                                            Calle: {datos.calle}
                                        </span>
                                    )}

                                    {datos.numero && (
                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                                            Núm: {datos.numero}
                                        </span>
                                    )}

                                    {datos.colonia && (
                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                                            Colonia: {datos.colonia}
                                        </span>
                                    )}

                                    {datos.codigoPostal && (
                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                                            CP: {datos.codigoPostal}
                                        </span>
                                    )}

                                    {datos.municipio && (
                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                                            Municipio: {datos.municipio}
                                        </span>
                                    )}

                                    {datos.estado && (
                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
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

                                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Latitud
                                                </p>

                                                <p className="font-mono text-sm font-semibold text-slate-700">
                                                    {Number(datos.latitud).toFixed(6)}
                                                </p>

                                            </div>

                                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Longitud
                                                </p>

                                                <p className="font-mono text-sm font-semibold text-slate-700">
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