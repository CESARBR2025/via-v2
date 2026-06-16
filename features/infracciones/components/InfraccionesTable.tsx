'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import InfraccionesDashboard from "./InfraccionesDashboard"
import ModalDetalleGenerico, { DetalleCompleto } from "@/features/compartido/components/ModalDetalleGenerico"
import CapturarDatosTitularSection from "./CapturarDatosTitularSection"
import RevisionDocumentosSection from "@/features/liberaciones/components/RevisionDocumentosSection"
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

interface InfraccionesTableProps {
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

export default function InfraccionesTable({ respuestaServidor }: InfraccionesTableProps) {
    const router = useRouter()

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [detalle, setDetalle] = useState<DetalleCompleto | null>(null)
    const [revisionModalId, setRevisionModalId] = useState<string | null>(null)

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

    const estatus = detalle?.Header?.estatus_dependencia
    const mostrarBotonInicio = estatus === 'PENDIENTE_DATOS_INFRACTOR'
    const enProceso = estatus === 'PENDIENTE_PAGO_INFRACCION' || estatus === 'PENDIENTE_ENTREGA_GARANTIA' || estatus === 'PENDIENTE_DEVOLUCION_GARANTIA'
    const liberado = estatus === 'LIBERADO_POR_INFRACCIONES'

    return (
        <>
            <InfraccionesDashboard
                data={listaDatos}
                visibleColumns={columns}
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
