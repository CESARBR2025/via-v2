'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Play, FileText, CheckCircle2, Eye, ShieldCheck, ScrollText, Download, Loader2 } from "lucide-react"
import FiscaliaDashboard from "@/features/fiscalia/components/FiscaliaDashboard"
import CargarOficioSection from "@/features/compartido/components/CargarOficioSection"
import JuzgadoDashboard from "@/features/juzgado/components/JuzgadoDashboard"
import LiberacionesDashboard from "@/features/liberaciones/components/LiberacionesDashboard"
import CapturarInfractorSection from "@/features/liberaciones/components/CapturarInfractorSection"
import CorralonMWDashboard from "@/features/corralon-mw/components/CorralonMWDashboard"
import CorralonMejiaDashboard from "@/features/corralon-mejia/components/CorralonMejiaDashboard"
import InfraccionesDashboard from "@/features/infracciones/components/InfraccionesDashboard"
import RevisionDocumentosSection from "@/features/liberaciones/components/RevisionDocumentosSection"
import ModalDetalleGenerico, { DetalleCompleto } from "@/features/compartido/components/ModalDetalleGenerico"
import ConfirmacionModal from "@/features/compartido/components/ConfirmacionModal"
import CapturarDatosTitularSection from "@/features/infracciones/components/CapturarDatosTitularSection"
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
    { key: "folio", label: "Folio", roles: ["infracciones", "fiscalia", "corralon_mw", "corralon_mejia", 'juzgado_civico', , 'liberaciones'] },
    { key: "nombre_infractor", label: "Nombre Infractor", roles: ["infracciones", "fiscalia", "corralon_mw", "corralon_mejia", 'juzgado_civico', 'liberaciones'] },
    { key: "correo_infractor", label: "Correo", roles: ["infracciones", "fiscalia", "corralon_mw", "corralon_mejia", 'juzgado_civico', 'liberaciones'] },
    { key: "placa", label: "Placa", roles: ["infracciones", "fiscalia", "corralon_mw", 'juzgado_civico', 'liberaciones'] },
    { key: "estatus", label: "Estatus", roles: ["infracciones", "fiscalia", "corralon_mw", "corralon_mejia", 'juzgado_civico', 'liberaciones'] },
    { key: "acciones", label: "Acciones", roles: ["infracciones", "fiscalia", "corralon_mw", "corralon_mejia", 'juzgado_civico', 'liberaciones'] },
]

export default function TablaCompartida({ respuestaServidor, userRole }: TablaCompartidaProps) {
    const router = useRouter()

    console.log(userRole)
    console.log(respuestaServidor)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [detalle, setDetalle] = useState<DetalleCompleto | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)
    const [revisionModalId, setRevisionModalId] = useState<string | null>(null)

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

    console.log(detalle)

    async function handleOpenDetalle(id: string) {
        const row = listaDatos.find(r => r.id === id)
        if (row?.estatus === 'REGISTRADA' && row?.estatus_dependencia === 'MESA_DE_CONTROL_REVISION') {
            setOpen(false)
            setRevisionModalId(id)
        } else {
            setOpen(true)
            setDetalle(null)
            await refetchDetalle(id)
        }
    }

    function handleCloseDetalle() {
        setOpen(false)
        setRevisionModalId(null)
        router.refresh()
    }

    const iniciarRevision = async (endpoint: string) => {
        if (!detalle?.Header?.id_infraccion) return
        setConfirmLoading(true)
        try {
            const response = await fetch(endpoint, {
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

    if (userRole === 'infracciones') {
        console.log('entro aqui')
        const estatus = detalle?.Header?.estatus_dependencia
        console.log(estatus)

        const mostrarBotonInicio = estatus === 'PENDIENTE_DATOS_INFRACTOR'
        const enProceso = estatus === 'PENDIENTE_PAGO_INFRACCION' || estatus === 'PENDIENTE_ENTREGA_GARANTIA' || estatus === 'PENDIENTE_DEVOLUCION_GARANTIA'
        const liberado = estatus === 'LIBERADO_POR_INFRACCIONES'

        return (
            <>
                <InfraccionesDashboard
                    data={listaDatos}
                    visibleColumns={visibleColumns}
                    onOpenDetalle={handleOpenDetalle}
                />

                <ModalDetalleGenerico
                    isOpen={open}
                    onClose={handleCloseDetalle}
                    loading={loading}
                    detalle={detalle}
                    role="infracciones"
                    onRefresh={detalle ? () => refetchDetalle(detalle.Header.id_infraccion) : undefined}
                    antesContenido={
                        mostrarBotonInicio || enProceso ? (
                            <CapturarDatosTitularSection
                                detalle={detalle!}
                                onSuccess={() => refetchDetalle(detalle!.Header.id_infraccion)}
                            />
                        ) : undefined
                    }
                    fullWidthExtra={
                        enProceso && detalle?.Header ? [
                            <RevisionDocumentosSection
                                key="revision-docs"
                                infraccionId={detalle.Header.id_infraccion}
                            />,
                        ] : liberado && detalle?.Header ? [
                            <DocumentosLiberadosSection
                                key="docs-liberados"
                                detalle={detalle}
                            />,
                        ] : undefined
                    }
                    sidebarExtra={
                        detalle?.Header && !mostrarBotonInicio && !liberado ? [
                            enProceso ? (
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
            </>
        )
    }

    if (userRole === 'liberaciones') {
        const estatus = detalle?.Header?.estatus_dependencia
        const estatusInfraccion = detalle?.Header?.estatus
        const mostrarBotonInicio = estatus === 'ESPERA_REVISION'
        const mostrarCapturaInfractor = estatus === 'VEHICULO_EN_CORRALON'
        const enProceso = estatus === 'EN_PROCESO_LIBERACIONES'
        const liberado = estatus === 'LIBERADO_POR_LIBERACIONES'
        console.log(detalle)

        return (
            <>
                <LiberacionesDashboard
                    data={listaDatos}
                    visibleColumns={visibleColumns}
                    onOpenDetalle={handleOpenDetalle}
                />

                {/* MODAL REVISIÓN DOCUMENTOS (MESA_DE_CONTROL_REVISION) */}
                {revisionModalId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#F1F5F9] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-[#E2E8F0] rounded-t-2xl">
                                <h2 className="text-[15px] font-semibold text-[#0F172A]">Revisión de documentos</h2>
                                <button
                                    onClick={() => { setRevisionModalId(null); router.refresh() }}
                                    className="px-4 py-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[13px] font-medium text-[#64748B] transition"
                                >
                                    Cerrar
                                </button>
                            </div>
                            <div className="p-6">
                                <RevisionDocumentosSection
                                    infraccionId={revisionModalId}
                                    onValidated={() => { setRevisionModalId(null); router.refresh() }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <ModalDetalleGenerico
                    isOpen={open}
                    onClose={handleCloseDetalle}
                    loading={loading}
                    detalle={detalle}
                    role="liberaciones"
                    onRefresh={detalle ? () => refetchDetalle(detalle.Header.id_infraccion) : undefined}
                    antesContenido={
                        mostrarBotonInicio ? (
                            <button
                                onClick={() => setConfirmOpen(true)}
                                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-colors"
                                style={{ background: '#F59E0B', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}
                            >
                                <Play size={14} strokeWidth={2.5} fill="white" />
                                Tomar caso
                            </button>
                        ) : undefined
                    }
                    fullWidthExtra={
                        mostrarCapturaInfractor && detalle?.Header ? [
                            <CapturarInfractorSection
                                key="capturar-infractor"
                                infraccionId={detalle.Header.id_infraccion}
                                onSuccess={() => refetchDetalle(detalle.Header.id_infraccion)}
                            />,
                        ] : enProceso && detalle?.Header ? [
                            <RevisionDocumentosSection
                                key="revision-docs"
                                infraccionId={detalle.Header.id_infraccion}
                            />,
                        ] : liberado && detalle?.Header ? [
                            <DocumentosLiberadosSection
                                key="docs-liberados"
                                detalle={detalle}
                            />,
                        ] : undefined
                    }
                    sidebarExtra={
                        detalle?.Header && !mostrarBotonInicio && !liberado ? [
                            enProceso ? (
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
                    onConfirmar={() => iniciarRevision('/api/liberaciones/iniciarProceso')}
                    onCancelar={() => setConfirmOpen(false)}
                    loading={confirmLoading}
                    titulo="Asignar caso"
                    mensaje="¿Deseas tomar este caso? El estatus cambiará a «En Proceso» y se te asignará la atención."
                    labelConfirmar="Sí, tomar caso"
                    labelCancelar="Cancelar"
                    variant="success"
                />
            </>
        )
    }

    if (userRole === 'corralon_mw') {
        const estatus = detalle?.Header?.estatus_dependencia
        const pendiente = estatus === 'LIBERADO_POR_LIBERACIONES'
        const enRevision = estatus === 'EN_REVISION_MW'
        const finalizada = estatus === 'CERRADA'
        const [finalizando, setFinalizando] = useState(false)

        return (
            <>
                <CorralonMWDashboard
                    data={listaDatos}
                    visibleColumns={visibleColumns}
                    onOpenDetalle={handleOpenDetalle}
                />

                <ModalDetalleGenerico
                    isOpen={open}
                    onClose={handleCloseDetalle}
                    loading={loading}
                    detalle={detalle}
                    role="corralon_mejia"
                    onRefresh={detalle ? () => refetchDetalle(detalle.Header.id_infraccion) : undefined}
                    antesContenido={
                        pendiente ? (
                            <button
                                onClick={() => setConfirmOpen(true)}
                                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-colors"
                                style={{ background: '#F59E0B', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}
                            >
                                <Play size={14} strokeWidth={2.5} fill="white" />
                                Tomar caso
                            </button>
                        ) : enRevision ? (
                            <button
                                onClick={async () => {
                                    if (!detalle?.Header?.id_infraccion) return
                                    setFinalizando(true)
                                    try {
                                        const res = await fetch('/api/corralon-mejia/finalizarProceso', {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ id: detalle.Header.id_infraccion }),
                                        })
                                        if (res.ok) refetchDetalle(detalle.Header.id_infraccion)
                                    } finally {
                                        setFinalizando(false)
                                    }
                                }}
                                disabled={finalizando}
                                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-colors disabled:opacity-50"
                                style={{ background: '#22C55E', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}
                            >
                                {finalizando ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <CheckCircle2 size={14} />
                                )}
                                {finalizando ? 'Finalizando...' : 'Finalizar proceso'}
                            </button>
                        ) : undefined
                    }
                    fullWidthExtra={
                        detalle?.Header && (enRevision || finalizada || pendiente) ? [
                            <DocumentosLiberadosSection
                                key="docs-liberados"
                                detalle={detalle}
                            />,
                        ] : undefined
                    }
                    sidebarExtra={
                        detalle?.Header && !pendiente && !finalizada ? [
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
                    onConfirmar={() => iniciarRevision('/api/corralon-mw/iniciarProceso')}
                    onCancelar={() => setConfirmOpen(false)}
                    loading={confirmLoading}
                    titulo="Asignar caso"
                    mensaje="¿Deseas tomar este caso? El estatus cambiará a «En Revisión» y se te asignará la atención."
                    labelConfirmar="Sí, tomar caso"
                    labelCancelar="Cancelar"
                    variant="success"
                />
            </>
        )
    }

    if (userRole === 'corralon_mejia') {
        const estatus = detalle?.Header?.estatus_dependencia
        const pendiente = estatus === 'LIBERADO_POR_LIBERACIONES'
        const enRevision = estatus === 'EN_REVISION_MW'
        const finalizada = estatus === 'CERRADA'
        const [finalizando, setFinalizando] = useState(false)

        return (
            <>
                <CorralonMejiaDashboard
                    data={listaDatos}
                    visibleColumns={visibleColumns}
                    onOpenDetalle={handleOpenDetalle}
                />

                <ModalDetalleGenerico
                    isOpen={open}
                    onClose={handleCloseDetalle}
                    loading={loading}
                    detalle={detalle}
                    role="corralon_mejia"
                    onRefresh={detalle ? () => refetchDetalle(detalle.Header.id_infraccion) : undefined}
                    antesContenido={
                        pendiente ? (
                            <button
                                onClick={() => setConfirmOpen(true)}
                                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-colors"
                                style={{ background: '#F59E0B', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}
                            >
                                <Play size={14} strokeWidth={2.5} fill="white" />
                                Tomar caso
                            </button>
                        ) : enRevision ? (
                            <button
                                onClick={async () => {
                                    if (!detalle?.Header?.id_infraccion) return
                                    setFinalizando(true)
                                    try {
                                        const res = await fetch('/api/corralon-mejia/finalizarProceso', {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ id: detalle.Header.id_infraccion }),
                                        })
                                        if (res.ok) refetchDetalle(detalle.Header.id_infraccion)
                                    } finally {
                                        setFinalizando(false)
                                    }
                                }}
                                disabled={finalizando}
                                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-colors disabled:opacity-50"
                                style={{ background: '#22C55E', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}
                            >
                                {finalizando ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <CheckCircle2 size={14} />
                                )}
                                {finalizando ? 'Finalizando...' : 'Finalizar proceso'}
                            </button>
                        ) : undefined
                    }
                    fullWidthExtra={
                        detalle?.Header && (enRevision || finalizada || pendiente) ? [
                            <DocumentosLiberadosSection
                                key="docs-liberados"
                                detalle={detalle}
                            />,
                        ] : undefined
                    }
                />

                <ConfirmacionModal
                    isOpen={confirmOpen}
                    onConfirmar={() => iniciarRevision('/api/corralon-mejia/iniciarProceso')}
                    onCancelar={() => setConfirmOpen(false)}
                    loading={confirmLoading}
                    titulo="Asignar caso"
                    mensaje="¿Deseas tomar este caso? El estatus cambiará a «En Revisión» y se te asignará la atención."
                    labelConfirmar="Sí, tomar caso"
                    labelCancelar="Cancelar"
                    variant="success"
                />
            </>
        )
    }

    if (userRole === 'fiscalia') {
        const estatus = detalle?.Header?.estatus_dependencia
        console.log(estatus)
        const estatusInfraccion = detalle?.Header?.estatus_de_infraccion
        console.log(estatusInfraccion)
        const pendiente = estatus === 'LIBERADO_POR_LIBERACIONES'
        const enRevision = estatus === 'EN_REVISION_MW'
        const finalizada = estatus === 'CERRADA'
        const [finalizando, setFinalizando] = useState(false)
        console.log(handleCloseDetalle)

        return (
            <>
                <FiscaliaDashboard
                    data={listaDatos}
                    visibleColumns={visibleColumns}
                    onOpenDetalle={handleOpenDetalle}
                />

            </>
        )
    }

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

// ─── DOCUMENTOS LIBERADOS ───

function DocumentosLiberadosSection({ detalle }: { detalle: DetalleCompleto }) {
    const h = detalle.Header;
    const [docsLiberacion, setDocsLiberacion] = useState<{ tipo: string; label: string; url: string }[]>([]);
    const [loadingLiberacion, setLoadingLiberacion] = useState(true);
    const [descargandoOrden, setDescargandoOrden] = useState(false);

    const handleDownloadOrden = async () => {
        if (!h?.id_infraccion) return;
        setDescargandoOrden(true);
        try {
            const res = await fetch(`/api/liberaciones/descargarOrden/${h.id_infraccion}`);
            if (!res.ok) throw new Error('Error al generar la orden');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const folio = h.folio_de_infraccion?.replace(/[^a-zA-Z0-9_-]/g, '_') || h.id_infraccion;
            a.download = `orden_salida_${folio}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('[DESCARGAR ORDEN]', error);
        } finally {
            setDescargandoOrden(false);
        }
    };

    useEffect(() => {
        if (!h?.id_infraccion) return;
        fetch(`/api/liberaciones/documentos/${h.id_infraccion}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data?.solicitud) {
                    const map: Record<string, string> = {
                        factura: 'Factura',
                        ine_titular: 'INE del Titular',
                        ine_representante_legal: 'INE del Rep. Legal',
                        comprobante_domicilio: 'Comprobante de Domicilio',
                        tarjeta_circulacion: 'Tarjeta de Circulación',
                        oficio_liberacion_fiscalia: 'Oficio Lib. Fiscalía',
                        oficio_liberacion_juzgado: 'Oficio Lib. Juzgado Cívico',
                        poder_notarial: 'Poder Notarial',
                        constancia_situacion_fiscal: 'Cte. Situación Fiscal',
                    };
                    setDocsLiberacion(
                        (data.documentos || []).map((d: any) => ({
                            tipo: d.tipo,
                            label: map[d.tipo] || d.tipo,
                            url: d.url,
                        })),
                    );
                }
            })
            .catch(() => { })
            .finally(() => setLoadingLiberacion(false));
    }, [h?.id_infraccion]);


    console.log(docsLiberacion)
    const rawDocs: ({ name: string; url: string; icon: React.ReactNode } | null)[] = [
        h?.url_ine && h.url_ine !== 'NO_DATA' ? { name: 'INE', url: h.url_ine, icon: <FileText size={14} /> } : null,
        h?.url_inapam && h.url_inapam !== 'NO_DATA' ? { name: 'INAPAM', url: h.url_inapam, icon: <FileText size={14} /> } : null,
        h?.url_tarjeta_circulacion && h.url_tarjeta_circulacion !== 'NO_DATA' ? { name: 'Tarjeta de Circulación', url: h.url_tarjeta_circulacion, icon: <FileText size={14} /> } : null,
    ];
    const docs = rawDocs.filter(Boolean) as { name: string; url: string; icon: React.ReactNode }[];

    const evidencias = (h?.url_evidencias ?? []).map((url, i) => ({
        name: `Evidencia ${i + 1}`,
        url,
        icon: <FileText size={14} />,
    }));

    const allDocs = [...docs, ...evidencias];

    const tieneLiberacion = docsLiberacion.length > 0;

    return (
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#DCFCE7' }}>
                    <ShieldCheck size={17} className="text-[#16A34A]" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-[#0F172A] tracking-tight">Historial de Documentación</h3>
                    <p className="text-[12px] text-[#64748B]">Infracción liberada por liberaciones</p>
                </div>
                <button
                    onClick={handleDownloadOrden}
                    disabled={descargandoOrden}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-all duration-150 shrink-0 disabled:opacity-50"
                    style={{ background: '#2563EB' }}
                    onMouseEnter={(e) => { if (!descargandoOrden) e.currentTarget.style.background = '#1D4ED8'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#2563EB'; }}
                >
                    <Download size={14} />
                    {descargandoOrden ? 'Generando...' : 'Descargar Orden de Salida'}
                </button>
            </div>

            <div className="p-5 space-y-6">

                {/* DOCUMENTOS DE LA INFRACCIÓN */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <FileText size={14} className="text-[#64748B]" />
                        <h4 className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider">
                            Documentos de la infracción
                        </h4>
                    </div>
                    {allDocs.length === 0 ? (
                        <p className="text-[13px] text-[#94A3B8]">Sin documentos adjuntos</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {allDocs.map((doc) => {
                                const esOficio = doc.name === 'Oficio de Liberación';
                                return (
                                    <div
                                        key={doc.name}
                                        className="flex items-center gap-3 p-3 rounded-lg border transition-colors"
                                        style={{
                                            background: esOficio ? '#F0FDF4' : '#F8FAFC',
                                            borderColor: esOficio ? '#BBF7D0' : '#E2E8F0',
                                        }}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ background: esOficio ? '#DCFCE7' : '#EFF6FF' }}
                                        >
                                            <span className={esOficio ? 'text-[#16A34A]' : 'text-[#2563EB]'}>{doc.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-medium text-[#0F172A] truncate">{doc.name}</p>
                                            <p className="text-[11px] text-[#94A3B8]">Digital</p>
                                        </div>
                                        <button
                                            onClick={() => abrirDocumento(doc.url)}
                                            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-colors"
                                            style={{ background: '#2563EB' }}
                                        >
                                            <Eye size={11} />
                                            Ver
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* DOCUMENTOS DEL CIUDADANO */}
                {tieneLiberacion && (
                    <>
                        <div className="h-px bg-[#E2E8F0]" />
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <FileText size={14} className="text-[#F59E0B]" />
                                <h4 className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider">
                                    Documentos subidos por el ciudadano
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {docsLiberacion.map((doc) => (
                                    <div
                                        key={doc.tipo}
                                        className="flex items-center gap-3 p-3 rounded-lg border transition-colors"
                                        style={{
                                            background: '#FFFBEB',
                                            borderColor: '#FDE68A',
                                        }}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ background: '#FEF3C7' }}
                                        >
                                            <FileText size={14} className="text-[#D97706]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-medium text-[#0F172A] truncate">{doc.label}</p>
                                            <p className="text-[11px] text-[#94A3B8]">Liberación</p>
                                        </div>
                                        <button
                                            onClick={() => abrirDocumento(doc.url)}
                                            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-colors"
                                            style={{ background: '#F59E0B' }}
                                        >
                                            <Eye size={11} />
                                            Ver
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* OFICIO DESTACADO */}
                {h?.url_oficio_fiscalia && h.url_oficio_fiscalia !== 'NO_DATA' && (
                    <>
                        <>
                            <div className="h-px bg-[#E2E8F0]" />
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText size={14} className="text-[#F59E0B]" />
                                    <h4 className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider">
                                        Documentos externos
                                    </h4>
                                </div>
                                <DocOficioRow
                                    numeroOficio={h.no_oficio_fiscalia}
                                    urlOficio={h.url_oficio_fiscalia}
                                />
                            </div>
                        </>


                    </>
                )}
            </div>
        </div>
    );
}

function DocOficioRow({ numeroOficio, urlOficio }: { numeroOficio?: string; urlOficio?: string }) {
    return (
        <div className="rounded-xl border border-[#22C55E]/50 bg-[#F0FDF4] p-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#DCFCE7' }}>
                    <ScrollText size={18} className="text-[#16A34A]" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#0F172A]">Oficio de Liberación</p>
                    <p className="text-[11px] text-[#64748B]">
                        No. {numeroOficio && numeroOficio !== 'NO_DATA' ? numeroOficio : '—'}
                    </p>
                </div>
                {urlOficio && (
                    <button
                        onClick={() => abrirDocumento(urlOficio)}
                        className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-colors"
                        style={{ background: '#22C55E' }}
                    >
                        <Eye size={13} />
                        Ver oficio
                    </button>
                )}
            </div>
        </div>
    );
}
