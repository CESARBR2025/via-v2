'use client'
import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { CardTitle } from '../ui/CardTitle';
import { Card } from '../ui/Card';
import { CustomSelect } from '../ui/CustomSelect';
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
                    <CustomSelect
                        name="garantia"
                        disabled={loading}
                        value={datos.garantiaSeleccionada}
                        onChange={(value) =>
                            actualizarDatos({
                                garantiaSeleccionada: String(value),
                                motivoRetencionVehiculo: '',
                                gruaInvolucrada: '',
                            })
                        }
                        error={fieldError(datos.garantiaSeleccionada)}
                        placeholder="Selecciona garantía"
                        options={[
                            { value: 'TRJ_CIRCULACION', label: 'Tarjeta de circulación' },
                            { value: 'PLACA', label: 'Placa' },
                            { value: 'LICENCIA', label: 'Licencia' },
                            { value: 'VEHICULO', label: 'Vehículo' },
                        ]}
                    />
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
                            <CustomSelect
                                name="motivoRetencionVehiculo"
                                disabled={loading}
                                value={datos.motivoRetencionVehiculo}
                                onChange={(value) =>
                                    actualizarDatos({
                                        motivoRetencionVehiculo: String(value),
                                        gruaInvolucrada: '',
                                    })
                                }
                                error={fieldError(datos.motivoRetencionVehiculo)}
                                placeholder="Selecciona motivo"
                                options={[
                                    { value: 'DELITO', label: 'Delito' },
                                    { value: 'ACCIDENTE', label: 'Accidente' },
                                    { value: 'INFRACCION', label: 'Infracción' },
                                ]}
                            />
                            <p className="absolute bottom-0 left-0 text-xs text-red-500">
                                {fieldError(datos.motivoRetencionVehiculo)
                                    ? 'Selecciona el motivo de retención'
                                    : ''}
                            </p>
                        </div>

                        {datos.motivoRetencionVehiculo && (
                            <div className="relative pb-5">
                                <FieldLabel required>Grúa asignada</FieldLabel>

                                <CustomSelect
                                    name="grua"
                                    disabled={loading}
                                    value={datos.gruaInvolucrada}
                                    onChange={(value) =>
                                        actualizarDatos({
                                            gruaInvolucrada: String(value),
                                        })
                                    }
                                    error={fieldError(datos.gruaInvolucrada)}
                                    placeholder="Selecciona grúa"
                                    options={gruas.map((g) => ({
                                        value: g.id,
                                        label: g.nombre,
                                    }))}
                                />

                                <p className="absolute bottom-0 left-0 text-xs text-red-500">
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
                                <CustomSelect
                                    name="dependenciaRemisora"
                                    disabled={loading}
                                    value={datos.dependenciaRemisora}
                                    onChange={(value) =>
                                        actualizarDatos({
                                            dependenciaRemisora: String(value),
                                        })
                                    }
                                    error={fieldError(datos.dependenciaRemisora)}
                                    placeholder="Selecciona dependencia"
                                    options={[
                                        { value: 'FISCALIA', label: 'FISCALIA' },
                                        { value: 'JUZGADO', label: 'JUZGADO CIVICO' },
                                    ]}
                                />
                                <p className="absolute bottom-0 left-0 text-xs text-red-500">
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