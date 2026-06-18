'use client'
import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { CardTitle } from '../ui/CardTitle';
import { Card } from '../ui/Card';
import { SelectWrapper } from '../ui/SelectWrapper';
import { FieldLabel } from '../ui/FieldLabel';
import { useInfraccionStore } from '@/stores/useInfraccionStore';

interface SeccionGarantiaProps {
    loading: boolean;
    fieldError: (val: any) => boolean;
    selectBase: string;
    selectError: string;
}

const MAPA_GARANTIAS: Record<string, string> = {
    TRJ_CIRCULACION: 'Tarjeta de circulación',
    PLACA: 'Placa',
    LICENCIA: 'Licencia',
    VEHICULO: 'Vehículo (Corralón)',
};

export const SeccionGarantia: React.FC<SeccionGarantiaProps> = ({
    loading,
    fieldError,
    selectBase,
    selectError,
}) => {
    // Obtener datos y función de actualización del store
    const datos = useInfraccionStore((s) => s.datos);
    const actualizarDatos = useInfraccionStore((s) => s.actualizarDatos);
    const [gruas, setGruas] = useState<
        {
            id: string;
            nombre: string;
            activo: boolean;
        }[]
    >([]);

    useEffect(() => {
        const cargarGruas = async () => {
            try {
                const response = await fetch('/api/complementos/gruas');

                if (!response.ok) {
                    throw new Error('Error al obtener grúas');
                }

                const result = await response.json();

                setGruas(result.data ?? []);
            } catch (error) {
                console.error('Error cargando grúas:', error);
            }
        };

        cargarGruas();
    }, []);

    return (
        <Card>
            <CardTitle>Garantía retenida</CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tipo de Garantía */}
                <div className="relative pb-5">
                    <FieldLabel required>Tipo de garantía</FieldLabel>
                    <SelectWrapper>
                        <select
                            name="garantia"
                            value={datos.garantiaSeleccionada}
                            onChange={(e) =>
                                actualizarDatos({
                                    garantiaSeleccionada: e.target.value,
                                    motivoRetencionVehiculo: '',
                                    gruaInvolucrada: '',
                                })
                            }
                            disabled={loading}
                            className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-slate-900 transition-all cursor-pointer hover:border-blue-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${fieldError(datos.garantiaSeleccionada) ? 'border-red-400' : 'border-slate-200'}`}
                        >
                            <option value="">Selecciona garantía</option>
                            <option value="TRJ_CIRCULACION">Tarjeta de circulación</option>
                            <option value="PLACA">Placa</option>
                            <option value="LICENCIA">Licencia</option>
                            <option value="VEHICULO">Vehículo</option>
                        </select>
                    </SelectWrapper>
                    <p className="mt-1 text-xs text-red-500">
                        {fieldError(datos.garantiaSeleccionada) ? 'Selecciona el tipo de garantía' : ''}
                    </p>
                </div>

                {/* Campos Condicionales para Vehículo */}
                {datos.garantiaSeleccionada === 'VEHICULO' && (
                    <>
                        {/* Motivo Retención */}
                        <div className="relative pb-5">
                            <FieldLabel required>Motivo de retención</FieldLabel>
                            <SelectWrapper>
                                <select
                                    name="motivoRetencionVehiculo"
                                    value={datos.motivoRetencionVehiculo}
                                    onChange={(e) =>
                                        actualizarDatos({
                                            motivoRetencionVehiculo: e.target.value,
                                            gruaInvolucrada: '',
                                        })
                                    }
                                    disabled={loading}
                                    className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-slate-900 transition-all cursor-pointer hover:border-blue-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${fieldError(datos.motivoRetencionVehiculo) ? 'border-red-400' : 'border-slate-200'}`}
                                >
                                    <option value="">Selecciona motivo</option>
                                    <option value="DELITO">Delito</option>
                                    <option value="ACCIDENTE">Accidente</option>
                                    <option value="INFRACCION">Infracción</option>
                                </select>
                            </SelectWrapper>
                            <p className="mt-1 text-xs text-red-500">
                                {fieldError(datos.motivoRetencionVehiculo)
                                    ? 'Selecciona el motivo de retención'
                                    : ''}
                            </p>
                        </div>

                        {datos.motivoRetencionVehiculo && (
                            <div className="relative pb-5">
                                <FieldLabel required>Grúa asignada</FieldLabel>
                                <SelectWrapper>
                                    <select
                                        name="grua"
                                        value={datos.gruaInvolucrada}
                                        onChange={(e) =>
                                            actualizarDatos({
                                                gruaInvolucrada: e.target.value,
                                            })
                                        }
                                        disabled={loading}
                                        className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-slate-900 transition-all cursor-pointer hover:border-blue-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${fieldError(datos.gruaInvolucrada) ? 'border-red-400' : 'border-slate-200'}`}
                                    >
                                        <option value="">Selecciona grúa</option>
                                        {gruas.map((g) => (
                                            <option key={g.id} value={g.id}>
                                                {g.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </SelectWrapper>
                                <p className="mt-1 text-xs text-red-500">
                                    {fieldError(datos.gruaInvolucrada)
                                        ? 'Selecciona la grúa asignada'
                                        : ''}
                                </p>
                            </div>
                        )}

                        {/* Dependencia a remitir — solo si es Delito o Accidente */}
                        {datos.gruaInvolucrada && datos.motivoRetencionVehiculo !== 'INFRACCION' && (
                            <div className="relative pb-5">
                                <FieldLabel required>Infractor sera remitido a</FieldLabel>
                                <SelectWrapper>
                                    <select
                                        name="dependenciaRemisora"
                                        value={datos.dependenciaRemisora}
                                        onChange={(e) =>
                                            actualizarDatos({
                                                dependenciaRemisora: e.target.value,
                                            })
                                        }
                                        disabled={loading}
                                        className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-slate-900 transition-all cursor-pointer hover:border-blue-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${fieldError(datos.dependenciaRemisora) ? 'border-red-400' : 'border-slate-200'}`}
                                    >
                                        <option value="">Selecciona dependencia</option>
                                        <option value="FISCALIA">FISCALIA</option>
                                        <option value="JUZGADO">JUZGADO CIVICO</option>
                                    </select>
                                </SelectWrapper>
                                <p className="mt-1 text-xs text-red-500">
                                    {fieldError(datos.dependenciaRemisora)
                                        ? 'Selecciona la dependencia a donde sera remitido el infractor'
                                        : ''}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Banner Informativo */}
            {datos.garantiaSeleccionada && (
                <div className="mt-4 flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 transition-all">
                    <div className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                        <AlertCircle size={14} className="text-amber-600" strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-amber-800">Garantía a resguardo</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                            Se retendrá{' '}
                            <span className="font-semibold text-amber-900">
                                {MAPA_GARANTIAS[datos.garantiaSeleccionada] || ''}
                            </span>{' '}
                            como garantía física de la infracción.
                        </p>
                    </div>
                </div>
            )}
        </Card>
    );
};