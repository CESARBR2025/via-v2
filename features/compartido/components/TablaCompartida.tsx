'use client'

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Play, FileText, CheckCircle2, Upload, User } from "lucide-react"
import FiscaliaDashboard from "@/features/fiscalia/components/FiscaliaDashboard"
import ModalDetalleGenerico, { DetalleCompleto } from "@/features/compartido/components/ModalDetalleGenerico"
import ConfirmacionModal from "@/features/compartido/components/ConfirmacionModal"
import { abrirDocumento } from '@/features/expediente/helpers/abrirDocumento'

interface DataRow {
    id: string
    nombre_infractor?: string
    correo_infractor?: string
    folio?: string
    estatus?: string
    placa?: string
    created_at?: string
    [key: string]: any
}

interface TablaCompartidaProps {
    respuestaServidor: {
        data: DataRow[]
        total: number
    }
    userRole: string | undefined
}

const columns = [
    { key: "folio", label: "Folio", roles: ["fiscalia", "corralon_mw", "corralon_mejia"] },
    { key: "nombre_infractor", label: "Nombre Infractor", roles: ["fiscalia", "corralon_mw", "corralon_mejia"] },
    { key: "correo_infractor", label: "Correo", roles: ["fiscalia", "corralon_mw", "corralon_mejia"] },
    { key: "placa", label: "Placa", roles: ["fiscalia", "corralon_mw"] },
    { key: "estatus", label: "Estatus", roles: ["fiscalia", "corralon_mw", "corralon_mejia"] },
    { key: "acciones", label: "Acciones", roles: ["fiscalia", "corralon_mw", "corralon_mejia"] },
]

export default function TablaCompartida({ respuestaServidor, userRole }: TablaCompartidaProps) {
    const router = useRouter()

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [detalle, setDetalle] = useState<DetalleCompleto | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)

    if (!userRole) {
        return <div className="text-red-500 font-medium p-4">Error: No tienes un rol asignado.</div>
    }

    const listaDatos = respuestaServidor?.data ?? []
    const visibleColumns = columns.filter((column) => column.roles.includes(userRole))

    async function refetchDetalle(id: string) {
        setLoading(true)
        try {
            const res = await fetch(`/api/depInfracciones/detalleInfraccion/${id}`)
            if (!res.ok) throw new Error('Error al obtener el detalle de la infracción')
            const json = await res.json()
            setDetalle(json.data)
        } catch (error) {
            console.error('Error en el refetch:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleOpenDetalle(id: string) {
        setOpen(true)
        setDetalle(null)
        await refetchDetalle(id)
    }

    function handleCloseDetalle() {
        setOpen(false)
        router.refresh()
    }

    const iniciarRevision = async () => {
        if (!detalle?.Header?.id_infraccion) return
        setConfirmLoading(true)
        try {
            const response = await fetch('/api/fiscalia/iniciarProceso', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: detalle.Header.id_infraccion }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Algo salió mal')
            setConfirmOpen(false)
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Error en la petición:', error)
        } finally {
            setConfirmLoading(false)
        }
    }

    if (userRole === 'fiscalia') {
        const estatus = detalle?.Header?.estatus_dependencia
        const mostrarBotonInicio = estatus === 'PENDIENTE'
        const enRevision = estatus === 'EN_REVISION'

        return (
            <>
                <FiscaliaDashboard
                    data={listaDatos}
                    visibleColumns={visibleColumns}
                    onOpenDetalle={handleOpenDetalle}
                />

                <ModalDetalleGenerico
                    isOpen={open}
                    onClose={handleCloseDetalle}
                    loading={loading}
                    detalle={detalle}
                    role="fiscalia"
                    onRefresh={detalle ? () => refetchDetalle(detalle.Header.id_infraccion) : undefined}
                    antesContenido={
                        mostrarBotonInicio ? (
                            <button
                                onClick={() => setConfirmOpen(true)}
                                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-colors"
                                style={{ background: '#22C55E', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}
                            >
                                <Play size={14} strokeWidth={2.5} fill="white" />
                                Iniciar atención al caso
                            </button>
                        ) : undefined
                    }
                    sidebarExtra={
                        detalle?.Header && !mostrarBotonInicio ? [
                            enRevision ? (
                                <CargarOficioSection
                                    key="cargar-oficio"
                                    idInfraccion={detalle.Header.id_infraccion}
                                    noOficioActual={detalle.Header.no_oficio_fiscalia}
                                    noCarpetaActual={detalle.Header.no_carpeta_investigacion}
                                    esTitular={detalle.datos_infractor?.es_titular}
                                    nombreInfractor={detalle.datos_infractor?.nombre_infractor}
                                    appaternoInfractor={detalle.datos_infractor?.appaterno_infractor}
                                    apmaternoInfractor={detalle.datos_infractor?.apmaterno_infractor}
                                    correoInfractor={detalle.datos_infractor?.correo_infractor}
                                    curpInfractor={detalle.datos_infractor?.curp_infractor}
                                    onSuccess={() => refetchDetalle(detalle.Header.id_infraccion)}
                                />
                            ) : (
                                <OficioLiberacionSection
                                    key="oficio"
                                    numeroOficio={detalle.Header.no_oficio_fiscalia}
                                    urlOficio={detalle.Header.url_oficio_fiscalia}
                                />
                            ),
                        ] : []
                    }
                />

                <ConfirmacionModal
                    isOpen={confirmOpen}
                    onConfirmar={iniciarRevision}
                    onCancelar={() => setConfirmOpen(false)}
                    loading={confirmLoading}
                    titulo="Iniciar atención al caso"
                    mensaje="Esta acción cambiará el estatus de la infracción a «En Revisión» y notificará al área correspondiente. ¿Deseas continuar?"
                    labelConfirmar="Sí, iniciar proceso"
                    labelCancelar="Cancelar"
                    variant="success"
                />
            </>
        )
    }
}

// ─── FORMULARIO CARGA DE OFICIO ───

function CargarOficioSection({
    idInfraccion,
    noOficioActual,
    noCarpetaActual,
    esTitular,
    nombreInfractor,
    appaternoInfractor,
    apmaternoInfractor,
    correoInfractor,
    curpInfractor,
    onSuccess,
}: {
    idInfraccion: string
    noOficioActual?: string
    noCarpetaActual?: string
    esTitular?: boolean
    nombreInfractor?: string
    appaternoInfractor?: string
    apmaternoInfractor?: string
    correoInfractor?: string
    curpInfractor?: string
    onSuccess?: () => void
}) {
    const esTitularBool = esTitular === true
    const [numeroOficio, setNumeroOficio] = useState(noOficioActual && noOficioActual !== 'NO_DATA' ? noOficioActual : '')
    const [noCarpeta, setNoCarpeta] = useState(noCarpetaActual && noCarpetaActual !== 'NO_DATA' ? noCarpetaActual : '')
    const [archivo, setArchivo] = useState<File | null>(null)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const [nombre, setNombre] = useState(esTitularBool ? (nombreInfractor ?? '') : '')
    const [appaterno, setAppaterno] = useState(esTitularBool ? (appaternoInfractor ?? '') : '')
    const [apmaterno, setApmaterno] = useState(esTitularBool ? (apmaternoInfractor ?? '') : '')
    const [correoTitular, setCorreoTitular] = useState(esTitularBool ? (correoInfractor ?? '') : '')
    const [curpTitular, setCurpTitular] = useState(esTitularBool ? (curpInfractor ?? '') : '')

    const handleSubmit = async () => {
        if (!numeroOficio.trim() && !archivo) return
        setSaving(true)
        try {
            const fd = new FormData()
            fd.append('folio', idInfraccion)
            fd.append('numero_oficio', numeroOficio.trim())
            if (archivo) fd.append('archivoIne', archivo)
            if (noCarpeta.trim()) fd.append('no_carpeta_investigacion', noCarpeta.trim())

            // Datos del titular
            if (nombre.trim()) fd.append('nombre_titular_liberacion', nombre.trim())
            if (appaterno.trim()) fd.append('appaterno_titular_liberacion', appaterno.trim())
            if (apmaterno.trim()) fd.append('apmaterno_titular_liberacion', apmaterno.trim())
            if (correoTitular.trim()) fd.append('correo_titular_liberacion', correoTitular.trim())
            if (curpTitular.trim()) fd.append('curp_titular_liberacion', curpTitular.trim())

            const res = await fetch('/api/fiscalia/guardarOficio', {
                method: 'POST',
                body: fd,
            })
            if (!res.ok) throw new Error('Error al guardar')
            setSuccess(true)
            onSuccess?.()
        } catch (error) {
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

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
                        {/* Número de Oficio */}
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

                        {/* No. Carpeta Investigación */}
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

                        {/* ─── DATOS DEL TITULAR ─── */}
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

                        {/* Subir Archivo */}
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
    )
}

// ─── INPUT FIELD ───

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
    )
}

// ─── OFICIO LIBERACIÓN (solo lectura) ───

function OficioLiberacionSection({ numeroOficio, urlOficio }: { numeroOficio?: string; urlOficio?: string }) {
    const tieneOficio = urlOficio && urlOficio !== 'NO_DATA'

    return (
        <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
            <div className="px-5 py-3 flex items-center gap-3 border-b" style={{ background: '#EFF6FF', borderColor: '#2563EB22' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#2563EB' }}>
                    <FileText size={14} strokeWidth={2.2} className="text-white" />
                </div>
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#2563EB' }}>Oficio de Liberación</h3>
            </div>
            <div className="p-5 space-y-4">
                <div className="space-y-0.5">
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#94A3B8]">Número de Oficio</p>
                    <p className="text-[14px] font-bold text-[#0F172A]">{numeroOficio && numeroOficio !== 'NO_DATA' ? numeroOficio : '—'}</p>
                </div>

                {tieneOficio ? (
                    <div className="rounded-xl border border-[#22C55E] bg-[#F0FDF4] p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#DCFCE7' }}>
                                    <CheckCircle2 size={18} strokeWidth={2.5} className="text-[#22C55E]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[13px] font-medium text-[#0F172A] truncate">Oficio adjuntado</p>
                                    <p className="text-[11px] text-[#64748B]">Documento digital registrado</p>
                                </div>
                            </div>
                            <button
                                onClick={() => abrirDocumento(urlOficio)}
                                className="shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white transition-colors"
                                style={{ background: '#2563EB' }}
                            >
                                Ver
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed p-4 text-center" style={{ borderColor: '#E2E8F0' }}>
                        <p className="text-[12px] text-[#94A3B8]">Sin oficio de liberación</p>
                    </div>
                )}
            </div>
        </div>
    )
}
