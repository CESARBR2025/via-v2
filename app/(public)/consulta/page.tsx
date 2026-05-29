'use client';

import { useState } from 'react';


import SearchPlaca from '@/features/buscadorGlobal/components/SearchPlaca';
import TablaInfracciones from '@/features/buscadorGlobal/components/TablaInfracciones'
import EmptyState from '@/features/buscadorGlobal/components/EmptyState';
import LoadingState from '@/features/buscadorGlobal/components/LoadingState';

import { buscarInfracciones } from '@/features/buscadorGlobal/components/server';

import { InfraccionPublica } from '@/features/buscadorGlobal/types';

export default function ConsultaPage() {
    console.log("entro")
    const [placa, setPlaca] = useState('');

    const [loading, setLoading] = useState(false);

    const [searched, setSearched] = useState(false);

    const [infracciones, setInfracciones] =
        useState<InfraccionPublica[]>([]);

    async function handleSearch() {
        if (!placa.trim()) return;

        try {
            setLoading(true);

            const data =
                await buscarInfracciones(placa);

            setInfracciones(data.infracciones);

            setSearched(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            className="
        min-h-screen
        bg-slate-50
        px-6
        py-16
      "
        >
            <div
                className="
          mx-auto
          flex
          max-w-7xl
          flex-col
          gap-8
        "
            >
                <div className="flex flex-col gap-2">
                    <h1
                        className="
              text-4xl
              font-bold
              tracking-tight
              text-slate-900
            "
                    >
                        Consulta de infracciones
                    </h1>

                    <p className="text-slate-500">
                        Ingresa tu placa para consultar
                        infracciones registradas.
                    </p>
                </div>

                <SearchPlaca
                    value={placa}
                    onChange={setPlaca}
                    onSearch={handleSearch}
                    loading={loading}
                />

                {loading && <LoadingState />}

                {!loading &&
                    searched &&
                    infracciones.length === 0 && (
                        <EmptyState />
                    )}

                {!loading &&
                    infracciones.length > 0 && (
                        <TablaInfracciones
                            infracciones={infracciones}
                        />
                    )}
            </div>
        </main>
    );
}