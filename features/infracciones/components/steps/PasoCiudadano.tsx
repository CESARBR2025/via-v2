'use client';

import { useInfraccionStore } from '@/stores/useInfraccionStore';


import { Card } from '../ui/Card';
import { CardTitle } from '../ui/CardTitle';
import { RadioOption } from '../ui/RadioInput';


interface Props {
    loading: boolean;
    boolError: (value: boolean | null) => boolean;
}

export default function PasoCiudadano({
    loading,
    boolError,
}: Props) {

    //========================
    // STORE
    //========================
    const datos =
        useInfraccionStore((s) => s.datos);

    const actualizarDatos =
        useInfraccionStore((s) => s.actualizarDatos);

    return (
        <div className="space-y-5">

            {/* ======================== */}
            {/* PRESENCIA */}
            {/* ======================== */}
            <Card>

                <CardTitle>
                    Presencia del ciudadano
                </CardTitle>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <RadioOption
                        name="ciudadanoPresente"
                        value="true"
                        checked={
                            datos.estaCiudadanoPresente === true
                        }
                        onChange={() => {

                            actualizarDatos({
                                estaCiudadanoPresente: true,
                                esCiudadanoTitular: null,
                            });

                        }}
                        label="Ciudadano presente"
                        description="El infractor se encuentra en el lugar"
                        disabled={loading}
                        error={boolError(
                            datos.estaCiudadanoPresente
                        )}
                    />

                    <RadioOption
                        name="ciudadanoPresente"
                        value="false"
                        checked={
                            datos.estaCiudadanoPresente === false
                        }
                        onChange={() => {

                            actualizarDatos({
                                estaCiudadanoPresente: false,
                                esCiudadanoTitular: null,
                            });

                        }}
                        label="Ciudadano ausente"
                        description="El infractor no está disponible"
                        disabled={loading}
                        error={boolError(
                            datos.estaCiudadanoPresente
                        )}
                    />

                </div>

            </Card>

            {/* ======================== */}
            {/* TITULARIDAD */}
            {/* ======================== */}
            {datos.estaCiudadanoPresente && (

                <Card>

                    <CardTitle>
                        Titularidad del vehículo
                    </CardTitle>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        <RadioOption
                            error={boolError(
                                datos.esCiudadanoTitular
                            )}
                            name="esCiudadanoTitular"
                            value="true"
                            checked={
                                datos.esCiudadanoTitular === true
                            }
                            onChange={() =>
                                actualizarDatos({
                                    esCiudadanoTitular: true,
                                })
                            }
                            label="Es el titular"
                            description="El ciudadano es dueño registrado del vehículo"
                            disabled={loading}
                        />

                        <RadioOption
                            name="esCiudadanoTitular"
                            value="false"
                            error={boolError(
                                datos.esCiudadanoTitular
                            )}
                            checked={
                                datos.esCiudadanoTitular === false
                            }
                            onChange={() =>
                                actualizarDatos({
                                    esCiudadanoTitular: false,
                                })
                            }
                            label="No es el titular"
                            description="El ciudadano conduce un vehículo ajeno"
                            disabled={loading}
                        />

                    </div>

                    {boolError(
                        datos.esCiudadanoTitular
                    ) && (
                            <p className="text-xs text-red-500 mt-3">

                                Indica si el ciudadano es titular del vehículo

                            </p>
                        )}

                </Card>

            )}

        </div>
    );
}