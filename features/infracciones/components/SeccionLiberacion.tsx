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

type DocConfig = {
    id: string;
    label: string;
    formKey: string;
};

type SubtipoTitular = 'infraccion' | 'delito' | 'accidente';

const DOCS_EMPRESA: DocConfig[] = [
    { id: 'factura', label: 'Factura', formKey: 'archivoFactura' },
    { id: 'ine_representante', label: 'INE del representante legal', formKey: 'archivoIneRepresentanteLegal' },
    { id: 'poder_notarial', label: 'Poder notarial o acta constitutiva', formKey: 'archivoPoderNotarial' },
    { id: 'constancia_fiscal', label: 'Constancia de situación fiscal', formKey: 'archivoConstanciaSituacionFiscal' },
];

const DOCS_INFRACCION: DocConfig[] = [
    { id: 'factura', label: 'Factura original', formKey: 'archivoFactura' },
    { id: 'ine', label: 'INE', formKey: 'archivoIneTitular' },
    { id: 'comprobante_domicilio', label: 'Comprobante de domicilio', formKey: 'archivoComprobanteDomicilio' },
    { id: 'tarjeta_circulacion', label: 'Tarjeta de circulación', formKey: 'archivoTarjetaCirculacion' },
];

const DOCS_DELITO: DocConfig[] = [
    { id: 'factura', label: 'Factura', formKey: 'archivoFactura' },
    { id: 'ine', label: 'INE', formKey: 'archivoIneTitular' },
    { id: 'oficio_liberacion_fiscalia', label: 'Oficio de liberación fiscalía', formKey: 'archivoOficioLiberacionFiscalia' },
];

const DOCS_ACCIDENTE: DocConfig[] = [
    { id: 'factura', label: 'Factura', formKey: 'archivoFactura' },
    { id: 'ine', label: 'INE', formKey: 'archivoIneTitular' },
    { id: 'oficio_liberacion_juzgado', label: 'Oficio de liberación juzgado cívico', formKey: 'archivoOficioLiberacionJuzgado' },
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
};

type Props = {
    dependenciaReceptora: string;
    noOficio: string;
    urlOficio: string;
    estatusDependencia: string;
    nombreTitular: string;
    correoTitular: string;
    curpTitular: string;
    noCarpetaInvestigacion?: string;
    motivoRetencion: string | null;
    infraccionId: string;
    documentosLiberacion: Record<string, { url: string; label: string }>;
};

function getEstatusConfig(estatus: string) {
    const s = (estatus || '').toLowerCase();

    if (s === 'espera_revision') {
        return {
            icon: Clock,
            bg: '#FEF3C7',
            border: '#F59E0B/30',
            text: '#D97706',
            label: 'En espera de revisión',
        };
    }

    if (s === 'liberado' || s === 'completado' || s === 'aprobado') {
        return {
            icon: CheckCircle2,
            bg: '#DCFCE7',
            border: '#22C55E/30',
            text: '#16A34A',
            label: estatus,
        };
    }
    if (s === 'pendiente' || s === 'en_proceso' || s === 'en proceso') {
        return {
            icon: Clock,
            bg: '#FEF3C7',
            border: '#F59E0B/30',
            text: '#D97706',
            label: estatus,
        };
    }
    if (s === 'rechazado' || s === 'cancelado') {
        return {
            icon: XCircle,
            bg: '#FEE2E2',
            border: '#EF4444/30',
            text: '#DC2626',
            label: estatus,
        };
    }
    return {
        icon: AlertCircle,
        bg: '#F1F5F9',
        border: '#E2E8F0',
        text: '#64748B',
        label: estatus || 'Sin gestión',
    };
}

export default function SeccionLiberacion({
    dependenciaReceptora,
    noOficio,
    urlOficio,
    estatusDependencia,
    nombreTitular,
    correoTitular,
    curpTitular,
    noCarpetaInvestigacion,
    motivoRetencion,
    infraccionId,
    documentosLiberacion,
}: Props) {
    const [selectedType, setSelectedType] = useState<'empresa' | 'titular' | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nombreEmpresa, setNombreEmpresa] = useState('');
    const [rfcEmpresa, setRfcEmpresa] = useState('');
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
    console.log(estatusDependencia)
    console.log(estatusConfig)

    const motivoSubtipo = motivoRetencion ? MOTIVO_TO_SUBTIPO[motivoRetencion] : undefined;

    const currentDocs: DocConfig[] = (() => {
        if (selectedType === 'empresa') return DOCS_EMPRESA;
        if (selectedType === 'titular' && motivoSubtipo) {
            return SUBTIPOS_TITULAR[motivoSubtipo].docs;
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

        setSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('idInfraccion', infraccionId);
            formData.append('tipoLiberacion', motivoRetencion || 'INFRACCION');
            formData.append('esEmpresa', selectedType === 'empresa' ? 'true' : 'false');

            if (selectedType === 'empresa') {
                formData.append('nombreEmpresa', nombreEmpresa.trim());
                formData.append('rfcEmpresa', rfcEmpresa.trim());
            }

            for (const doc of currentDocs) {
                const file = selectedFiles[doc.id];
                if (file) {
                    formData.append(doc.formKey, file);
                }
            }

            const res = await fetch('/api/ciudadano/subirDocumentos', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Error al subir documentos');
            }

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
            const formData = new FormData();
            formData.append('infraccionId', infraccionId);

            for (const tipo of docsAReenviar) {
                formData.append(tipo, reuploadFiles[tipo]);
            }

            const res = await fetch('/api/ciudadano/reintentarDocumentos', {
                method: 'PATCH',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Error al reenviar documentos');
            }

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
        <section className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-[18px] border-b border-[#E2E8F0] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                    <Scale size={18} className="text-[#2563EB]" />
                </div>
                <div>
                    <h3 className="text-[15px] font-semibold text-[#0F172A]">
                        Liberación
                    </h3>
                    <p className="text-xs text-[#64748B]">
                        Estatus de gestión
                    </p>
                </div>
            </div>

            <div className="p-6 space-y-5">

                {/* STATUS BADGE */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold shrink-0"
                        style={{
                            background: estatusConfig.bg,
                            borderColor: estatusConfig.border,
                            color: estatusConfig.text,
                        }}
                    >
                        <estatusConfig.icon size={16} />
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
                    <div className="rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#2563EB]/10 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-[#2563EB]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#0F172A]">
                                Oficio de liberación disponible
                            </p>

                        </div>
                        <button
                            onClick={() => abrirDocumento(urlOficio)}
                            className="shrink-0 w-9 h-9 rounded-lg hover:bg-[#DBEAFE] flex items-center justify-center transition"
                        >
                            <ExternalLink size={16} className="text-[#2563EB]" />
                        </button>
                    </div>
                )}

                {/* SEPARADOR */}
                {!tieneDocs && !submitted && estatusDependencia !== 'ESPERA_REVISION' && <div className="h-px bg-[#E2E8F0]" />}

                {/* FORMULARIO (solo si no hay docs) */}
                {!tieneDocs && !submitted && estatusDependencia !== 'ESPERA_REVISION' && (
                    <>
                        {/* SELECCIÓN TIPO */}
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-[#0F172A]">
                                Emitir orden de liberación para:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <TipoOption
                                    icon={Building2}
                                    selected={selectedType === 'empresa'}
                                    onClick={() => {
                                        setSelectedType('empresa');
                                        setSelectedFiles({});
                                        setError(null);
                                    }}
                                    label="Empresa"
                                    description="La unidad pertenece a una empresa"
                                />
                                <TipoOption
                                    icon={User}
                                    selected={selectedType === 'titular'}
                                    onClick={() => {
                                        setSelectedType('titular');
                                        setSelectedFiles({});
                                        setError(null);
                                    }}
                                    label="Titular"
                                    description="Persona física propietaria"
                                />
                            </div>
                        </div>

                        {/* TIPO LIBERACIÓN (auto desde DB) */}
                        {selectedType === 'titular' && (
                            <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                                    <FileText size={16} className="text-[#2563EB]" />
                                </div>
                                <div>
                                    <p className="text-xs text-[#64748B]">Tipo de liberación</p>
                                    <p className="text-sm font-semibold text-[#0F172A]">
                                        {subtipoLabel || 'No determinado'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* DATOS EMPRESA */}
                        {selectedType === 'empresa' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1.5">
                                        Nombre de la empresa <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={nombreEmpresa}
                                        onChange={e => setNombreEmpresa(e.target.value)}
                                        placeholder="Razón social"
                                        className="w-full h-10 px-3.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1.5">
                                        RFC <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={rfcEmpresa}
                                        onChange={e => setRfcEmpresa(e.target.value)}
                                        placeholder="RFC de la empresa"
                                        className="w-full h-10 px-3.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition"
                                    />
                                </div>
                            </div>
                        )}

                        {/* DOCUMENTOS */}
                        {currentDocs.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-sm font-semibold text-[#0F172A]">
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
                            <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 flex items-center gap-2">
                                <AlertCircle size={14} className="text-[#DC2626] shrink-0" />
                                <p className="text-sm text-[#DC2626]">{error}</p>
                            </div>
                        )}

                        {/* SUBMIT */}
                        {currentDocs.length > 0 && (
                            <button
                                onClick={handleSubmit}
                                disabled={!allSelected || submitting}
                                className="
                                    w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8]
                                    disabled:bg-[#93C5FD] disabled:opacity-60
                                    text-white text-sm font-semibold
                                    flex items-center justify-center gap-2
                                    transition
                                "
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Subiendo documentos...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} />
                                        Subir documentos
                                    </>
                                )}
                            </button>
                        )}
                    </>
                )}

                {/* DOCUMENTOS SUBIDOS */}
                {(tieneDocs || submitted || estatusDependencia === 'ESPERA_REVISION') && (
                    <div className="space-y-4">
                        {estatusDependencia === 'ESPERA_REVISION' && (
                            <div className="rounded-xl border border-[#22C55E]/30 bg-[#DCFCE7] p-6 text-center space-y-3">
                                <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={32} className="text-[#16A34A]" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-[#0F172A]">
                                        En espera de revisión
                                    </h4>
                                    <p className="text-sm text-[#64748B] mt-1">
                                        Todos los documentos fueron subidos correctamente.
                                        La autoridad revisará la información y emitirá la
                                        orden de liberación.
                                    </p>
                                </div>
                            </div>
                        )}

                        {tieneDocs && (
                            <div className="space-y-3">
                                <p className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
                                    <FileText size={15} className="text-[#2563EB]" />
                                    Documentos subidos
                                    {loadingStatus && <Loader2 size={12} className="animate-spin text-[#94A3B8]" />}
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
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors"
                                                    style={{
                                                        borderColor: aceptado ? '#BBF7D0' : rechazado ? '#FECACA' : '#E2E8F0',
                                                        background: aceptado ? '#F0FDF4' : rechazado ? '#FEF2F2' : '#F8FAFC',
                                                    }}
                                                >
                                                    <div
                                                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                                        style={{
                                                            background: aceptado ? '#DCFCE7' : rechazado ? '#FEE2E2' : '#EFF6FF',
                                                        }}
                                                    >
                                                        {aceptado ? (
                                                            <CheckCircle2 size={15} className="text-[#16A34A]" />
                                                        ) : rechazado ? (
                                                            <XCircle size={15} className="text-[#DC2626]" />
                                                        ) : (
                                                            <FileText size={15} className="text-[#2563EB]" />
                                                        )}
                                                    </div>

                                                    <span className="text-sm font-medium text-[#0F172A] flex-1 min-w-0">
                                                        {doc.label}
                                                    </span>

                                                    {aceptado && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0"
                                                            style={{ background: '#DCFCE7', color: '#16A34A' }}>
                                                            <CheckCircle2 size={10} />
                                                            Aceptado
                                                        </span>
                                                    )}

                                                    {rechazado && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0"
                                                            style={{ background: '#FEE2E2', color: '#DC2626' }}>
                                                            <XCircle size={10} />
                                                            Rechazado
                                                        </span>
                                                    )}

                                                    {pendiente && !loadingStatus && (
                                                        <span className="text-[11px] text-[#94A3B8] shrink-0 flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] animate-pulse" />
                                                            Pendiente
                                                        </span>
                                                    )}

                                                    <button
                                                        onClick={() => abrirDocumento(doc.url)}
                                                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition"
                                                    >
                                                        <Eye size={12} />
                                                        Ver
                                                    </button>
                                                </div>

                                                {/* RECHAZO: comentario + re-upload */}
                                                {rechazado && obs && (
                                                    <div className="ml-12 flex items-start gap-2 px-4 py-2.5 rounded-lg"
                                                        style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                                                        <MessageSquare size={13} className="text-[#D97706] mt-0.5 shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[11px] font-semibold text-[#D97706] mb-0.5">
                                                                Motivo del rechazo
                                                            </p>
                                                            <p className="text-[12px] text-[#92400E] italic">
                                                                &ldquo;{obs}&rdquo;
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* RE-UPLOAD solo si rechazado */}
                                                {rechazado && (
                                                    <div className="ml-12 flex items-center gap-3">
                                                        <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#FCA5A5] bg-[#FFFFFF] cursor-pointer hover:bg-[#FFF1F2] transition"
                                                            style={{ borderColor: tieneReupload ? '#22C55E' : '#FCA5A5' }}>
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
                                                                    <CheckCircle2 size={14} className="text-[#16A34A]" />
                                                                    <span className="text-[12px] font-medium text-[#16A34A] truncate">
                                                                        {reuploadFiles[key].name}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload size={14} className="text-[#DC2626]" />
                                                                    <span className="text-[12px] text-[#64748B]">
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
                                                                className="shrink-0 px-2 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[11px] text-[#64748B] transition"
                                                            >
                                                                <X size={13} />
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
                                        className="w-full h-11 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
                                    >
                                        {reuploading ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Reenviando...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={16} />
                                                Reenviar {Object.keys(reuploadFiles).length} documento(s) a revisión
                                            </>
                                        )}
                                    </button>
                                )}

                                {/* ERROR */}
                                {error && (
                                    <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 flex items-center gap-2">
                                        <AlertCircle size={14} className="text-[#DC2626] shrink-0" />
                                        <p className="text-sm text-[#DC2626]">{error}</p>
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

function TipoOption({
    icon: Icon,
    selected,
    onClick,
    label,
    description,
}: {
    icon: React.ElementType;
    selected: boolean;
    onClick: () => void;
    label: string;
    description: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`
                relative flex items-start gap-3 p-4 rounded-xl border-2 transition text-left
                ${selected
                    ? 'border-[#2563EB] bg-[#EFF6FF]'
                    : 'border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                }
            `}
        >
            <div
                className={`
                    shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition
                    ${selected ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#CBD5E1]'}
                `}
            >
                {selected && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <div className="flex items-start gap-3 min-w-0">
                <div
                    className={`
                        w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                        ${selected ? 'bg-[#DBEAFE]' : 'bg-[#F1F5F9]'}
                    `}
                >
                    <Icon size={18} className={selected ? 'text-[#2563EB]' : 'text-[#64748B]'} />
                </div>
                <div className="min-w-0">
                    <p className={`text-sm font-semibold ${selected ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>
                        {label}
                    </p>
                    <p className="text-xs text-[#64748B] mt-0.5">{description}</p>
                </div>
            </div>
        </button>
    );
}

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
                    ? 'border-[#22C55E]/30 bg-[#DCFCE7]'
                    : 'border-[#E2E8F0] bg-[#F8FAFC]'
                }
            `}
        >
            <div
                className={`
                    w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                    ${file ? 'bg-[#22C55E]/10' : 'bg-[#FFFFFF] border border-[#E2E8F0]'}
                `}
            >
                {file ? (
                    <CheckCircle2 size={16} className="text-[#16A34A]" />
                ) : (
                    <FileUp size={16} className="text-[#64748B]" />
                )}
            </div>

            <span className={`text-sm flex-1 min-w-0 ${file ? 'text-[#16A34A]' : 'text-[#0F172A]'}`}>
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
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition"
                >
                    <Upload size={12} />
                    Seleccionar
                </button>
            )}

            {file && (
                <button
                    onClick={onRemove}
                    className="shrink-0 w-7 h-7 rounded-lg hover:bg-[#22C55E]/20 flex items-center justify-center transition"
                >
                    <X size={14} className="text-[#16A34A]" />
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
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#94A3B8] mb-1">
                {label}
            </p>
            <p className="text-sm font-semibold text-[#0F172A] break-all">
                {value}
            </p>
        </div>
    );
}
