'use client';

import { useEffect, useRef, useState } from 'react';

import { useInfraccionStore } from '@/stores/useInfraccionStore';

import { Card } from '../ui/Card';
import { CardTitle } from '../ui/CardTitle';
import { RadioOption } from '../ui/RadioInput';
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <RadioOption
                        name="esCiudadanoAdultoMayor"
                        value="true"
                        checked={datos.esCiudadanoAdultoMayor === true}
                        onChange={() =>
                            actualizarDatos({ esCiudadanoAdultoMayor: true })
                        }
                        label="Sí es adulto mayor"
                        description="El ciudadano aplica para validación INAPAM"
                        disabled={loading}
                        error={boolError(datos.esCiudadanoAdultoMayor)}
                    />
                    <RadioOption
                        name="esCiudadanoAdultoMayor"
                        value="false"
                        checked={datos.esCiudadanoAdultoMayor === false}
                        onChange={() =>
                            actualizarDatos({
                                esCiudadanoAdultoMayor: false,
                                presentaInapam: false,
                            })
                        }
                        label="No es adulto mayor"
                        description="Se aplicará descuento regular"
                        disabled={loading}
                        error={boolError(datos.esCiudadanoAdultoMayor)}
                    />
                </div>
            </Card>

            {datos.esCiudadanoAdultoMayor && (
                <Card>
                    <CardTitle>¿Presenta credencial INAPAM?</CardTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <RadioOption
                            error={boolError(datos.presentaInapam)}
                            name="presentaInapam"
                            value="true"
                            checked={datos.presentaInapam === true}
                            onChange={() =>
                                actualizarDatos({ presentaInapam: true })
                            }
                            label="Sí presenta"
                            description="Se solicitará INE e INAPAM"
                            disabled={loading}
                        />
                        <RadioOption
                            name="presentaInapam"
                            value="false"
                            error={boolError(datos.presentaInapam)}
                            checked={datos.presentaInapam === false}
                            onChange={() =>
                                actualizarDatos({ presentaInapam: false })
                            }
                            label="No presenta"
                            description="Solo se solicitará INE"
                            disabled={loading}
                        />
                    </div>
                    {boolError(datos.presentaInapam) && (
                        <p className="text-xs text-red-500 mt-3">
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
                            <span className="text-3xl font-bold text-[#0F172A]">
                                {datos.descuentoAplicado}%
                            </span>
                            <span className="text-sm text-[#64748B] font-medium">
                                de descuento
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-[#64748B]">
                        <Calendar size={15} />
                        <span>Fecha límite:</span>
                    </div>
                    <span className="font-semibold text-[#0F172A]">
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
                    <div className="flex items-center gap-1.5 ml-auto text-xs text-[#64748B]">
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
                    ? 'border-[#2563EB] bg-[#EFF6FF]'
                    : file
                        ? 'border-[#22C55E] bg-[#F0FDF4]'
                        : 'border-dashed border-[#E2E8F0] bg-white hover:border-[#2563EB] hover:bg-[#F8FAFC]'
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
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#22C55E]">
                            <CheckCircle2 size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-[#0F172A] truncate">
                                {file.name}
                            </p>
                            <p className="text-xs text-[#64748B]">
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
                        className="shrink-0 p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#EF4444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Eliminar archivo"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#64748B]">
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0F172A]">
                            {label}
                        </p>
                        <p className="text-xs text-[#64748B] mt-0.5">
                            {description}
                        </p>
                    </div>
                    <div className="shrink-0 p-2 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                        <Upload size={18} />
                    </div>
                </div>
            )}
        </div>
    );
}