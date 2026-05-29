'use client';

import { useEffect } from 'react';

import { useInfraccionStore } from '@/stores/useInfraccionStore';

import { Card } from '../ui/Card';
import { CardTitle } from '../ui/CardTitle';
import { RadioOption } from '../ui/RadioInput';

interface Props {
    loading: boolean;
    boolError: (value: boolean | null) => boolean;

}

export default function PasoDecuentos({
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

    console.log(datos)
    //========================
    // DESCUENTOS
    //========================
    useEffect(() => {

        /**
         * Fecha limite
         */
        const fechaLimite = new Date();

        fechaLimite.setDate(
            fechaLimite.getDate() + 10
        );

        /**
         * Adulto mayor + INAPAM
         */
        if (
            datos.esCiudadanoAdultoMayor === true &&
            datos.presentaInapam === true
        ) {

            actualizarDatos({
                descuentoAplicado: 70,
                fechaLimiteDescuento:
                    fechaLimite.toISOString(),
            });

            return;
        }

        /**
         * Cualquier otro caso
         */
        actualizarDatos({
            descuentoAplicado: 50,
            fechaLimiteDescuento:
                fechaLimite.toISOString(),
        });

    }, [
        datos.esCiudadanoAdultoMayor,
        datos.presentaInapam,
        actualizarDatos,
    ]);

    return (

        <div className="space-y-5">

            {/* ======================== */}
            {/* ADULTO MAYOR */}
            {/* ======================== */}
            <Card>

                <CardTitle>
                    ¿El ciudadano es adulto mayor?
                </CardTitle>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <RadioOption
                        name="esCiudadanoAdultoMayor"
                        value="true"
                        checked={
                            datos.esCiudadanoAdultoMayor === true
                        }
                        onChange={() => {

                            actualizarDatos({
                                esCiudadanoAdultoMayor: true,
                            });

                        }}
                        label="Sí es adulto mayor"
                        description="El ciudadano aplica para validación INAPAM"
                        disabled={loading}
                        error={boolError(
                            datos.esCiudadanoAdultoMayor
                        )}
                    />

                    <RadioOption
                        name="esCiudadanoAdultoMayor"
                        value="false"
                        checked={
                            datos.esCiudadanoAdultoMayor === false
                        }
                        onChange={() => {

                            actualizarDatos({
                                esCiudadanoAdultoMayor: false,
                                presentaInapam: false,
                            });

                        }}
                        label="No es adulto mayor"
                        description="Se aplicará descuento regular"
                        disabled={loading}
                        error={boolError(
                            datos.esCiudadanoAdultoMayor
                        )}
                    />

                </div>

            </Card>

            {/* ======================== */}
            {/* INAPAM */}
            {/* ======================== */}
            {datos.esCiudadanoAdultoMayor && (

                <Card>

                    <CardTitle>
                        ¿Presenta credencial INAPAM?
                    </CardTitle>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        <RadioOption
                            error={boolError(
                                datos.presentaInapam
                            )}
                            name="presentaInapam"
                            value="true"
                            checked={
                                datos.presentaInapam === true
                            }
                            onChange={() =>
                                actualizarDatos({
                                    presentaInapam: true,
                                })
                            }
                            label="Sí presenta"
                            description="Se solicitará INE e INAPAM"
                            disabled={loading}
                        />

                        <RadioOption
                            name="presentaInapam"
                            value="false"
                            error={boolError(
                                datos.presentaInapam
                            )}
                            checked={
                                datos.presentaInapam === false
                            }
                            onChange={() =>
                                actualizarDatos({
                                    presentaInapam: false,
                                })
                            }
                            label="No presenta"
                            description="Solo se solicitará INE"
                            disabled={loading}
                        />

                    </div>

                    {boolError(
                        datos.presentaInapam
                    ) && (
                            <p className="text-xs text-red-500 mt-3">

                                Indica si el ciudadano presenta credencial INAPAM

                            </p>
                        )}

                </Card>

            )}

            {/* ======================== */}
            {/* DOCUMENTOS */}
            {/* ======================== */}
            {datos.esCiudadanoAdultoMayor !== null && (

                <Card>

                    <CardTitle>
                        Documentación requerida
                    </CardTitle>

                    <div className="space-y-5">

                        {/* INE */}
                        <div>

                            <label className="block text-sm font-medium mb-2">

                                Fotografía del INE

                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                disabled={loading}
                                onChange={(e) => {

                                    const file =
                                        e.target.files?.[0] || null;



                                }}
                            />

                        </div>

                        {/* INAPAM */}
                        {datos.esCiudadanoAdultoMayor === true &&
                            datos.presentaInapam === true && (

                                <div>

                                    <label className="block text-sm font-medium mb-2">

                                        Fotografía credencial INAPAM

                                    </label>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        disabled={loading}
                                        onChange={(e) => {

                                            const file =
                                                e.target.files?.[0] || null;


                                        }}
                                    />

                                </div>

                            )}

                    </div>

                </Card>

            )}

            {/* ======================== */}
            {/* RESUMEN */}
            {/* ======================== */}
            <Card>

                <CardTitle>
                    Descuento aplicado
                </CardTitle>

                <div className="space-y-2 text-sm">

                    <p>

                        <strong>
                            Descuento:
                        </strong>{' '}
                        {datos.descuentoAplicado}%

                    </p>

                    <p>

                        <strong>
                            Fecha límite:
                        </strong>{' '}
                        {datos.fechaLimiteDescuento
                            ? new Date(
                                datos.fechaLimiteDescuento
                            ).toLocaleDateString()
                            : '--'}

                    </p>

                </div>

            </Card>

        </div>

    );
}