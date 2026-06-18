'use client';

import { useEffect, useRef, useState } from 'react';

import { useInfraccionStore } from '@/stores/useInfraccionStore';

import { Card } from '../ui/Card';
import { CardTitle } from '../ui/CardTitle';
import { SegmentedControl } from '../ui/SegmentedControl';
import {
    Upload,
    FileText,
    CreditCard,
    IdCard,
    X,
    CheckCircle2,
    Percent,
    Calendar,
    Clock,
    UserCheck,
    UserX,
    BadgeCheck,
    Ban,
} from 'lucide-react';

interface Props {
    loading: boolean;
    boolError: (value: boolean | null) => boolean;
}

type ArchivoField =
    | 'archivoINE'
    | 'archivoTarjetaCirculacion'
    | 'archivoInapam';

export default function PasoDecuentos({ loading, boolError }: Props) {
    const datos = useInfraccionStore((s) => s.datos);
    const actualizarDatos = useInfraccionStore((s) => s.actualizarDatos);

    const ineRef = useRef<HTMLInputElement>(null);
    const tarjetaRef = useRef<HTMLInputElement>(null);
    const inapamRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + 10);

        if (
            datos.esCiudadanoAdultoMayor === true &&
            datos.presentaInapam === true
        ) {
            actualizarDatos({
                descuentoAplicado: 70,
                fechaLimiteDescuento: fechaLimite.toISOString(),
            });
            return;
        }

        actualizarDatos({
            descuentoAplicado: 50,
            fechaLimiteDescuento: fechaLimite.toISOString(),
        });
    }, [datos.esCiudadanoAdultoMayor, datos.presentaInapam, actualizarDatos]);

    function handleFileChange(field: ArchivoField, ref: React.RefObject<HTMLInputElement | null>) {
        const file = ref.current?.files?.[0] || null;
        actualizarDatos({ [field]: file });
    }

    function handleRemoveFile(field: ArchivoField, ref: React.RefObject<HTMLInputElement | null>) {
        actualizarDatos({ [field]: null });
        if (ref.current) ref.current.value = '';
    }

    return (
        <div className="space-y-5">
            <Card>
                <CardTitle>¿El ciudadano es adulto mayor?</CardTitle>
                <SegmentedControl
                    options={[
                        { value: 'true', label: 'Sí, es adulto mayor', icon: UserCheck },
                        { value: 'false', label: 'No, no es adulto mayor', icon: UserX },
                    ]}
                    value={datos.esCiudadanoAdultoMayor === null ? null : String(datos.esCiudadanoAdultoMayor)}
                    onChange={(val) => {
                        if (val === 'true') {
                            actualizarDatos({ esCiudadanoAdultoMayor: true });
                        } else {
                            actualizarDatos({
                                esCiudadanoAdultoMayor: false,
                                presentaInapam: false,
                            });
                        }
                    }}
                    disabled={loading}
                    error={boolError(datos.esCiudadanoAdultoMayor)}
                />
                {datos.esCiudadanoAdultoMayor !== null && (
                    <p className={`text-xs mt-3 pl-0.5 ${datos.esCiudadanoAdultoMayor ? 'text-green-600' : 'text-slate-500'}`}>
                        {datos.esCiudadanoAdultoMayor
                            ? 'El ciudadano aplica para validación INAPAM y descuento del 70%'
                            : 'Se aplicará descuento regular del 50%'
                        }
                    </p>
                )}
                {boolError(datos.esCiudadanoAdultoMayor) && (
                    <p className="text-xs text-red-500 mt-2">
                        Indica si el ciudadano es adulto mayor
                    </p>
                )}
            </Card>

            {datos.esCiudadanoAdultoMayor && (
                <Card>
                    <CardTitle>¿Presenta credencial INAPAM?</CardTitle>
                    <SegmentedControl
                        options={[
                            { value: 'true', label: 'Sí presenta', icon: BadgeCheck },
                            { value: 'false', label: 'No presenta', icon: Ban },
                        ]}
                        value={datos.presentaInapam === null ? null : String(datos.presentaInapam)}
                        onChange={(val) =>
                            actualizarDatos({ presentaInapam: val === 'true' })
                        }
                        disabled={loading}
                        error={boolError(datos.presentaInapam)}
                    />
                    {datos.presentaInapam !== null && (
                        <p className={`text-xs mt-3 pl-0.5 ${datos.presentaInapam ? 'text-green-600' : 'text-slate-500'}`}>
                            {datos.presentaInapam
                                ? 'Se solicitarán fotografías del INE y de la credencial INAPAM'
                                : 'Solo se solicitará fotografía del INE como identificación'
                            }
                        </p>
                    )}
                    {boolError(datos.presentaInapam) && (
                        <p className="text-xs text-red-500 mt-2">
                            Indica si el ciudadano presenta credencial INAPAM
                        </p>
                    )}
                </Card>
            )}

            {datos.esCiudadanoAdultoMayor !== null && (
                <Card>
                    <CardTitle>Documentación requerida</CardTitle>
                    <div className="space-y-4">
                        <FileUploadZone
                            icon={<IdCard size={20} />}
                            label="Fotografía del INE"
                            description="Sube una foto clara de tu credencial INE (ambos lados)"
                            accept="image/*,application/pdf"
                            disabled={loading}
                            file={datos.archivoINE}
                            inputRef={ineRef}
                            onChange={() => handleFileChange('archivoINE', ineRef)}
                            onRemove={() => handleRemoveFile('archivoINE', ineRef)}
                        />

                        <FileUploadZone
                            icon={<CreditCard size={20} />}
                            label="Tarjeta de Circulación"
                            description="Sube una foto de la tarjeta de circulación del vehículo"
                            accept="image/*,application/pdf"
                            disabled={loading}
                            file={datos.archivoTarjetaCirculacion}
                            inputRef={tarjetaRef}
                            onChange={() => handleFileChange('archivoTarjetaCirculacion', tarjetaRef)}
                            onRemove={() => handleRemoveFile('archivoTarjetaCirculacion', tarjetaRef)}
                        />

                        {datos.esCiudadanoAdultoMayor === true &&
                            datos.presentaInapam === true && (
                                <FileUploadZone
                                    icon={<FileText size={20} />}
                                    label="Credencial INAPAM"
                                    description="Sube una foto de tu credencial INAPAM vigente"
                                    accept="image/*,application/pdf"
                                    disabled={loading}
                                    file={datos.archivoInapam}
                                    inputRef={inapamRef}
                                    onChange={() => handleFileChange('archivoInapam', inapamRef)}
                                    onRemove={() => handleRemoveFile('archivoInapam', inapamRef)}
                                />
                            )}
                    </div>
                </Card>
            )}

            <Card>
                <CardTitle>Descuento a aplicar</CardTitle>
                <div className="flex items-start gap-4">

                    <div className="flex-1 min-w-0">

                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-bold text-slate-900">
                                {datos.descuentoAplicado}%
                            </span>
                            <span className="text-sm text-slate-500 font-medium">
                                de descuento
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={15} />
                        <span>Fecha límite:</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                        {datos.fechaLimiteDescuento
                            ? new Date(
                                datos.fechaLimiteDescuento
                            ).toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })
                            : '--'}
                    </span>
                    <div className="flex items-center gap-1.5 ml-auto text-xs text-slate-500">
                        <Clock size={13} />
                        <span>10 días para pago con descuento</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}

// ========================
// FILE UPLOAD ZONE
// ========================
function FileUploadZone({
    icon,
    label,
    description,
    accept,
    disabled,
    file,
    inputRef,
    onChange,
    onRemove,
}: {
    icon: React.ReactNode;
    label: string;
    description: string;
    accept: string;
    disabled: boolean;
    file: File | null;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: () => void;
    onRemove: () => void;
}) {
    const [isDragOver, setIsDragOver] = useState(false);

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragOver(false);
        const dt = e.dataTransfer;
        const droppedFile = dt.files?.[0];
        if (droppedFile && inputRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(droppedFile);
            inputRef.current.files = dataTransfer.files;
            onChange();
        }
    }

    return (
        <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!disabled && !file) inputRef.current?.click();
                }
            }}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => {
                if (!disabled && !file) inputRef.current?.click();
            }}
            className={`
                relative rounded-xl border-2 p-5 transition-all duration-200
                ${isDragOver
                    ? 'border-blue-600 bg-blue-50'
                    : file
                        ? 'border-green-500 bg-green-50'
                        : 'border-dashed border-slate-200 bg-white hover:border-blue-600 hover:bg-slate-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                capture="environment"
                disabled={disabled}
                onChange={onChange}
                className="hidden"
            />

            {file ? (
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-500">
                            <CheckCircle2 size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                                {file.name}
                            </p>
                            <p className="text-xs text-slate-500">
                                {(file.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Eliminar archivo"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                            {label}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {description}
                        </p>
                    </div>
                    <div className="shrink-0 p-2 rounded-lg bg-blue-50 text-blue-600">
                        <Upload size={18} />
                    </div>
                </div>
            )}
        </div>
    );
}