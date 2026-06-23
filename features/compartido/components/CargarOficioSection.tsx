'use client'

import { useRef, useState } from "react"
import { FileText, Upload, User, ArrowRight, CheckCircle2 } from "lucide-react"
import { useToastStore } from "@/stores/useToastStore"

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-all duration-150 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"

interface CargarOficioSectionProps {
    idInfraccion: string
    folio?: string
    noOficioActual?: string
    noCarpetaActual?: string
    nombreInfractor?: string
    appaternoInfractor?: string
    apmaternoInfractor?: string
    correoInfractor?: string
    curpInfractor?: string
    guardarOficioEndpoint?: string
    onSuccess?: () => void
    onClose?: () => void
}

export default function CargarOficioSection({
    idInfraccion,
    folio,
    noOficioActual,
    noCarpetaActual,
    nombreInfractor,
    appaternoInfractor,
    apmaternoInfractor,
    correoInfractor,
    curpInfractor,
    guardarOficioEndpoint = '/api/fiscalia/guardarOficio',
    onSuccess,
    onClose,
}: CargarOficioSectionProps) {
    console.log(curpInfractor)
    const [paso, setPaso] = useState(1)
    const [numeroOficio, setNumeroOficio] = useState(noOficioActual && noOficioActual !== 'NO_DATA' ? noOficioActual : '')
    const [noCarpeta, setNoCarpeta] = useState(noCarpetaActual && noCarpetaActual !== 'NO_DATA' ? noCarpetaActual : '')
    const [archivo, setArchivo] = useState<File | null>(null)
    const [saving, setSaving] = useState(false)
    const [esTitularState, setEsTitularState] = useState<boolean | null>(null)
    const [errores, setErrores] = useState<Record<string, string>>({})
    const fileRef = useRef<HTMLInputElement>(null)
    const addToast = useToastStore((s) => s.addToast)

    // Infractor capture (when curp === NO_DATA)
    const [infractorNombre, setInfractorNombre] = useState('')
    const [infractorAppaterno, setInfractorAppaterno] = useState('')
    const [infractorApmaterno, setInfractorApmaterno] = useState('')
    const [infractorCorreo, setInfractorCorreo] = useState('')
    const [infractorCurp, setInfractorCurp] = useState('')

    // Titular capture (when No)
    const [nombre, setNombre] = useState('')
    const [appaterno, setAppaterno] = useState('')
    const [apmaterno, setApmaterno] = useState('')
    const [correoTitular, setCorreoTitular] = useState('')
    const [curpTitular, setCurpTitular] = useState('')

    const necesitaCapturaInfractor = !curpInfractor || curpInfractor === 'NO_DATA'
    const necesitaCapturaTitular = esTitularState === false
    const necesitaCaptura = esTitularState === false || (esTitularState === true && necesitaCapturaInfractor)
    const pasoInfractorOffset = necesitaCapturaInfractor ? 1 : 0
    const totalExtraSteps = pasoInfractorOffset + (necesitaCapturaTitular ? 1 : 0)
    const totalPasos = 4 + totalExtraSteps

    function validarInfractor(): boolean {
        const e: Record<string, string> = {}
        if (!infractorNombre.trim()) e.infractorNombre = 'Requerido'
        if (!infractorAppaterno.trim()) e.infractorAppaterno = 'Requerido'
        if (!infractorCorreo.trim()) e.infractorCorreo = 'Requerido'
        if (!infractorCurp.trim()) {
            e.infractorCurp = 'Requerido'
        } else if (infractorCurp.trim().length !== 18) {
            e.infractorCurp = 'Debe tener 18 caracteres'
        }
        setErrores(e)
        return Object.keys(e).length === 0
    }

    function validarTitular(): boolean {
        const e: Record<string, string> = {}
        if (!nombre.trim()) e.nombre = 'Requerido'
        if (!appaterno.trim()) e.appaterno = 'Requerido'
        if (!apmaterno.trim()) e.apmaterno = 'Requerido'
        if (!correoTitular.trim()) e.correoTitular = 'Requerido'
        if (!curpTitular.trim()) {
            e.curpTitular = 'Requerido'
        } else if (curpTitular.trim().length !== 18) {
            e.curpTitular = 'Debe tener 18 caracteres'
        }
        setErrores(e)
        return Object.keys(e).length === 0
    }

    function validarOficio(): boolean {
        const e: Record<string, string> = {}
        if (!numeroOficio.trim()) e.numeroOficio = 'Requerido'
        if (!noCarpeta.trim()) e.noCarpeta = 'Requerido'
        setErrores(e)
        return Object.keys(e).length === 0
    }

    function validarArchivo(): boolean {
        const e: Record<string, string> = {}
        if (!archivo) e.archivo = 'Debe seleccionar un archivo'
        setErrores(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async () => {
        if (!validarOficio()) return
        if (esTitularState === false && !validarTitular()) return
        if (!archivo) { setErrores({ archivo: 'Debe seleccionar un archivo' }); return }
        setSaving(true)
        try {
            const fd = new FormData()
            fd.append('folio', idInfraccion)
            fd.append('numero_oficio', numeroOficio.trim())
            fd.append('archivoIne', archivo)
            if (noCarpeta.trim()) fd.append('no_carpeta_investigacion', noCarpeta.trim())

            const titularData = esTitularState === true
                ? necesitaCapturaInfractor
                    ? {
                        nombre: infractorNombre.trim().toUpperCase(),
                        appaterno: infractorAppaterno.trim().toUpperCase(),
                        apmaterno: infractorApmaterno.trim().toUpperCase(),
                        correo: infractorCorreo.trim(),
                        curp: infractorCurp.trim().toUpperCase(),
                    }
                    : {
                        nombre: nombreInfractor ?? '',
                        appaterno: appaternoInfractor ?? '',
                        apmaterno: apmaternoInfractor ?? '',
                        correo: correoInfractor ?? '',
                        curp: curpInfractor ?? '',
                    }
                : {
                    nombre: nombre.trim(),
                    appaterno: appaterno.trim(),
                    apmaterno: apmaterno.trim(),
                    correo: correoTitular.trim(),
                    curp: curpTitular.trim(),
                }

            if (titularData.nombre) fd.append('nombre_titular_liberacion', titularData.nombre)
            if (titularData.appaterno) fd.append('appaterno_titular_liberacion', titularData.appaterno)
            if (titularData.apmaterno) fd.append('apmaterno_titular_liberacion', titularData.apmaterno)
            if (titularData.correo) fd.append('correo_titular_liberacion', titularData.correo)
            if (titularData.curp) fd.append('curp_titular_liberacion', titularData.curp)

            // También enviar datos del infractor cuando fueron capturados (CURP era NO_DATA)
            if (necesitaCapturaInfractor) {
                fd.append('nombre_infractor', infractorNombre.trim().toUpperCase())
                fd.append('apellido_paterno_infractor', infractorAppaterno.trim().toUpperCase())
                fd.append('apellido_materno_infractor', infractorApmaterno.trim().toUpperCase())
                fd.append('correo_infractor', infractorCorreo.trim())
                fd.append('curp_infractor', infractorCurp.trim().toUpperCase())
            }

            const res = await fetch(guardarOficioEndpoint, {
                method: 'POST',
                body: fd,
            })
            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.message || 'Error al guardar')
            }

            addToast('Oficio registrado correctamente', 'success')
            onSuccess?.()
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Error al guardar el oficio'
            addToast(msg, 'error')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <div className="px-5 py-3 flex items-center justify-between gap-3 border-b border-blue-200/40 bg-blue-50 rounded-t-xl">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-blue-700">
                        <FileText size={14} strokeWidth={2.2} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-xs font-medium uppercase tracking-wider text-blue-700">Registrar Oficio </h3>
                        <p className="text-[10px] text-blue-600 mt-0.5">Folio: {folio || idInfraccion}</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-500 transition-colors bg-white border border-slate-200 shrink-0" aria-label="Cerrar">
                        ✕
                    </button>
                )}
            </div>

            <div className="p-5 space-y-5">
                <>
                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[11px] font-medium px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                            Paso {paso} de {totalPasos}
                        </span>
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: totalPasos }).map((_, i) => {
                                const stepNum = i + 1
                                return (
                                    <span key={stepNum} className={stepNum === paso ? 'h-[7px] w-5 rounded-full bg-blue-700' : stepNum < paso ? 'h-[7px] w-[7px] rounded-full bg-blue-700 opacity-35' : 'h-[7px] w-[7px] rounded-full bg-slate-200'} />
                                )
                            })}
                        </div>
                    </div>

                    {/* Paso 1: Datos del oficio */}
                    {paso === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium tracking-wider uppercase text-slate-500">Número de Oficio <span className="text-red-600" aria-hidden="true">*</span></label>
                                <input type="text" value={numeroOficio} onChange={e => { setNumeroOficio(e.target.value); setErrores(p => ({ ...p, numeroOficio: '' })) }} placeholder="Escriba el número de oficio" className={`${inputClass} ${errores.numeroOficio ? 'border-red-300 focus:border-red-300 focus:ring-2 focus:ring-red-200/50' : ''}`} />
                                {errores.numeroOficio && <p className="text-xs font-medium text-red-600">{errores.numeroOficio}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium tracking-wider uppercase text-slate-500">No. Carpeta de Investigación <span className="text-red-600" aria-hidden="true">*</span></label>
                                <input type="text" value={noCarpeta} onChange={e => { setNoCarpeta(e.target.value); setErrores(p => ({ ...p, noCarpeta: '' })) }} placeholder="Ej: C-2025-00123" className={`${inputClass} ${errores.noCarpeta ? 'border-red-300 focus:border-red-300 focus:ring-2 focus:ring-red-200/50' : ''}`} />
                                {errores.noCarpeta && <p className="text-xs font-medium text-red-600">{errores.noCarpeta}</p>}
                            </div>
                            <button onClick={() => { if (validarOficio()) setPaso(2) }} className="w-full inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 active:scale-[0.99] shadow-sm transition-all duration-150">
                                <span>Continuar</span>
                                <ArrowRight size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    )}

                    {/* Paso 2: Capturar datos del infractor (solo si curp === NO_DATA) */}
                    {paso === 2 && necesitaCapturaInfractor && (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-blue-100"><User size={11} strokeWidth={2.5} className="text-blue-700" /></div>
                                    <p className="text-xs font-medium text-blue-700">Datos del infractor</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <Campo label="Nombre(s)" value={infractorNombre} onChange={setInfractorNombre} error={errores.infractorNombre} limpiarError={() => setErrores(p => ({ ...p, infractorNombre: '' }))} required />
                                    <Campo label="A. Paterno" value={infractorAppaterno} onChange={setInfractorAppaterno} error={errores.infractorAppaterno} limpiarError={() => setErrores(p => ({ ...p, infractorAppaterno: '' }))} required />
                                    <Campo label="A. Materno" value={infractorApmaterno} onChange={setInfractorApmaterno} error={errores.infractorApmaterno} limpiarError={() => setErrores(p => ({ ...p, infractorApmaterno: '' }))} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium tracking-wider uppercase text-slate-500">Correo Electrónico <span className="text-red-600" aria-hidden="true">*</span></label>
                                        <input type="text" value={infractorCorreo} onChange={e => { setInfractorCorreo(e.target.value); setErrores(p => ({ ...p, infractorCorreo: '' })) }} placeholder="correo@ejemplo.com" className={`${inputClass} ${errores.infractorCorreo ? 'border-red-300 focus:border-red-300 focus:ring-2 focus:ring-red-200/50' : ''}`} />
                                        {errores.infractorCorreo && <p className="text-xs font-medium text-red-600">{errores.infractorCorreo}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium tracking-wider uppercase text-slate-500">CURP <span className="text-red-600" aria-hidden="true">*</span></label>
                                        <input type="text" value={infractorCurp} onChange={e => { setInfractorCurp(e.target.value.toUpperCase()); setErrores(p => ({ ...p, infractorCurp: '' })) }} placeholder="CURP (18 caracteres)" maxLength={18} className={`${inputClass} font-mono tracking-wider ${errores.infractorCurp ? 'border-red-300 focus:border-red-300 focus:ring-2 focus:ring-red-200/50' : ''}`} />
                                        {errores.infractorCurp && <p className="text-xs font-medium text-red-600">{errores.infractorCurp}</p>}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => { if (validarInfractor()) setPaso(3) }} className="w-full inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 active:scale-[0.99] shadow-sm transition-all duration-150">
                                <span>Continuar</span><ArrowRight size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    )}

                    {/* Paso 3 (o 2 si no hay captura infractor): Titularidad */}
                    {paso === (necesitaCapturaInfractor ? 3 : 2) && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-xs font-medium tracking-wider uppercase text-slate-500">El infractor es el titular</p>
                                <div className="inline-flex items-center rounded-md p-0.5 bg-white border border-slate-200">
                                    <button type="button" onClick={() => { setEsTitularState(true); setPaso(3 + pasoInfractorOffset) }} className={`px-4 py-1.5 rounded text-[13px] font-medium transition-all duration-150 ${esTitularState === true ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Sí</button>
                                    <button type="button" onClick={() => { setEsTitularState(false); setPaso(3 + pasoInfractorOffset) }} className={`px-4 py-1.5 rounded text-[13px] font-medium transition-all duration-150 ${esTitularState === false ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>No</button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setPaso(p => p - 1)} className="inline-flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-[13px] font-medium text-slate-600 bg-transparent border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 transition-colors duration-150">
                                    <ArrowRight size={14} strokeWidth={2.5} className="rotate-180" /><span>Regresar</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Paso 3+offset: Documento (si Sí, con datos prop o capturados) */}
                    {paso === (3 + pasoInfractorOffset) && esTitularState === true && (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-blue-100"><User size={11} strokeWidth={2.5} className="text-blue-700" /></div>
                                    <p className="text-xs font-medium text-blue-700">Los datos del infractor se usarán como datos del titular</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                                        <p className="text-[10px] font-medium tracking-wider uppercase text-slate-400 mb-0.5">Nombre completo</p>
                                        <p className="text-xs font-medium text-slate-900 truncate">{necesitaCapturaInfractor ? [infractorNombre, infractorAppaterno, infractorApmaterno].filter(Boolean).join(' ') : [nombreInfractor, appaternoInfractor, apmaternoInfractor].filter(Boolean).join(' ') || '—'}</p>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                                        <p className="text-[10px] font-medium tracking-wider uppercase text-slate-400 mb-0.5">Correo</p>
                                        <p className="text-xs font-medium text-slate-900 truncate">{necesitaCapturaInfractor ? infractorCorreo : correoInfractor || '—'}</p>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                                        <p className="text-[10px] font-medium tracking-wider uppercase text-slate-400 mb-0.5">CURP</p>
                                        <p className="text-xs font-mono font-medium text-slate-900">{necesitaCapturaInfractor ? infractorCurp : curpInfractor || '—'}</p>
                                    </div>
                                </div>
                            </div>
                            <FileUpload archivo={archivo} setArchivo={setArchivo} fileRef={fileRef} error={errores.archivo} setError={setErrores} />
                            <div className="flex items-center gap-3">
                                <button onClick={() => { setEsTitularState(null); setPaso(p => p - 1) }} className="inline-flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-[13px] font-medium text-slate-600 bg-transparent border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 transition-colors duration-150">
                                    <ArrowRight size={14} strokeWidth={2.5} className="rotate-180" /><span>Regresar</span>
                                </button>
                                <button onClick={() => { if (validarArchivo()) setPaso(4 + pasoInfractorOffset) }} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 active:scale-[0.99] shadow-sm transition-all duration-150">
                                    <span>Continuar</span><ArrowRight size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Paso 3+offset: Capturar datos del titular (solo cuando No) */}
                    {paso === (3 + pasoInfractorOffset) && esTitularState === false && (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-blue-100"><User size={11} strokeWidth={2.5} className="text-blue-700" /></div>
                                    <p className="text-xs font-medium text-blue-700">Datos del titular (capturar)</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <Campo label="Nombre(s)" value={nombre} onChange={setNombre} error={errores.nombre} limpiarError={() => setErrores(p => ({ ...p, nombre: '' }))} required />
                                    <Campo label="A. Paterno" value={appaterno} onChange={setAppaterno} error={errores.appaterno} limpiarError={() => setErrores(p => ({ ...p, appaterno: '' }))} required />
                                    <Campo label="A. Materno" value={apmaterno} onChange={setApmaterno} error={errores.apmaterno} limpiarError={() => setErrores(p => ({ ...p, apmaterno: '' }))} required />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium tracking-wider uppercase text-slate-500">Correo Electrónico <span className="text-red-600" aria-hidden="true">*</span></label>
                                        <input type="text" value={correoTitular} onChange={e => { setCorreoTitular(e.target.value); setErrores(p => ({ ...p, correoTitular: '' })) }} placeholder="correo@ejemplo.com" className={`${inputClass} ${errores.correoTitular ? 'border-red-300 focus:border-red-300 focus:ring-2 focus:ring-red-200/50' : ''}`} />
                                        {errores.correoTitular && <p className="text-xs font-medium text-red-600">{errores.correoTitular}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium tracking-wider uppercase text-slate-500">CURP <span className="text-red-600" aria-hidden="true">*</span></label>
                                        <input type="text" value={curpTitular} onChange={e => { setCurpTitular(e.target.value.toUpperCase()); setErrores(p => ({ ...p, curpTitular: '' })) }} placeholder="CURP (18 caracteres)" maxLength={18} className={`${inputClass} font-mono tracking-wider ${errores.curpTitular ? 'border-red-300 focus:border-red-300 focus:ring-2 focus:ring-red-200/50' : ''}`} />
                                        {errores.curpTitular && <p className="text-xs font-medium text-red-600">{errores.curpTitular}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => { setEsTitularState(null); setPaso(p => p - 1) }} className="inline-flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-[13px] font-medium text-slate-600 bg-transparent border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 transition-colors duration-150">
                                    <ArrowRight size={14} strokeWidth={2.5} className="rotate-180" /><span>Regresar</span>
                                </button>
                                <button onClick={() => { if (validarTitular()) setPaso(4 + pasoInfractorOffset) }} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 active:scale-[0.99] shadow-sm transition-all duration-150">
                                    <span>Continuar</span><ArrowRight size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Paso 4+offset (captura): Documento (solo cuando No es titular) */}
                    {paso === (4 + pasoInfractorOffset) && esTitularState === false && (
                        <div className="space-y-4">
                            <FileUpload archivo={archivo} setArchivo={setArchivo} fileRef={fileRef} error={errores.archivo} setError={setErrores} />
                            <div className="flex items-center gap-3">
                                <button onClick={() => setPaso(p => p - 1)} className="inline-flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-[13px] font-medium text-slate-600 bg-transparent border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 transition-colors duration-150">
                                    <ArrowRight size={14} strokeWidth={2.5} className="rotate-180" /><span>Regresar</span>
                                </button>
                                <button onClick={() => { if (validarArchivo()) setPaso(5 + pasoInfractorOffset) }} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 active:scale-[0.99] shadow-sm transition-all duration-150">
                                    <span>Continuar</span><ArrowRight size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Paso resumen (Sí+data: paso 4+offset, No/NO_DATA: paso 5+offset) */}
                    {(paso === (4 + pasoInfractorOffset) && esTitularState === true) || (paso === (5 + pasoInfractorOffset) && necesitaCaptura) ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-blue-700" />
                                <p className="text-sm font-medium text-slate-900">Revise la información antes de guardar</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
                                <div className="p-3 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Número de Oficio</span>
                                    <span className="text-xs font-medium text-slate-900">{numeroOficio}</span>
                                </div>
                                <div className="p-3 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">No. Carpeta Investigación</span>
                                    <span className="text-xs font-medium text-slate-900">{noCarpeta}</span>
                                </div>
                                {necesitaCapturaInfractor && (
                                    <div className="divide-y divide-slate-100">
                                        <div className="p-3 flex items-center justify-between">
                                            <span className="text-xs text-slate-500">Infractor</span>
                                            <span className="text-xs font-medium text-slate-900">{[infractorNombre, infractorAppaterno, infractorApmaterno].filter(Boolean).join(' ')}</span>
                                        </div>
                                        <div className="p-3 flex items-center justify-between">
                                            <span className="text-xs text-slate-500">Correo infractor</span>
                                            <span className="text-xs font-medium text-slate-900">{infractorCorreo || '—'}</span>
                                        </div>
                                        <div className="p-3 flex items-center justify-between">
                                            <span className="text-xs text-slate-500">CURP infractor</span>
                                            <span className="text-xs font-medium text-slate-900 font-mono">{infractorCurp || '—'}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="p-3 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Titular</span>
                                    <span className="text-xs font-medium text-slate-900">
                                        {esTitularState === true
                                            ? necesitaCapturaInfractor
                                                ? [infractorNombre, infractorAppaterno, infractorApmaterno].filter(Boolean).join(' ')
                                                : [nombreInfractor, appaternoInfractor, apmaternoInfractor].filter(Boolean).join(' ')
                                            : [nombre, appaterno, apmaterno].filter(Boolean).join(' ') || '—'
                                        || '—'}
                                    </span>
                                </div>
                                <div className="p-3 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Correo titular</span>
                                    <span className="text-xs font-medium text-slate-900">
                                        {esTitularState === true
                                            ? necesitaCapturaInfractor
                                                ? (infractorCorreo || '—')
                                                : (correoInfractor || '—')
                                            : (correoTitular || '—')}
                                    </span>
                                </div>
                                <div className="p-3 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">CURP titular</span>
                                    <span className="text-xs font-medium text-slate-900 font-mono">
                                        {esTitularState === true
                                            ? necesitaCapturaInfractor
                                                ? (infractorCurp || '—')
                                                : (curpInfractor || '—')
                                            : (curpTitular || '—')}
                                    </span>
                                </div>
                                <div className="p-3 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Archivo</span>
                                    <span className="text-xs font-medium text-slate-900">{archivo?.name || '—'}</span>
                                </div>
                            </div>
                            {errores.archivo && <p className="text-xs font-medium text-red-600">{errores.archivo}</p>}
                            <div className="flex items-center gap-3">
                                <button onClick={() => setPaso(p => p - 1)} className="inline-flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-[13px] font-medium text-slate-600 bg-transparent border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 transition-colors duration-150">
                                    <ArrowRight size={14} strokeWidth={2.5} className="rotate-180" /><span>Regresar</span>
                                </button>
                                <button onClick={handleSubmit} disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 active:scale-[0.99] shadow-sm transition-all duration-150 disabled:bg-blue-200 disabled:cursor-not-allowed">
                                    {saving ? 'Guardando…' : 'Guardar Documentos'}
                                </button>
                            </div>
                        </div>
                    ) : null}
                </>
            </div>
        </div>
    )
}

function Campo({ label, value, onChange, error, limpiarError, required }: {
    label: string; value: string; onChange: (v: string) => void; error?: string; limpiarError: () => void; required?: boolean
}) {
    const fieldId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`
    return (
        <div className="space-y-1">
            <label htmlFor={fieldId} className="text-[10px] font-medium tracking-wider uppercase text-slate-500">
                {label}{required && <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>}
            </label>
            <input id={fieldId} type="text" value={value} onChange={e => { onChange(e.target.value); limpiarError() }} placeholder={label} className={`${inputClass} ${error ? 'border-red-300 focus:border-red-300 focus:ring-2 focus:ring-red-200/50' : ''}`} />
            {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
    )
}

function FileUpload({ archivo, setArchivo, fileRef, error, setError }: {
    archivo: File | null; setArchivo: (f: File | null) => void; fileRef: React.RefObject<HTMLInputElement | null>; error?: string; setError: (e: Record<string, string>) => void
}) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-medium tracking-wider uppercase text-slate-500">
                Archivo del Oficio <span className="text-red-600" aria-hidden="true">*</span>
                <span className="text-slate-400 font-normal normal-case"> (PDF o imagen)</span>
            </label>
            <button
                onClick={() => fileRef.current?.click()}
                className={`w-full rounded-lg border-2 border-dashed p-4 flex flex-col items-center gap-2 transition-colors cursor-pointer ${archivo ? 'bg-blue-50 border-blue-300' : error ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
            >
                {archivo ? (
                    <>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-700"><FileText size={16} strokeWidth={2} className="text-white" /></div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-900 truncate max-w-[180px]">{archivo.name}</p>
                            <p className="text-[11px] text-slate-500">{(archivo.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); setArchivo(null); if (fileRef.current) fileRef.current.value = ''; setError({ archivo: '' }) }} className="text-[11px] text-red-600 font-medium hover:underline">Quitar archivo</button>
                    </>
                ) : (
                    <>
                        <Upload size={20} strokeWidth={1.5} className="text-slate-400" />
                        <p className="text-sm font-medium text-slate-500">Seleccionar archivo</p>
                        <p className="text-xs text-slate-400">PDF o imagen &middot; Máx 10 MB</p>
                        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
                    </>
                )}
            </button>
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => { setArchivo(e.target.files?.[0] ?? null); setError({ archivo: '' }) }} />
        </div>
    )
}
