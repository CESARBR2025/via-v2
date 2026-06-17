'use client';

import { useState } from 'react';
import { Card } from '../ui/Card';
import { CardTitle } from '../ui/CardTitle';

import { MapaDireccionRegistro } from '@/features/oficiales/components/MapaDireccionRegistro';
import { useInfraccionStore } from '@/stores/useInfraccionStore';
import { MapPin, Home, Building2, Mail, MapPinned } from 'lucide-react';

interface Props {
    setDireccion: (data: any) => void;
}

export default function PasoUbicacion({
    setDireccion,
}: Props) {

    const actualizarDatos =
        useInfraccionStore((s) => s.actualizarDatos);

    const [ultimaDir, setUltimaDir] = useState<{
        latitud?: number;
        longitud?: number;
        calle?: string;
        numero?: string;
        colonia?: string;
        codigoPostal?: string;
        municipio?: string;
        estado?: string;
    } | null>(null);

    return (
        <Card>
            <CardTitle>
                Ubicación del incidente
            </CardTitle>

            <div className="grid grid-cols-[1fr_1fr] gap-4">
                {/* ─── IZQUIERDA: Info card ─── */}
                <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                    {ultimaDir ? (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                                    <MapPin size={14} className="text-[#2563EB]" />
                                </div>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                    Ubicación detectada
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
                                <div className="flex items-center gap-2.5 col-span-2">
                                    <Home size={15} className="text-[#94A3B8] shrink-0" />
                                    <span className="text-[#0F172A] font-medium">
                                        {ultimaDir.calle || '—'}{ultimaDir.numero ? <span className="text-[#64748B] font-normal"> #{ultimaDir.numero}</span> : ''}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5 col-span-2">
                                    <Building2 size={15} className="text-[#94A3B8] shrink-0" />
                                    {ultimaDir.colonia ? (
                                        <span className="inline-flex items-center gap-1 bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-md text-[12px] font-medium">
                                            {ultimaDir.colonia}
                                        </span>
                                    ) : <span className="text-[#94A3B8]">—</span>}
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Mail size={15} className="text-[#94A3B8] shrink-0" />
                                    <span className="text-[#64748B]">{ultimaDir.codigoPostal || '—'}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <MapPinned size={15} className="text-[#94A3B8] shrink-0" />
                                    <span className="text-[#64748B]">
                                        {ultimaDir.municipio || '—'}{ultimaDir.estado ? <span className="text-[#94A3B8]">, {ultimaDir.estado}</span> : ''}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2.5 border-t border-[#F1F5F9] text-[11px] text-[#94A3B8]">
                                <MapPin size={11} />
                                <span>{ultimaDir.latitud?.toFixed(5)}, {ultimaDir.longitud?.toFixed(5)}</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                            <MapPin size={24} className="text-[#CBD5E1] mb-2" />
                            <p className="text-[12px] text-[#94A3B8]">
                                Presiona <span className="font-semibold text-[#64748B]">Ubicarme</span> o haz clic en el mapa
                            </p>
                        </div>
                    )}
                </div>

                {/* ─── DERECHA: Mapa ─── */}
                <div>
                    <MapaDireccionRegistro
                        onAddressChange={(addressData) => {
                            setUltimaDir(addressData);
                            setDireccion(addressData);

                            actualizarDatos({
                                latitud: addressData.latitud ?? null,
                                longitud: addressData.longitud ?? null,
                                calle: addressData.calle ?? '',
                                numero: addressData.numero ?? '',
                                colonia: addressData.colonia ?? '',
                                codigoPostal: addressData.codigoPostal ?? '',
                                municipio: addressData.municipio ?? '',
                                estado: addressData.estado ?? '',
                            });
                        }}
                    />
                </div>
            </div>
        </Card>
    );
}