'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Play, CheckCircle2, Loader2 } from "lucide-react"
import CargarOficioSection from "@/features/compartido/components/CargarOficioSection"
import OficioLiberacionSection from "@/features/compartido/components/OficioLiberacionSection"
import DocumentosLiberadosSection from "@/features/compartido/components/DocumentosLiberadosSection"
import CorralonMWDashboard from "@/features/corralon-mw/components/CorralonMWDashboard"
import ModalDetalleGenerico, { DetalleCompleto } from "@/features/compartido/components/ModalDetalleGenerico"
import ConfirmacionModal from "@/features/compartido/components/ConfirmacionModal"

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
                                    folio={detalle.Header.folio_de_infraccion}
                                    noOficioActual={detalle.Header.no_oficio_fiscalia}
                                    noCarpetaActual={detalle.Header.no_carpeta_investigacion}
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

}


