'use client';


import { Card } from '../ui/Card';
import { CardTitle } from '../ui/CardTitle';
import { RadioOption } from '../ui/RadioInput';
import { FieldLabel } from '../ui/FieldLabel';
import { useState } from 'react';
import { useInfraccionStore } from '@/stores/useInfraccionStore';

// Simplificamos las Props ya que quitamos todo lo relacionado a la CURP que ahora es interno
interface Props {
    loading: boolean; // Carga general del formulario (guardado, etc.)
    boolError: (value: boolean | null) => boolean;
    fieldError: (value: string) => boolean;
    inputBase: string;
    inputError: string;
}

export default function PasoConductor({
    loading,
    boolError,
    fieldError,
    inputBase,
    inputError,
}: Props) {
    //=========================================
    // STORE (ZUSTAND)
    //=========================================
    const datos = useInfraccionStore((s) => s.datos);
    const actualizarDatos = useInfraccionStore((s) => s.actualizarDatos);
    console.log(datos)

    //=========================================
    // ESTADOS LOCALES DE CURP (Encapsulados)
    //=========================================
    const [curpLoading, setCurpLoading] = useState(false);
    const [curpStatus, setCurpStatus] = useState<'idle' | 'found' | 'not_found' | 'error'>('idle');

    //=========================================
    // LÓGICA DE BÚSQUEDA INTERNA
    //=========================================
    const buscarCURP = async (curp: string) => {
        // Doble validación de seguridad por longitud
        if (curp.length !== 18) {
            setCurpStatus('idle');
            return;
        }

        setCurpLoading(true);
        setCurpStatus('idle');

        try {
            const res = await fetch('/api/auth/curp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': process.env.X_API_KEY ?? '', // Nota: Si esto corre en cliente, proces.env debe exponerse con NEXT_PUBLIC_ si se ocupa del lado del navegador, de lo contrario llegará vacío.
                },
                body: JSON.stringify({ identificador: curp }),
            });

            if (!res.ok) throw new Error('Error en la respuesta');

            const json = await res.json();

            if (json.success && json.data) {
                const { nombre, primer_apellido, segundo_apellido, email } = json.data;

                // CORRECCIÓN CLAVE: Guardamos directamente en el Store global que consumen tus inputs
                actualizarDatos({
                    nombreInfractor: nombre?.trim().toUpperCase() ?? '',
                    apPaternoInfractor: primer_apellido?.trim().toUpperCase() ?? '',
                    apMaternoInfractor: segundo_apellido?.trim().toUpperCase() ?? '',
                    correoInfractor: email ?? '',
                });

                setCurpStatus('found');
            } else {
                setCurpStatus('not_found');
            }
        } catch (err) {
            console.error('Error al buscar CURP:', err);
            setCurpStatus('error');
        } finally {
            setCurpLoading(false);
        }
    };

    // Guard de renderizado básico
    if (datos.estaCiudadanoPresente !== true) {
        return null;
    }

    return (
        <div className="space-y-5">
            <Card>
                <CardTitle>Identificación oficial (INE)</CardTitle>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    <RadioOption
                        error={boolError(datos.presentaIne)}
                        name="presentaIne"
                        value="true"
                        checked={datos.presentaIne === true}
                        onChange={() => actualizarDatos({ presentaIne: true })}
                        label="Presenta INE"
                        description="Se verificará CURP y datos del documento"
                        disabled={loading || curpLoading}
                    />

                    <RadioOption
                        error={boolError(datos.presentaIne)}
                        name="presentaIne"
                        value="false"
                        checked={datos.presentaIne === false}
                        onChange={() => {
                            setCurpStatus('idle');
                            actualizarDatos({
                                presentaIne: false,
                                curpInfractor: '',
                                nombreInfractor: '',
                                apPaternoInfractor: '',
                                apMaternoInfractor: '',
                                correoInfractor: '',
                            });
                        }}
                        label="No presenta INE"
                        description="Se capturarán datos de manera manual"
                        disabled={loading || curpLoading}
                    />
                </div>

                <p className="text-xs mt-1 h-4 text-red-500">
                    {boolError(datos.presentaIne) ? 'Indica si el conductor presenta INE' : ''}
                </p>

                {datos.presentaIne === true && (
                    <div className="space-y-4 p-4 rounded-xl border-2 border-slate-200">

                        {/* INPUT CURP */}
                        <div>
                            <FieldLabel required>CURP</FieldLabel>
                            <div className="relative">
                                <input
                                    disabled={loading || curpLoading}
                                    name="curpInfractor"
                                    placeholder="Ej. GOMC890101HDFMRR01"
                                    maxLength={18}
                                    className={fieldError(datos.curpInfractor) ? inputError : inputBase}
                                    value={datos.curpInfractor ?? ''}
                                    onChange={(e) => {
                                        const val = e.target.value.toUpperCase();

                                        // Actualiza instantáneamente el input para escribir fluido
                                        actualizarDatos({ curpInfractor: val });

                                        // Disparar búsqueda automática SOLO cuando se completen los 18 dígitos exactos
                                        if (val.length === 18) {
                                            buscarCURP(val);
                                        } else {
                                            setCurpStatus('idle');
                                        }
                                    }}
                                />

                                {curpLoading && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <p className="text-xs mt-1 h-4">
                                {fieldError(datos.curpInfractor) ? (
                                    <span className="text-red-500">La CURP es requerida</span>
                                ) : curpLoading ? (
                                    <span className="text-blue-500">Buscando datos...</span>
                                ) : curpStatus === 'found' ? (
                                    <span className="text-green-600">✓ Datos encontrados y autocompletados</span>
                                ) : curpStatus === 'not_found' ? (
                                    <span className="text-amber-600">No registrado en el sistema — captura los datos manualmente</span>
                                ) : curpStatus === 'error' ? (
                                    <span className="text-red-500">Error al consultar, verifica la CURP e intenta de nuevo</span>
                                ) : curpStatus === 'idle' ? (
                                    <span className="text-amber-600">Captura una CURP válida para autocompletar los datos del conductor</span>
                                ) : null}
                            </p>
                        </div>

                        {/* CORREO */}
                        <div>
                            <FieldLabel required>Correo electrónico</FieldLabel>
                            <input
                                disabled={loading || curpLoading}
                                name="correoInfractor"
                                placeholder="juan@ejemplo.com"
                                className={fieldError(datos.correoInfractor) ? inputError : inputBase}
                                value={datos.correoInfractor ?? ''}
                                onChange={(e) => actualizarDatos({ correoInfractor: e.target.value })}
                            />
                            <p className="text-xs mt-1 h-4 text-red-500">
                                {fieldError(datos.correoInfractor) ? 'Este campo es requerido' : ''}
                            </p>
                        </div>

                        {/* NOMBRES Y APELLIDOS */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <FieldLabel required>Nombre(s)</FieldLabel>
                                <input
                                    disabled={loading || curpLoading}
                                    name="nombreInfractor"
                                    placeholder="Juan Carlos"
                                    className={fieldError(datos.nombreInfractor) ? inputError : inputBase}
                                    value={datos.nombreInfractor ?? ''}
                                    onChange={(e) => actualizarDatos({ nombreInfractor: e.target.value.toUpperCase() })}
                                />
                                <p className="text-xs mt-1 h-4 text-red-500">
                                    {fieldError(datos.nombreInfractor) ? 'Este campo es requerido' : ''}
                                </p>
                            </div>

                            <div>
                                <FieldLabel required>Apellido paterno</FieldLabel>
                                <input
                                    disabled={loading || curpLoading}
                                    name="apPaternoInfractor"
                                    placeholder="García"
                                    className={fieldError(datos.apPaternoInfractor) ? inputError : inputBase}
                                    value={datos.apPaternoInfractor ?? ''}
                                    onChange={(e) => actualizarDatos({ apPaternoInfractor: e.target.value.toUpperCase() })}
                                />
                                <p className="text-xs mt-1 h-4 text-red-500">
                                    {fieldError(datos.apPaternoInfractor) ? 'Este campo es requerido' : ''}
                                </p>
                            </div>

                            <div>
                                <FieldLabel required>Apellido materno</FieldLabel>
                                <input
                                    disabled={loading || curpLoading}
                                    name="apMaternoInfractor"
                                    placeholder="Morales"
                                    className={fieldError(datos.apMaternoInfractor) ? inputError : inputBase}
                                    value={datos.apMaternoInfractor ?? ''}
                                    onChange={(e) => actualizarDatos({ apMaternoInfractor: e.target.value.toUpperCase() })}
                                />
                                <p className="text-xs mt-1 h-4 text-red-500">
                                    {fieldError(datos.apMaternoInfractor) ? 'Este campo es requerido' : ''}
                                </p>
                            </div>
                        </div>

                    </div>
                )}
            </Card>
        </div>
    );
}