'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Play, CheckCircle2, Loader2 } from "lucide-react"
import FiscaliaDashboard from "@/features/fiscalia/components/FiscaliaDashboard"
import CargarOficioSection from "@/features/compartido/components/CargarOficioSection"
import OficioLiberacionSection from "@/features/compartido/components/OficioLiberacionSection"
import DocumentosLiberadosSection from "@/features/compartido/components/DocumentosLiberadosSection"
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


