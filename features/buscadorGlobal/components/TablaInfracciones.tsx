'use client';

import { useState } from 'react';

import { ModalDetallesPublico } from './ModalDetallesPublico';
import { InfraccionPublica } from '../types';

interface Props {
    infracciones: InfraccionPublica[];
}

export default function TablaInfracciones({
    infracciones,
}: Props) {
    /**
     * Loading por fila
     */
    const [loadingId, setLoadingId] = useState<
        number | null
    >(null);

    /**
     * Modal
     */
    const [open, setOpen] = useState(false);

    /**
     * Loading modal
     */
    const [loading, setLoading] = useState(false);

    /**
     * Detalle infracción
     */
    const [detalle, setDetalle] = useState<any>(null);

    /**
     * Obtener detalle de infracción
     */
    const handleVerDetalles = async (
        idInfraccion: number,
    ) => {
        try {
            /**
             * Abrir modal
             */
            setOpen(true);

            /**
             * Loadings
             */
            setLoading(true);
            setLoadingId(idInfraccion);

            /**
             * Request
             */
            const response = await fetch(
                `/api/buscadorGlobal/${idInfraccion}`,
                {
                    method: 'GET',
                    cache: 'no-store',
                },
            );

            if (!response.ok) {
                throw new Error(
                    'Error obteniendo detalle',
                );
            }

            /**
             * JSON
             */
            const data = await response.json();

            console.log(
                '[DETALLE_INFRACCION]',
                data,
            );

            /**
             * Guardar detalle
             */
            setDetalle(data);
        } catch (error) {
            console.error(
                '[HANDLE_VER_DETALLES]',
                error,
            );

            setDetalle(null);
        } finally {
            setLoading(false);
            setLoadingId(null);
        }
    };

    return (
        <>
            <div
                className="
                    w-full
                    overflow-hidden
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                "
            >
                <div className="overflow-auto">
                    <table className="w-full min-w-[1200px]">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    Folio
                                </th>

                                <th className="px-6 py-4 text-left">
                                    Placa
                                </th>

                                <th className="px-6 py-4 text-left">
                                    Latitud
                                </th>

                                <th className="px-6 py-4 text-left">
                                    Longitud
                                </th>

                                <th className="px-6 py-4 text-left">
                                    Código Postal
                                </th>

                                <th className="px-6 py-4 text-left">
                                    Calle
                                </th>

                                <th className="px-6 py-4 text-left">
                                    Número
                                </th>

                                <th className="px-6 py-4 text-left">
                                    Artículo
                                </th>

                                <th className="px-6 py-4 text-left">
                                    Fracción
                                </th>

                                <th className="px-6 py-4 text-center">
                                    Acciones
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {infracciones.map((item) => (
                                <tr
                                    key={
                                        item.infraccion_id
                                    }
                                    className="
                                        border-t
                                        border-slate-100
                                        hover:bg-slate-50
                                    "
                                >
                                    <td className="px-6 py-4 font-medium">
                                        {item.folio}
                                    </td>

                                    <td className="px-6 py-4">
                                        {item.placa}
                                    </td>

                                    <td className="px-6 py-4">
                                        {item.latitud}
                                    </td>

                                    <td className="px-6 py-4">
                                        {item.longitud}
                                    </td>

                                    <td className="px-6 py-4">
                                        {
                                            item.codigo_postal
                                        }
                                    </td>

                                    <td className="px-6 py-4">
                                        {item.calle}
                                    </td>

                                    <td className="px-6 py-4">
                                        {item.numero}
                                    </td>

                                    <td className="px-6 py-4">
                                        {item.articulo}
                                    </td>

                                    <td className="px-6 py-4">
                                        {item.fraccion}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() =>
                                                    handleVerDetalles(
                                                        item.infraccion_id,
                                                    )
                                                }
                                                disabled={
                                                    loadingId ===
                                                    item.infraccion_id
                                                }
                                                className="
                                                    inline-flex
                                                    items-center
                                                    justify-center
                                                    rounded-2xl
                                                    bg-blue-600
                                                    px-4
                                                    py-2
                                                    text-sm
                                                    font-medium
                                                    text-white
                                                    transition-all
                                                    duration-200
                                                    hover:bg-blue-700
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-60
                                                "
                                            >
                                                {loadingId ===
                                                    item.infraccion_id
                                                    ? 'Cargando...'
                                                    : 'Detalles'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalDetallesPublico
                isOpen={open}
                onClose={() => setOpen(false)}
                loading={loading}
                detalle={detalle}
            />
        </>
    );
}