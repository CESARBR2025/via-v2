import React from 'react';
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
    console.log(datos)
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
                            disabled={loading}
                            value={datos.garantiaSeleccionada}
                            onChange={(e) =>
                                actualizarDatos({
                                    garantiaSeleccionada: e.target.value,
                                    motivoRetencionVehiculo: '',
                                    gruaInvolucrada: '',
                                })
                            }
                            className={fieldError(datos.garantiaSeleccionada) ? selectError : selectBase}
                        >
                            <option value="">Selecciona garantía</option>
                            <option value="TRJ_CIRCULACION">Tarjeta de circulación</option>
                            <option value="PLACA">Placa</option>
                            <option value="LICENCIA">Licencia</option>
                            <option value="VEHICULO">Vehículo</option>
                        </select>
                    </SelectWrapper>
                    <p className="absolute bottom-0 left-0 text-xs text-red-500">
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
                                    disabled={loading}
                                    value={datos.motivoRetencionVehiculo}
                                    onChange={(e) =>
                                        actualizarDatos({
                                            motivoRetencionVehiculo: e.target.value,
                                            gruaInvolucrada: '',
                                        })
                                    }
                                    className={fieldError(datos.motivoRetencionVehiculo) ? selectError : selectBase}
                                >
                                    <option value="">Selecciona motivo</option>
                                    <option value="DELITO">Delito</option>
                                    <option value="ACCIDENTE">Accidente</option>
                                    <option value="INFRACCION">Infracción</option>
                                </select>
                            </SelectWrapper>
                            <p className="absolute bottom-0 left-0 text-xs text-red-500">
                                {fieldError(datos.motivoRetencionVehiculo)
                                    ? 'Selecciona el motivo de retención'
                                    : ''}
                            </p>
                        </div>

                        {/* Grúa Asignada */}
                        {datos.motivoRetencionVehiculo && (
                            <div className="relative pb-5">
                                <FieldLabel required>Grúa asignada</FieldLabel>
                                <SelectWrapper>
                                    <select
                                        name="grua"
                                        disabled={loading}
                                        value={datos.gruaInvolucrada}
                                        onChange={(e) =>
                                            actualizarDatos({
                                                gruaInvolucrada: e.target.value,
                                            })
                                        }
                                        className={fieldError(datos.gruaInvolucrada) ? selectError : selectBase}
                                    >
                                        <option value="">Selecciona grúa</option>
                                        <option value="MW">MW</option>
                                        <option value="MEJIA">MEJIA</option>
                                    </select>
                                </SelectWrapper>
                                <p className="absolute bottom-0 left-0 text-xs text-red-500">
                                    {fieldError(datos.gruaInvolucrada)
                                        ? 'Selecciona la grúa asignada'
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
                    <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                        <svg
                            className="w-3.5 h-3.5 text-amber-600"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                            />
                        </svg>
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