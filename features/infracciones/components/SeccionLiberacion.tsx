'use client';

import { useState, useRef, useEffect } from 'react';
import { abrirDocumento } from '@/features/expediente/helpers/abrirDocumento';
import {
    Scale,
    FileText,
    Upload,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    Building2,
    User,
    ExternalLink,
    FileUp,
    Loader2,
    X,
    Eye,
    MessageSquare,
} from 'lucide-react';
import { SegmentedControl } from './ui/SegmentedControl';

type DocConfig = {
    id: string;
    label: string;
    formKey: string;
    tipoDocumento: string;
};

type SubtipoTitular = 'infraccion' | 'delito' | 'accidente';

const DOCS_EMPRESA: DocConfig[] = [
    { id: 'factura', label: 'Factura', formKey: 'archivoFactura', tipoDocumento: 'factura' },
    { id: 'ine_representante', label: 'INE del representante legal', formKey: 'archivoIneRepresentanteLegal', tipoDocumento: 'ine_representante_legal' },
    { id: 'poder_notarial', label: 'Poder notarial o acta constitutiva', formKey: 'archivoPoderNotarial', tipoDocumento: 'poder_notarial' },
    { id: 'constancia_fiscal', label: 'Constancia de situación fiscal', formKey: 'archivoConstanciaSituacionFiscal', tipoDocumento: 'constancia_situacion_fiscal' },
];

const DOCS_INFRACCION: DocConfig[] = [
    { id: 'factura', label: 'Factura original', formKey: 'archivoFactura', tipoDocumento: 'factura' },
    { id: 'ine', label: 'INE', formKey: 'archivoIneTitular', tipoDocumento: 'ine_titular' },
    { id: 'comprobante_domicilio', label: 'Comprobante de domicilio', formKey: 'archivoComprobanteDomicilio', tipoDocumento: 'comprobante_domicilio' },
    { id: 'tarjeta_circulacion', label: 'Tarjeta de circulación', formKey: 'archivoTarjetaCirculacion', tipoDocumento: 'tarjeta_circulacion' },
];

const DOCS_DELITO: DocConfig[] = [
    { id: 'factura', label: 'Factura', formKey: 'archivoFactura', tipoDocumento: 'factura' },
    { id: 'ine', label: 'INE', formKey: 'archivoIneTitular', tipoDocumento: 'ine_titular' },
];

const DOCS_ACCIDENTE: DocConfig[] = [
    { id: 'factura', label: 'Factura', formKey: 'archivoFactura', tipoDocumento: 'factura' },
    { id: 'ine', label: 'INE', formKey: 'archivoIneTitular', tipoDocumento: 'ine_titular' },
];

const SUBTIPOS_TITULAR: Record<SubtipoTitular, { label: string; docs: DocConfig[] }> = {
    infraccion: { label: 'Infracción', docs: DOCS_INFRACCION },
    delito: { label: 'Delito', docs: DOCS_DELITO },
    accidente: { label: 'Accidente', docs: DOCS_ACCIDENTE },
};

const MOTIVO_TO_SUBTIPO: Record<string, SubtipoTitular> = {
    INFRACCION: 'infraccion',
    DELITO: 'delito',
    ACCIDENTE: 'accidente',
    VEHICULO: 'infraccion',
};

type Props = {
    dependenciaReceptora: string;
    noOficio: string;
    urlOficio: string;
    estatusDependencia: string;
    estatusInfraccion: string
    nombreTitular: string;
    correoTitular: string;
    curpTitular: string;
    noCarpetaInvestigacion?: string;
    motivoRetencion: string | null;
    infraccionId: string;
    documentosLiberacion: Record<string, { url: string; label: string }>;
    esTitular: boolean | null;
};

function getEstatusConfig(estatus: string) {
    const s = (estatus || '').toLowerCase();

    if (s === 'espera_revision') {
        return {
            icon: Clock,
            bgClass: 'bg-amber-50',
            borderClass: 'border-amber-500/30',
            textClass: 'text-amber-600',
            label: 'En espera de revisión',
        };
    }

    if (s === 'liberado' || s === 'completado' || s === 'aprobado') {
        return {
            icon: CheckCircle2,
            bgClass: 'bg-green-50',
            borderClass: 'border-green-500/30',
            textClass: 'text-green-700',
            label: estatus,
        };
    }
    if (s === 'pendiente' || s === 'en_proceso' || s === 'en proceso') {
        return {
            icon: Clock,
            bgClass: 'bg-amber-50',
            borderClass: 'border-amber-500/30',
            textClass: 'text-amber-600',
            label: estatus,
        };
    }
    if (s === 'rechazado' || s === 'cancelado' || s === 'mesa_de_control_rechazada') {
        return {
            icon: XCircle,
            bgClass: 'bg-red-50',
            borderClass: 'border-red-500/30',
            textClass: 'text-red-700',
            label: 'Documentos rechazados',
        };
    }
    return {
        icon: AlertCircle,
        bgClass: 'bg-slate-100',
        borderClass: 'border-slate-200',
        textClass: 'text-slate-500',
        label: estatus || 'Sin gestión',
    };
}

export default function SeccionLiberacion({
    dependenciaReceptora,
    noOficio,
    urlOficio,
    estatusDependencia,
    estatusInfraccion,
    nombreTitular,
    correoTitular,
    curpTitular,
    noCarpetaInvestigacion,
    motivoRetencion,
    infraccionId,
    documentosLiberacion,
    esTitular,
}: Props) {

    const [selectedType, setSelectedType] = useState<'empresa' | 'titular' | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nombreEmpresa, setNombreEmpresa] = useState('');
    const [rfcEmpresa, setRfcEmpresa] = useState('');
    const [nombreRespFiscal, setNombreRespFiscal] = useState('');
    const [apPaternoRespFiscal, setApPaternoRespFiscal] = useState('');
    const [apMaternoRespFiscal, setApMaternoRespFiscal] = useState('');
    const [titularNombre, setTitularNombre] = useState('');
    const [titularAppaterno, setTitularAppaterno] = useState('');
    const [titularApmaterno, setTitularApmaterno] = useState('');
    const [titularCurp, setTitularCurp] = useState('');
    const [titularCorreo, setTitularCorreo] = useState('');
    const [revisionStatuses, setRevisionStatuses] = useState<Record<string, { estatus: string | null; observaciones: string | null }>>({});
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [reuploadFiles, setReuploadFiles] = useState<Record<string, File>>({});
    const [reuploading, setReuploading] = useState(false);

    const tieneDocs = documentosLiberacion && Object.keys(documentosLiberacion).length > 0;

    useEffect(() => {
        if (!tieneDocs || !infraccionId) return;
        setLoadingStatus(true);
        fetch(`/api/liberaciones/documentos/${infraccionId}`)
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                if (data?.documentos) {
                    const map: Record<string, { estatus: string | null; observaciones: string | null }> = {};
                    data.documentos.forEach((d: any) => {
                        map[d.tipo] = { estatus: d.estatusRevision, observaciones: d.observaciones };
                    });
                    setRevisionStatuses(map);
                }
            })
            .catch(() => { })
            .finally(() => setLoadingStatus(false));
    }, [tieneDocs, infraccionId]);

    const estatusConfig = getEstatusConfig(estatusDependencia);

    const motivoSubtipo = motivoRetencion ? MOTIVO_TO_SUBTIPO[motivoRetencion] : undefined;

    const CARTA_PODER: DocConfig = { id: 'carta_poder', label: 'Carta poder', formKey: 'archivoCartaPoder', tipoDocumento: 'carta_poder' };

    const currentDocs: DocConfig[] = (() => {
        if (selectedType === 'empresa') return DOCS_EMPRESA;
        if (selectedType === 'titular' && motivoSubtipo) {
            const docs = [...SUBTIPOS_TITULAR[motivoSubtipo].docs];
            if (esTitular === false) {
                docs.push(CARTA_PODER);
            }
            return docs;
        }
        return [];
    })();

    const subtipoLabel = motivoSubtipo
        ? SUBTIPOS_TITULAR[motivoSubtipo].label
        : null;

    const allSelected = currentDocs.length > 0 && currentDocs.every(d => selectedFiles[d.id]);

    const oficioDisponible = urlOficio && urlOficio.trim() !== '';

    const handleFileSelect = (docId: string, file: File | null) => {
        setError(null);
        setSelectedFiles(prev => {
            const next = { ...prev };
            if (file) {
                next[docId] = file;
            } else {
                delete next[docId];
            }
            return next;
        });
    };

    const handleSubmit = async () => {
        if (!allSelected) return;
        if (selectedType === 'empresa' && !nombreEmpresa.trim()) {
            setError('El nombre de la empresa es requerido');
            return;
        }
        if (selectedType === 'empresa' && !rfcEmpresa.trim()) {
            setError('El RFC de la empresa es requerido');
            return;
        }
        if (selectedType === 'empresa' && !nombreRespFiscal.trim()) {
            setError('El nombre del representante fiscal es requerido');
            return;
        }
        if (selectedType === 'empresa' && !apPaternoRespFiscal.trim()) {
            setError('El apellido paterno del representante fiscal es requerido');
            return;
        }

        if (selectedType === 'titular' && esTitular === false) {
            if (!titularNombre.trim()) {
                setError('El nombre del titular es requerido');
                return;
            }
            if (!titularAppaterno.trim()) {
                setError('El apellido paterno del titular es requerido');
                return;
            }
            if (!titularCurp.trim()) {
                setError('La CURP del titular es requerida');
                return;
            }
        }

        setSubmitting(true);
        setError(null);

        try {
            // 1. Crear solicitud (solo metadata, sin archivos)
            const solicitudRes = await fetch('/api/ciudadano/iniciar-solicitud', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    infraccionId,
                    tipoLiberacion: motivoRetencion || 'INFRACCION',
                    esEmpresa: selectedType === 'empresa',
                    ...(selectedType === 'empresa' ? {
                        nombreEmpresa: nombreEmpresa.trim(),
                        rfcEmpresa: rfcEmpresa.trim(),
                        nombreRespFiscal: nombreRespFiscal.trim(),
                        appaternoRespFiscal: apPaternoRespFiscal.trim(),
                        apmaternoRespFiscal: apMaternoRespFiscal.trim(),
                    } : {}),
                }),
            });

            const solicitudData = await solicitudRes.json();
            if (!solicitudRes.ok) throw new Error(solicitudData.message);
            const { solicitudId } = solicitudData;

            // 2. Subir cada archivo uno por uno
            for (const doc of currentDocs) {
                const file = selectedFiles[doc.id];
                if (!file) continue;

                const fileForm = new FormData();
                fileForm.append('solicitudId', solicitudId);
                fileForm.append('tipoDocumento', doc.tipoDocumento);
                fileForm.append('file', file);

                const fileRes = await fetch('/api/ciudadano/subir-archivo', {
                    method: 'POST',
                    body: fileForm,
                });

                const fileData = await fileRes.json();
                if (!fileRes.ok) {
                    throw new Error(`Error al subir ${doc.label}: ${fileData.message}`);
                }
            }

            // 3. Completar solicitud (actualizar estatus de infracción)
            const completarBody: Record<string, unknown> = {
                infraccionId,
                estatusDependencia:
                    estatusInfraccion === 'REGISTRADA' && estatusDependencia === 'MESA_DE_CONTROL_PENDIENTE_DOCS'
                        ? 'MESA_DE_CONTROL_REVISION'
                        : 'ESPERA_REVISION',
            };

            if (estatusInfraccion === 'REGISTRADA') {
                completarBody.estatus = 'REGISTRADA';
            }

            if (selectedType === 'titular' && esTitular === false) {
                completarBody.nombreTitular = titularNombre.trim();
                completarBody.appaternoTitular = titularAppaterno.trim();
                completarBody.apmaternoTitular = titularApmaterno.trim() || undefined;
                completarBody.curpTitular = titularCurp.trim();
                completarBody.correoTitular = titularCorreo.trim() || undefined;
            }

            const finalRes = await fetch('/api/ciudadano/completar-solicitud', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(completarBody),
            });

            const finalData = await finalRes.json();
            if (!finalRes.ok) throw new Error(finalData.message);

            setSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al subir documentos');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReupload = async () => {
        const docsAReenviar = Object.keys(reuploadFiles);
        if (docsAReenviar.length === 0) return;

        setReuploading(true);
        setError(null);

        try {
            // Obtener solicitudId
            const libRes = await fetch(`/api/liberaciones/documentos/${infraccionId}`);
            const libData = await libRes.json();
            const solicitudId = libData?.solicitud?.id;
            if (!solicitudId) throw new Error('No se encontró solicitud de liberación');

            // Subir cada archivo uno por uno
            for (const tipo of docsAReenviar) {
                const fileForm = new FormData();
                fileForm.append('solicitudId', solicitudId);
                fileForm.append('tipoDocumento', tipo);
                fileForm.append('file', reuploadFiles[tipo]);

                const res = await fetch('/api/ciudadano/subir-archivo', {
                    method: 'POST',
                    body: fileForm,
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(`Error al subir ${tipo}: ${data.message}`);
                }
            }

            // Finalizar: actualizar estatus de infracción
            const finalRes = await fetch('/api/ciudadano/completar-solicitud', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    infraccionId,
                    estatus: 'REGISTRADA',
                    estatusDependencia: 'MESA_DE_CONTROL_REVISION',
                }),
            });

            const finalData = await finalRes.json();
            if (!finalRes.ok) throw new Error(finalData.message);

            setReuploadFiles({});
            // Refrescar estatus
            const r = await fetch(`/api/liberaciones/documentos/${infraccionId}`);
            if (r.ok) {
                const d = await r.json();
                if (d?.documentos) {
                    const map: Record<string, { estatus: string | null; observaciones: string | null }> = {};
                    d.documentos.forEach((doc: any) => {
                        map[doc.tipo] = { estatus: doc.estatusRevision, observaciones: doc.observaciones };
                    });
                    setRevisionStatuses(map);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al reenviar documentos');
        } finally {
            setReuploading(false);
        }
    };

    return (
        <section className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <div className="px-6 py-[18px] border-b border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Scale size={18} className="text-blue-600" strokeWidth={1.5} />
                </div>
                <div>
                    <h3 className="text-[15px] font-medium text-slate-900">
                        Liberación
                    </h3>
                    <p className="text-xs text-slate-500">
                        Estatus de gestión
                    </p>
                </div>
            </div>

            <div className="p-6 space-y-5">

                {/* STATUS BADGE */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium shrink-0 ${estatusConfig.bgClass} ${estatusConfig.borderClass} ${estatusConfig.textClass}`}
                    >
                        <estatusConfig.icon size={16} strokeWidth={1.5} />
                        {estatusConfig.label}

                    </div>
                </div>

                {/* DATOS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoItem2 label="Dependencia receptora" value={dependenciaReceptora} />
                    <InfoItem2 label="No. de oficio" value={noOficio} />
                    {noCarpetaInvestigacion && (
                        <InfoItem2 label="No. carpeta de investigación" value={noCarpetaInvestigacion} />
                    )}
                    {nombreTitular && (
                        <InfoItem2 label="Nombre del titular" value={nombreTitular} />
                    )}
                    {correoTitular && (
                        <InfoItem2 label="Correo del titular" value={correoTitular} />
                    )}
                    {curpTitular && (
                        <InfoItem2 label="CURP del titular" value={curpTitular} />
                    )}
                </div>

                {/* OFICIO DISPONIBLE */}
                {oficioDisponible && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-blue-600" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900">
                                Oficio de liberación disponible
                            </p>

                        </div>
                        <button
                            onClick={() => abrirDocumento(urlOficio)}
                            className="shrink-0 w-9 h-9 rounded-lg hover:bg-blue-100 flex items-center justify-center transition"
                        >
                            <ExternalLink size={16} className="text-blue-600" strokeWidth={1.5} />
                        </button>
                    </div>
                )}

                {/* SEPARADOR */}
                {!tieneDocs && !submitted && estatusDependencia !== 'ESPERA_REVISION' && <div className="h-px bg-slate-200" />}

                {/* FORMULARIO (solo si no hay docs) */}
                {!tieneDocs && !submitted && estatusDependencia !== 'ESPERA_REVISION' && (
                    <>
                        {/* SELECCIÓN TIPO */}
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-900">
                                Emitir orden de liberación para:
                            </p>
                            <SegmentedControl
                                options={[
                                    { value: 'empresa', label: 'Empresa', icon: Building2 },
                                    { value: 'titular', label: 'Titular', icon: User },
                                ]}
                                value={selectedType}
                                onChange={(val) => {
                                    setSelectedType(val as 'empresa' | 'titular');
                                    setSelectedFiles({});
                                    setTitularNombre('');
                                    setTitularAppaterno('');
                                    setTitularApmaterno('');
                                    setTitularCurp('');
                                    setTitularCorreo('');
                                    setError(null);
                                }}
                            />
                        </div>

                        {/* TIPO LIBERACIÓN (auto desde DB) */}
                        {selectedType === 'titular' && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                    <FileText size={16} className="text-blue-600" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Tipo de liberación</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {subtipoLabel || 'No determinado'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* DATOS DEL TITULAR (cuando no es el mismo infractor) */}
                        {selectedType === 'titular' && esTitular === false && (
                            <div className="space-y-4">
                                <div className="border-t border-slate-200 pt-4">
                                    <p className="text-sm font-medium text-slate-900 mb-3">
                                        Datos del titular
                                    </p>
                                    <p className="text-xs text-slate-500 mb-4">
                                        El infractor no es el titular del vehículo. Capture los datos del propietario.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                                Nombre(s) <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={titularNombre}
                                                onChange={e => setTitularNombre(e.target.value)}
                                                placeholder="Nombre(s)"
                                                className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                                A. Paterno <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={titularAppaterno}
                                                onChange={e => setTitularAppaterno(e.target.value)}
                                                placeholder="Apellido paterno"
                                                className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                                A. Materno
                                            </label>
                                            <input
                                                type="text"
                                                value={titularApmaterno}
                                                onChange={e => setTitularApmaterno(e.target.value)}
                                                placeholder="Apellido materno"
                                                className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                            CURP <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={titularCurp}
                                            onChange={e => setTitularCurp(e.target.value)}
                                            placeholder="CURP del titular"
                                            maxLength={18}
                                            className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition"
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                            Correo electrónico
                                        </label>
                                        <input
                                            type="email"
                                            value={titularCorreo}
                                            onChange={e => setTitularCorreo(e.target.value)}
                                            placeholder="correo@ejemplo.com"
                                            className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* DATOS EMPRESA */}
                        {selectedType === 'empresa' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                            Nombre de la empresa <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={nombreEmpresa}
                                            onChange={e => setNombreEmpresa(e.target.value)}
                                            placeholder="Razón social"
                                            className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                            RFC <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={rfcEmpresa}
                                            onChange={e => setRfcEmpresa(e.target.value)}
                                            placeholder="RFC de la empresa"
                                            className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 pt-4">
                                    <p className="text-sm font-medium text-slate-900 mb-3">
                                        Representante fiscal
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                                Nombre(s) <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={nombreRespFiscal}
                                                onChange={e => setNombreRespFiscal(e.target.value)}
                                                placeholder="Nombre(s)"
                                                className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                                A. Paterno <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={apPaternoRespFiscal}
                                                onChange={e => setApPaternoRespFiscal(e.target.value)}
                                                placeholder="Apellido paterno"
                                                className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                                A. Materno
                                            </label>
                                            <input
                                                type="text"
                                                value={apMaternoRespFiscal}
                                                onChange={e => setApMaternoRespFiscal(e.target.value)}
                                                placeholder="Apellido materno"
                                                className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* DOCUMENTOS */}
                        {currentDocs.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-slate-900">
                                    Documentos requeridos
                                </p>
                                <div className="space-y-2">
                                    {currentDocs.map(doc => (
                                        <DocUploadRow
                                            key={doc.id}
                                            doc={doc}
                                            file={selectedFiles[doc.id] || null}
                                            onSelect={(file) => handleFileSelect(doc.id, file)}
                                            onRemove={() => handleFileSelect(doc.id, null)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ERROR */}
                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2">
                                <AlertCircle size={14} className="text-red-600 shrink-0" strokeWidth={1.5} />
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* SUBMIT */}
                        {currentDocs.length > 0 && (
                            <button
                                onClick={handleSubmit}
                                disabled={!allSelected || submitting}
                                className="
                                    w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700
                                    disabled:bg-blue-300 disabled:opacity-60
                                    text-white text-sm font-medium
                                    flex items-center justify-center gap-2
                                    transition active:scale-[0.99]
                                "
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Subiendo documentos...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} strokeWidth={1.5} />
                                        Subir documentos
                                    </>
                                )}
                            </button>
                        )}
                    </>
                )}

                {/* DOCUMENTOS SUBIDOS */}
                {(tieneDocs || submitted || estatusDependencia === 'ESPERA_REVISION' || estatusDependencia === 'MESA_DE_CONTROL_RECHAZADA') && (
                    <div className="space-y-4">
                        {estatusDependencia === 'ESPERA_REVISION' && (
                            <div className="rounded-xl border border-green-500/30 bg-green-50 p-6 text-center space-y-3">
                                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={32} className="text-green-600" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-medium text-slate-900">
                                        En espera de revisión
                                    </h4>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Todos los documentos fueron subidos correctamente.
                                        La autoridad revisará la información y emitirá la
                                        orden de liberación.
                                    </p>
                                </div>
                            </div>
                        )}

                        {estatusDependencia === 'MESA_DE_CONTROL_RECHAZADA' && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
                                <div className="w-16 h-16 rounded-full bg-red-50/10 border border-red-200 flex items-center justify-center mx-auto">
                                    <XCircle size={32} className="text-red-600" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-medium text-slate-900">
                                        Documentos rechazados
                                    </h4>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Algunos documentos fueron rechazados. Revisa el motivo
                                        y vuelve a subir los documentos corregidos.
                                    </p>
                                </div>
                            </div>
                        )}

                        {tieneDocs && (
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                    <FileText size={15} className="text-blue-600" strokeWidth={1.5} />
                                    Documentos subidos
                                    {loadingStatus && <Loader2 size={12} className="animate-spin text-slate-400" />}
                                </p>
                                <div className="space-y-3">
                                    {Object.entries(documentosLiberacion).map(([key, doc]) => {
                                        const status = revisionStatuses[key];
                                        const estatus = status?.estatus;
                                        const obs = status?.observaciones;
                                        const rechazado = estatus === 'RECHAZADO';
                                        const aceptado = estatus === 'ACEPTADO';
                                        const pendiente = !estatus;
                                        const tieneReupload = !!reuploadFiles[key];

                                        return (
                                            <div key={key} className="space-y-2">
                                                <div
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                                                        aceptado
                                                            ? 'border-green-200 bg-green-50'
                                                            : rechazado
                                                                ? 'border-red-200 bg-red-50'
                                                                : 'border-slate-200 bg-slate-50'
                                                    }`}
                                                >
                                                    <div
                                                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                                            aceptado ? 'bg-green-100' : rechazado ? 'bg-red-100' : 'bg-blue-50'
                                                        }`}
                                                    >
                                                        {aceptado ? (
                                                            <CheckCircle2 size={15} className="text-green-600" strokeWidth={1.5} />
                                                        ) : rechazado ? (
                                                            <XCircle size={15} className="text-red-600" strokeWidth={1.5} />
                                                        ) : (
                                                            <FileText size={15} className="text-blue-600" strokeWidth={1.5} />
                                                        )}
                                                    </div>

                                                    <span className="text-sm font-medium text-slate-900 flex-1 min-w-0">
                                                        {doc.label}
                                                    </span>

                                                    {aceptado && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium shrink-0 bg-green-100 text-green-600">
                                                            <CheckCircle2 size={10} strokeWidth={1.5} />
                                                            Aceptado
                                                        </span>
                                                    )}

                                                    {rechazado && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium shrink-0 bg-red-100 text-red-600">
                                                            <XCircle size={10} strokeWidth={1.5} />
                                                            Rechazado
                                                        </span>
                                                    )}

                                                    {pendiente && !loadingStatus && (
                                                        <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                                                            Pendiente
                                                        </span>
                                                    )}

                                                    <button
                                                        onClick={() => abrirDocumento(doc.url)}
                                                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition active:scale-[0.99]"
                                                    >
                                                        <Eye size={12} strokeWidth={1.5} />
                                                        Ver
                                                    </button>
                                                </div>

                                                {/* RECHAZO: comentario + re-upload */}
                                                {rechazado && obs && (
                                                    <div className="ml-12 flex items-start gap-2 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200">
                                                        <MessageSquare size={13} className="text-amber-600 mt-0.5 shrink-0" strokeWidth={1.5} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[11px] font-medium text-amber-600 mb-0.5">
                                                                Motivo del rechazo
                                                            </p>
                                                            <p className="text-[12px] text-amber-800 italic">
                                                                &ldquo;{obs}&rdquo;
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* RE-UPLOAD solo si rechazado */}
                                                {rechazado && (
                                                    <div className="ml-12 flex items-center gap-3">
                                                        <label className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed bg-white cursor-pointer hover:bg-rose-50 transition ${
                                                            tieneReupload ? 'border-green-500' : 'border-red-300'
                                                        }`}>
                                                            <input
                                                                type="file"
                                                                accept="image/*,application/pdf"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    const f = e.target.files?.[0];
                                                                    if (f) {
                                                                        setReuploadFiles((p) => ({ ...p, [key]: f }));
                                                                    }
                                                                    e.target.value = '';
                                                                }}
                                                            />
                                                            {tieneReupload ? (
                                                                <>
                                                                    <CheckCircle2 size={14} className="text-green-600" strokeWidth={1.5} />
                                                                    <span className="text-[12px] font-medium text-green-600 truncate">
                                                                        {reuploadFiles[key].name}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload size={14} className="text-red-600" strokeWidth={1.5} />
                                                                    <span className="text-[12px] text-slate-500">
                                                                        Seleccionar nuevo archivo
                                                                    </span>
                                                                </>
                                                            )}
                                                        </label>
                                                        {tieneReupload && (
                                                            <button
                                                                onClick={() => setReuploadFiles((p) => {
                                                                    const n = { ...p };
                                                                    delete n[key];
                                                                    return n;
                                                                })}
                                                                className="shrink-0 px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] text-slate-500 transition"
                                                            >
                                                                <X size={13} strokeWidth={1.5} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* BOTÓN RE-ENVIAR */}
                                {Object.keys(reuploadFiles).length > 0 && (
                                    <button
                                        onClick={handleReupload}
                                        disabled={reuploading}
                                        className="w-full h-11 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-medium flex items-center justify-center gap-2 transition active:scale-[0.99]"
                                    >
                                        {reuploading ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Reenviando...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={16} strokeWidth={1.5} />
                                                Reenviar {Object.keys(reuploadFiles).length} documento(s) a revisión
                                            </>
                                        )}
                                    </button>
                                )}

                                {/* ERROR */}
                                {error && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2">
                                        <AlertCircle size={14} className="text-red-600 shrink-0" strokeWidth={1.5} />
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

// =====================================================
// SUB COMPONENTES
// =====================================================

function DocUploadRow({
    doc,
    file,
    onSelect,
    onRemove,
}: {
    doc: DocConfig;
    file: File | null;
    onSelect: (file: File | null) => void;
    onRemove: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg border transition
                ${file
                    ? 'border-green-500/30 bg-green-50'
                    : 'border-slate-200 bg-slate-50'
                }
            `}
        >
            <div
                className={`
                    w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                    ${file ? 'bg-green-500/10' : 'bg-white border border-slate-200'}
                `}
            >
                {file ? (
                    <CheckCircle2 size={16} className="text-green-600" strokeWidth={1.5} />
                ) : (
                    <FileUp size={16} className="text-slate-500" strokeWidth={1.5} />
                )}
            </div>

            <span className={`text-sm flex-1 min-w-0 ${file ? 'text-green-600' : 'text-slate-900'}`}>
                {file ? file.name : doc.label}
            </span>

            <input
                ref={inputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={e => {
                    const f = e.target.files?.[0] || null;
                    onSelect(f);
                    e.target.value = '';
                }}
            />

            {!file && (
                <button
                    onClick={() => inputRef.current?.click()}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition active:scale-[0.99]"
                >
                    <Upload size={12} strokeWidth={1.5} />
                    Seleccionar
                </button>
            )}

            {file && (
                <button
                    onClick={onRemove}
                    className="shrink-0 w-7 h-7 rounded-lg hover:bg-green-500/20 flex items-center justify-center transition"
                >
                    <X size={14} className="text-green-600" strokeWidth={1.5} />
                </button>
            )}
        </div>
    );
}

function InfoItem2({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    if (!value) return null;
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
            <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-slate-400 mb-1">
                {label}
            </p>
            <p className="text-sm font-medium text-slate-900 break-all">
                {value}
            </p>
        </div>
    );
}
