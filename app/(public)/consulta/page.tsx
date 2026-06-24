'use client';

import { useState } from 'react';
import { Search, Shield, Car } from 'lucide-react';

import SearchPlaca from '@/features/buscadorGlobal/components/SearchPlaca';
import TablaInfraccionesBuscadorPlaca from '@/features/buscadorGlobal/components/TablaInfraccionesBuscadorPlaca'
import EmptyState from '@/features/buscadorGlobal/components/EmptyState';
import LoadingState from '@/features/buscadorGlobal/components/LoadingState';

import { buscarInfracciones } from '@/features/buscadorGlobal/components/server';

import { InfraccionPublica } from '@/features/buscadorGlobal/types';

function BackgroundDecoration() {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#2563EB]/[0.03] blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#60A5FA]/[0.03] blur-3xl" />
            <svg className="absolute inset-0 w-full h-full opacity-[0.015]"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern id="consulta-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#2563EB" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#consulta-grid)" />
            </svg>
        </div>
    );
}

export default function ConsultaPage() {
    const [placa, setPlaca] = useState('');
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [infracciones, setInfracciones] = useState<InfraccionPublica[]>([]);

    async function handleSearch() {
        if (!placa.trim()) return;

        try {
            setLoading(true);
            const data = await buscarInfracciones(placa);
            setInfracciones(data.infracciones);
            setSearched(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-dvh overflow-x-hidden bg-[#F1F5F9] px-6 py-16 relative">
            <BackgroundDecoration />

            <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8">

                {/* Header */}
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] flex items-center justify-center shadow-[0_8px_24px_rgba(37,99,235,0.2)]">
                        <Car size={30} className="text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">
                            Consulta de infracciones
                        </h1>
                        <p className="text-sm text-[#64748B] mt-1">
                            Ingresa tu placa para consultar infracciones registradas.
                        </p>
                    </div>
                </div>

                <SearchPlaca
                    value={placa}
                    onChange={setPlaca}
                    onSearch={handleSearch}
                    loading={loading}
                />

                {loading && <LoadingState />}

                {!loading && searched && infracciones.length === 0 && (
                    <EmptyState />
                )}

                {!loading && infracciones.length > 0 && (
                    <TablaInfraccionesBuscadorPlaca infracciones={infracciones} />
                )}
            </div>
        </main>
    );
}
