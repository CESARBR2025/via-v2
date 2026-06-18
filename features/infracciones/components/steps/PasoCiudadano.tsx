'use client';

import { UserCheck, UserX, BadgeCheck, UserMinus } from 'lucide-react';

import { useInfraccionStore } from '@/stores/useInfraccionStore';

import { Card } from '../ui/Card';
import { CardTitle } from '../ui/CardTitle';
import { SegmentedControl } from '../ui/SegmentedControl';


interface Props {
    loading: boolean;
    boolError: (value: boolean | null) => boolean;
}

export default function PasoCiudadano({
    loading,
    boolError,
}: Props) {

    const datos =
        useInfraccionStore((s) => s.datos);

    const actualizarDatos =
        useInfraccionStore((s) => s.actualizarDatos);

    const presente = datos.estaCiudadanoPresente;
    const titular = datos.esCiudadanoTitular;

    return (
        <div className="space-y-6">

            {/* ======================== */}
            {/* PRESENCIA */}
            {/* ======================== */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <CardTitle>
                        Presencia del ciudadano
                    </CardTitle>
                </div>

                <SegmentedControl
                    options={[
                        { value: 'true', label: 'Presente', icon: UserCheck },
                        { value: 'false', label: 'Ausente', icon: UserX },
                    ]}
                    value={presente === null ? null : String(presente)}
                    onChange={(val) => {
                        actualizarDatos({
                            estaCiudadanoPresente: val === 'true',
                            esCiudadanoTitular: val === 'true' ? titular : null,
                        });
                    }}
                    disabled={loading}
                    error={boolError(presente)}
                />

                {presente !== null && (
                    <p className={`text-xs mt-3 pl-0.5 ${presente ? 'text-green-600' : 'text-slate-600'}`}>
                        {presente
                            ? 'El conductor se encuentra en el lugar de la infracción'
                            : 'La infracción se registrará sin la presencia del conductor'
                        }
                    </p>
                )}

                {boolError(presente) && (
                        <p className="text-xs text-red-500 mt-2">
                        Selecciona si el ciudadano está presente o ausente
                    </p>
                )}
            </Card>

            {/* ======================== */}
            {/* TITULARIDAD */}
            {/* ======================== */}
            {presente && (

                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <CardTitle>
                            Titularidad del vehículo
                        </CardTitle>
                    </div>

                    <SegmentedControl
                        options={[
                            { value: 'true', label: 'Es titular', icon: BadgeCheck },
                            { value: 'false', label: 'No es titular', icon: UserMinus },
                        ]}
                        value={titular === null ? null : String(titular)}
                        onChange={(val) =>
                            actualizarDatos({
                                esCiudadanoTitular: val === 'true',
                            })
                        }
                        disabled={loading}
                        error={boolError(titular)}
                    />

                    {titular !== null && (
                        <p className={`text-xs mt-3 pl-0.5 ${titular ? 'text-green-600' : 'text-slate-600'}`}>
                            {titular
                                ? 'El ciudadano es el propietario registrado del vehículo'
                                : 'El ciudadano conduce un vehículo que no está a su nombre'
                            }
                        </p>
                    )}

                    {boolError(titular) && (
                    <p className="text-xs text-red-500 mt-2">
                            Indica si el ciudadano es titular del vehículo
                        </p>
                    )}
                </Card>

            )}

        </div>
    );
}