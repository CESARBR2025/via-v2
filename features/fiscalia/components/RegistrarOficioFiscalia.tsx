'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, FileText, Upload, User } from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';

type Props = {
    idInfraccion: string;
    noOficioActual?: string;
    noCarpetaActual?: string;
    esTitular?: boolean;
    nombreInfractor?: string;
    appaternoInfractor?: string;
    apmaternoInfractor?: string;
    correoInfractor?: string;
    curpInfractor?: string;
    guardarOficioEndpoint?: string;
    onSuccess?: () => void;
};

function InputField({ label, value, onChange, placeholder, mono, maxLength }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean; maxLength?: number
}) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-semibold tracking-wider uppercase text-[#64748B]">{label}</label>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                className={`w-full rounded-lg border px-2.5 py-1.5 text-[13px] outline-none transition-all ${mono ? 'font-mono tracking-wider' : ''}`}
                style={{ borderColor: '#E2E8F0', color: '#0F172A', background: '#FFFFFF' }}
                onFocus={e => { e.target.style.borderColor = '#F97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)' }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
            />
        </div>
    );
}

export default function RegistrarOficioFiscalia({
    idInfraccion,
    noOficioActual,
    noCarpetaActual,
    esTitular,
    nombreInfractor,
    appaternoInfractor,
    apmaternoInfractor,
    correoInfractor,
    curpInfractor,
    guardarOficioEndpoint = '/api/fiscalia/guardarOficio',
    onSuccess,
}: Props) {
    const esTitularBool = esTitular === true;
    const [numeroOficio, setNumeroOficio] = useState(noOficioActual && noOficioActual !== 'NO_DATA' ? noOficioActual : '');
    const [noCarpeta, setNoCarpeta] = useState(noCarpetaActual && noCarpetaActual !== 'NO_DATA' ? noCarpetaActual : '');
    const [archivo, setArchivo] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const addToast = useToastStore((s) => s.addToast);

    const [nombre, setNombre] = useState(esTitularBool ? (nombreInfractor ?? '') : '');
    const [appaterno, setAppaterno] = useState(esTitularBool ? (appaternoInfractor ?? '') : '');
    const [apmaterno, setApmaterno] = useState(esTitularBool ? (apmaternoInfractor ?? '') : '');
    const [correoTitular, setCorreoTitular] = useState(esTitularBool ? (correoInfractor ?? '') : '');
    const [curpTitular, setCurpTitular] = useState(esTitularBool ? (curpInfractor ?? '') : '');

    const handleSubmit = async () => {
        if (!numeroOficio.trim() && !archivo) return;
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('folio', idInfraccion);
            fd.append('numero_oficio', numeroOficio.trim());
            if (archivo) fd.append('archivoIne', archivo);
            if (noCarpeta.trim()) fd.append('no_carpeta_investigacion', noCarpeta.trim());

            if (nombre.trim()) fd.append('nombre_titular_liberacion', nombre.trim());
            if (appaterno.trim()) fd.append('appaterno_titular_liberacion', appaterno.trim());
            if (apmaterno.trim()) fd.append('apmaterno_titular_liberacion', apmaterno.trim());
            if (correoTitular.trim()) fd.append('correo_titular_liberacion', correoTitular.trim());
            if (curpTitular.trim()) fd.append('curp_titular_liberacion', curpTitular.trim());

            const res = await fetch(guardarOficioEndpoint, {
                method: 'POST',
                body: fd,
            });
            if (!res.ok) throw new Error('Error al guardar');

            setSuccess(true);
            addToast('Oficio registrado correctamente', 'success');
            onSuccess?.();
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Error al guardar el oficio';
            addToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
            <div className="px-5 py-3 flex items-center gap-3 border-b" style={{ background: '#FFF7ED', borderColor: '#FED7AA66' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#F97316' }}>
                    <FileText size={14} strokeWidth={2.2} className="text-white" />
                </div>
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#F97316' }}>Registrar Oficio</h3>
            </div>

            <div className="p-5 space-y-4">
                {success ? (
                    <div className="rounded-xl border p-4 text-center" style={{ borderColor: '#BBF7D0', background: '#F0FDF4' }}>
                        <CheckCircle2 size={24} strokeWidth={2} className="mx-auto text-[#22C55E]" />
                        <p className="text-[14px] font-semibold text-[#166534] mt-2">Oficio registrado</p>
                        <p className="text-[12px] text-[#16A34A] mt-0.5">Los datos se guardaron correctamente.</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#64748B]">Número de Oficio</label>
                            <input
                                type="text"
                                value={numeroOficio}
                                onChange={e => setNumeroOficio(e.target.value)}
                                placeholder="Escriba el número de oficio"
                                className="w-full rounded-lg border px-3 py-2 text-[14px] outline-none transition-all"
                                style={{ borderColor: '#E2E8F0', color: '#0F172A', background: '#FFFFFF' }}
                                onFocus={e => { e.target.style.borderColor = '#F97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)' }}
                                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#64748B]">
                                No. Carpeta de Investigación <span className="text-[#94A3B8] font-normal normal-case">(opcional)</span>
                            </label>
                            <input
                                type="text"
                                value={noCarpeta}
                                onChange={e => setNoCarpeta(e.target.value)}
                                placeholder="Ej: C-2025-00123"
                                className="w-full rounded-lg border px-3 py-2 text-[14px] outline-none transition-all"
                                style={{ borderColor: '#E2E8F0', color: '#0F172A', background: '#FFFFFF' }}
                                onFocus={e => { e.target.style.borderColor = '#F97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)' }}
                                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                            />
                        </div>

                        <div className="rounded-lg p-4 space-y-3" style={{ background: esTitularBool ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${esTitularBool ? '#BBF7D0' : '#FECACA'}` }}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: esTitularBool ? '#22C55E' : '#EF4444' }}>
                                    <User size={11} strokeWidth={2.5} className="text-white" />
                                </div>
                                <p className="text-[12px] font-semibold" style={{ color: esTitularBool ? '#166534' : '#991B1B' }}>
                                    {esTitularBool ? 'Datos del Titular (prellenados)' : 'Datos del Titular (capturar)'}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <InputField label="Nombre(s)" value={nombre} onChange={setNombre} placeholder="Nombre(s)" />
                                <InputField label="A. Paterno" value={appaterno} onChange={setAppaterno} placeholder="Paterno" />
                                <InputField label="A. Materno" value={apmaterno} onChange={setApmaterno} placeholder="Materno" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <InputField label="Correo Electrónico" value={correoTitular} onChange={setCorreoTitular} placeholder="correo@ejemplo.com" />
                                <InputField label="CURP" value={curpTitular} onChange={setCurpTitular} placeholder="CURP (18 caracteres)" mono maxLength={18} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#64748B]">
                                Archivo del Oficio <span className="text-[#94A3B8] font-normal normal-case">(PDF o imagen)</span>
                            </label>
                            <button
                                onClick={() => fileRef.current?.click()}
                                className="w-full rounded-lg border-2 border-dashed p-4 flex flex-col items-center gap-2 transition-colors cursor-pointer"
                                style={{ borderColor: archivo ? '#F97316' : '#E2E8F0', background: archivo ? '#FFF7ED' : '#FAFAFA' }}
                            >
                                {archivo ? (
                                    <>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F97316' }}>
                                            <FileText size={16} strokeWidth={2} className="text-white" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[13px] font-medium text-[#0F172A] truncate max-w-[180px]">{archivo.name}</p>
                                            <p className="text-[11px] text-[#64748B]">{(archivo.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button
                                            onClick={e => { e.stopPropagation(); setArchivo(null); if (fileRef.current) fileRef.current.value = '' }}
                                            className="text-[11px] text-[#EF4444] font-medium hover:underline"
                                        >
                                            Quitar archivo
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} strokeWidth={1.5} className="text-[#94A3B8]" />
                                        <p className="text-[13px] font-medium text-[#64748B]">Seleccionar archivo</p>
                                        <p className="text-[11px] text-[#94A3B8]">PDF o imagen &middot; Máx 10 MB</p>
                                    </>
                                )}
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={e => setArchivo(e.target.files?.[0] ?? null)}
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={saving || (!numeroOficio.trim() && !archivo)}
                            className="w-full rounded-lg py-2.5 text-[13px] font-semibold text-white transition-colors"
                            style={{
                                background: saving ? '#94A3B8' : '#F97316',
                            }}
                        >
                            {saving ? 'Guardando…' : 'Guardar Documentos'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
