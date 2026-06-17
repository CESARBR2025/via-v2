'use client';

import { useState } from 'react';
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
        <div className="grid grid-cols-[1fr_1fr] gap-4">
            {/* ─── IZQUIERDA: Info card ─── */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.07),0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                {ultimaDir ? (
                    <div className="p-5 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                                <MapPin size={15} className="text-[#2563EB]" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                                    Ubicación
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#F8FAFC]">
                                <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center shrink-0">
                                    <Home size={14} className="text-[#2563EB]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#94A3B8]">Calle</p>
                                    <p className="text-[13px] font-semibold text-[#0F172A] truncate">
                                        {ultimaDir.calle || '—'}{ultimaDir.numero ? <span className="text-[#64748B] font-normal"> #{ultimaDir.numero}</span> : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                                <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center shrink-0">
                                    <Building2 size={14} className="text-[#64748B]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#94A3B8]">Colonia</p>
                                    {ultimaDir.colonia ? (
                                        <span className="inline-flex items-center gap-1 bg-[#EFF6FF] text-[#2563EB] px-2.5 py-0.5 rounded-full text-[12px] font-medium">
                                            {ultimaDir.colonia}
                                        </span>
                                    ) : <p className="text-[13px] text-[#94A3B8]">—</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#F8FAFC]">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center shrink-0">
                                        <Mail size={14} className="text-[#64748B]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-[#94A3B8]">CP</p>
                                        <p className="text-[13px] font-semibold text-[#0F172A]">{ultimaDir.codigoPostal || '—'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#F8FAFC]">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center shrink-0">
                                        <MapPinned size={14} className="text-[#64748B]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-[#94A3B8]">Municipio</p>
                                        <p className="text-[13px] font-semibold text-[#0F172A] truncate">
                                            {ultimaDir.municipio || '—'}{ultimaDir.estado ? <span className="text-[#64748B] font-normal">, {ultimaDir.estado}</span> : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-[#F1F5F9] text-[11px] text-[#94A3B8]">
                            <MapPin size={11} />
                            <span className="font-mono">{ultimaDir.latitud?.toFixed(5)}, {ultimaDir.longitud?.toFixed(5)}</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-[240px] text-center p-8">
                        <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-4">
                            <MapPin size={20} className="text-[#94A3B8]" />
                        </div>
                        <p className="text-[13px] font-medium text-[#64748B]">Selecciona una ubicación</p>
                        <p className="text-[11px] text-[#94A3B8] mt-1">
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
    );
}