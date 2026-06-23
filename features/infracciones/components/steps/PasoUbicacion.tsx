'use client';

import { useState } from 'react';
import { MapaDireccionRegistro } from '@/features/oficiales/components/MapaDireccionRegistro';
import { useInfraccionStore } from '@/stores/useInfraccionStore';
import { MapPin, Home, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';

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
        <div className="space-y-4">
            {/* ─── MAPA ─── */}
            <div className="h-[300px]">
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

            {/* ─── DATOS DE UBICACIÓN ─── */}
            {ultimaDir ? (
                <Card className="flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                <MapPin size={15} className="text-blue-700" />
                            </div>
                            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-600">
                                Ubicación
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-[10px] font-medium">
                            <CheckCircle2 size={10} className="text-green-500" strokeWidth={2} />
                            Confirmada
                        </span>
                    </div>

                    {/* Hero address */}
                    <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border border-blue-100 p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white border border-blue-200 flex items-center justify-center shrink-0 shadow-sm">
                                <Home size={16} className="text-blue-700" />
                            </div>
                            <div className="min-w-0 pt-0.5">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1">
                                    Dirección
                                </p>
                                <p className="text-base font-medium text-slate-900 leading-snug">
                                    {ultimaDir.calle || '—'}
                                    {ultimaDir.numero && <span className="text-slate-500 font-normal"> #{ultimaDir.numero}</span>}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
                        <div className="bg-slate-50 rounded-lg px-3.5 py-3">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1">
                                Colonia
                            </p>
                            <p className="text-sm font-medium text-slate-900 truncate">
                                {ultimaDir.colonia || '—'}
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg px-3.5 py-3">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1">
                                Código Postal
                            </p>
                            <p className="text-sm font-medium text-slate-900">
                                {ultimaDir.codigoPostal || '—'}
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg px-3.5 py-3">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1">
                                Municipio
                            </p>
                            <p className="text-sm font-medium text-slate-900 truncate">
                                {ultimaDir.municipio || '—'}
                                {ultimaDir.estado && <span className="text-slate-500 font-normal">, {ultimaDir.estado}</span>}
                            </p>
                        </div>
                    </div>

                    {/* Coordinates */}
                    <div className="flex items-center gap-2 pt-3 mt-1 border-t border-slate-100 text-xs text-slate-400">
                        <MapPin size={12} />
                        <span className="font-mono">{ultimaDir.latitud?.toFixed(5)}, {ultimaDir.longitud?.toFixed(5)}</span>
                    </div>
                </Card>
            ) : (
                <Card className="flex flex-col items-center justify-center text-center py-8">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                        <MapPin size={20} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">Selecciona una ubicación</p>
                    <p className="text-xs text-slate-400 mt-1">
                        Presiona <span className="font-medium text-slate-600">Ubicarme</span> o haz clic en el mapa
                    </p>
                </Card>
            )}
        </div>
    );
}