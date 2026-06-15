'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Play, CheckCircle2, Loader2, X } from "lucide-react"
import JuzgadoDashboard from "./JuzgadoDashboard"
import ModalDetalleGenerico, { DetalleCompleto } from "@/features/compartido/components/ModalDetalleGenerico"
import ConfirmacionModal from "@/features/compartido/components/ConfirmacionModal"
import CargarOficioSection from "@/features/compartido/components/CargarOficioSection"
import OficioLiberacionSection from "@/features/compartido/components/OficioLiberacionSection"
import DocumentosLiberadosSection from "@/features/compartido/components/DocumentosLiberadosSection"

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

interface JuzgadoTableProps {
    respuestaServidor: {
        data: DataRow[]
        total: number
    }
}

const columns = [
    { key: "folio", label: "Folio" },
    { key: "nombre_infractor", label: "Nombre Infractor" },
    { key: "correo_infractor", label: "Correo" },
    { key: "placa", label: "Placa" },
    { key: "estatus", label: "Estatus" },
    { key: "acciones", label: "Acciones" },
]

export default function JuzgadoTable({ respuestaServidor }: JuzgadoTableProps) {
    const router = useRouter()
    console.log(respuestaServidor)

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [detalle, setDetalle] = useState<DetalleCompleto | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)
    const [finalizando, setFinalizando] = useState(false)
    const [oficioFormId, setOficioFormId] = useState<string | null>(null)
    const [oficioFormData, setOficioFormData] = useState<DetalleCompleto | null>(null)
    const [loadingOficioForm, setLoadingOficioForm] = useState(false)

    const listaDatos = respuestaServidor?.data ?? []

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

    async function handleOpenOficioForm(id: string) {
        setLoadingOficioForm(true)
        try {
            const res = await fetch(`/api/depInfracciones/detalleInfraccion/${id}`)
            if (!res.ok) throw new Error('Error al obtener el detalle')
            const json = await res.json()
            setOficioFormData(json.data)
            setOficioFormId(id)
        } catch (error) {
            console.error('Error cargando oficio:', error)
        } finally {
            setLoadingOficioForm(false)
        }
    }

    function handleCloseOficioForm() {
        setOficioFormId(null)
        setOficioFormData(null)
        router.refresh()
    }

    function handleCloseDetalle() {
        setOpen(false)
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

    const estatus = detalle?.Header?.estatus_dependencia
    const pendiente = estatus === 'RETENIDO_POR_ACCIDENTE_PENDIENTE_OFICIO'
    const enRevision = estatus === 'EN_PROCESO_JUZGADO'
    const finalizada = estatus === 'LIBERADO_POR_JUZGADO'

    return (
        <>
            <JuzgadoDashboard
                data={listaDatos}
                visibleColumns={columns}
                onOpenDetalle={handleOpenDetalle}
                onCargarOficio={handleOpenOficioForm}
            />

            <ModalDetalleGenerico
                isOpen={open}
                onClose={handleCloseDetalle}
                loading={loading}
                detalle={detalle}
                role="juzgado_civico"
                onRefresh={detalle ? () => refetchDetalle(detalle.Header.id_infraccion) : undefined}
                antesContenido={
                    pendiente ? (
                        <button
                            onClick={() => setConfirmOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-colors"
                            style={{ background: '#8B5CF6', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}
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
                                    const res = await fetch('/api/juzgado/finalizarProceso', {
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
                                guardarOficioEndpoint="/api/juzgado/guardarOficio"
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
                onConfirmar={() => iniciarRevision('/api/juzgado/iniciarProceso')}
                onCancelar={() => setConfirmOpen(false)}
                loading={confirmLoading}
                titulo="Asignar caso"
                mensaje="¿Deseas tomar este caso? El estatus cambiará a «En Proceso» y se te asignará la atención."
                labelConfirmar="Sí, tomar caso"
                labelCancelar="Cancelar"
                variant="success"
            />

            {oficioFormId && oficioFormData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-[#E2E8F0] rounded-t-2xl">
                            <h2 className="text-[15px] font-semibold text-[#0F172A]">Cargar oficio</h2>
                            <button
                                onClick={handleCloseOficioForm}
                                className="p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors"
                            >
                                <X size={16} className="text-[#64748B]" />
                            </button>
                        </div>
                        <div className="p-6">
                            <CargarOficioSection
                                idInfraccion={oficioFormId}
                                noOficioActual={oficioFormData.Header.no_oficio_fiscalia}
                                noCarpetaActual={oficioFormData.Header.no_carpeta_investigacion}
                                esTitular={oficioFormData.datos_infractor?.es_titular}
                                nombreInfractor={oficioFormData.datos_infractor?.nombre_infractor}
                                appaternoInfractor={oficioFormData.datos_infractor?.appaterno_infractor}
                                apmaternoInfractor={oficioFormData.datos_infractor?.apmaterno_infractor}
                                correoInfractor={oficioFormData.datos_infractor?.correo_infractor}
                                curpInfractor={oficioFormData.datos_infractor?.curp_infractor}
                                guardarOficioEndpoint="/api/juzgado/guardarOficio"
                                onSuccess={handleCloseOficioForm}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
