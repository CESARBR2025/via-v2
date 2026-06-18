'use client';

import React from 'react';

import { Card } from '../ui/Card';
import { CardTitle } from '../ui/CardTitle';

import { useInfraccionStore } from '@/stores/useInfraccionStore';

interface PasoEvidenciasProps {
    loading?: boolean;
}

export const PasoEvidencias: React.FC<PasoEvidenciasProps> = ({
    loading = false,
}) => {
    const datos =
        useInfraccionStore((s) => s.datos);
    const actualizarDatos =
        useInfraccionStore((s) => s.actualizarDatos);

    const agregarEvidencia =
        datos.agregarEvidencia === true;

    const evidencias =
        datos.evidencias ?? [];

    return (
        <Card>
            <CardTitle>
                Evidencias fotográficas
            </CardTitle>

            <p className="text-sm text-slate-500 mb-5">
                Las fotografías son opcionales pero fortalecen el expediente de infracción.
            </p>

            {/* Toggle */}
            <label
                className={`
                    flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 w-fit
                    ${agregarEvidencia
                        ? 'border-blue-700 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }
                `}
            >
                <div
                    className={`
                        w-10 h-6 rounded-full relative transition-all duration-300
                        ${agregarEvidencia
                            ? 'bg-blue-700'
                            : 'bg-slate-300'
                        }
                    `}
                >
                    <div
                        className={`
                            absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300
                            ${agregarEvidencia
                                ? 'left-5'
                                : 'left-1'
                            }
                        `}
                    />
                </div>

                <input
                    type="checkbox"
                    checked={agregarEvidencia}
                    onChange={(e) => {
                        const checked =
                            e.target.checked;

                        actualizarDatos({
                            agregarEvidencia:
                                checked,

                            // Si desactiva el switch
                            // limpiamos evidencias
                            evidencias: checked
                                ? evidencias
                                : [],
                        });
                    }}
                    className="sr-only"
                />

                <span className="text-sm font-medium text-slate-700">
                    Agregar evidencia fotográfica
                </span>
            </label>

            {/* Upload */}
            {agregarEvidencia && (
                <div className="mt-5 animate-fadeIn">
                    <label
                        className="
                            flex flex-col items-center justify-center gap-3 p-8
                            border-2 border-dashed border-slate-300 rounded-xl
                            hover:border-blue-700 hover:bg-blue-50/30
                            cursor-pointer transition-all duration-200
                        "
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-blue-700"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                                />
                            </svg>
                        </div>

                        <div className="text-center">
                            <p className="text-sm font-medium text-blue-700">
                                Seleccionar fotografías
                            </p>

                            <p className="text-xs text-slate-400 mt-0.5">
                                PNG, JPG o HEIC · Múltiples archivos permitidos
                            </p>
                        </div>

                        <input
                            disabled={loading}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                                if (!e.target.files)
                                    return;

                                const nuevosArchivos =
                                    Array.from(
                                        e.target.files
                                    );

                                actualizarDatos({
                                    evidencias: [
                                        ...evidencias,
                                        ...nuevosArchivos,
                                    ],
                                });
                            }}
                            className="sr-only"
                        />
                    </label>

                    {/* Evidencias seleccionadas */}
                    {evidencias.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                {
                                    evidencias.length
                                }{' '}
                                archivo(s) seleccionado(s)
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {evidencias.map(
                                    (
                                        archivo,
                                        index
                                    ) => (
                                        <div
                                            key={`${archivo.name}-${index}`}
                                            className="
                                                inline-flex
                                                items-center
                                                gap-2
                                                text-xs
                                                bg-blue-50
                                                text-blue-700
                                                border
                                                border-blue-200
                                                px-3
                                                py-1.5
                                                rounded-full
                                            "
                                        >
                                            <span>
                                                {
                                                    archivo.name
                                                }
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    actualizarDatos(
                                                        {
                                                            evidencias:
                                                                evidencias.filter(
                                                                    (
                                                                        _,
                                                                        i
                                                                    ) =>
                                                                        i !==
                                                                        index
                                                                ),
                                                        }
                                                    );
                                                }}
                                                className="font-medium hover:text-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

export default PasoEvidencias;