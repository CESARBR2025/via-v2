'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import InfraccionesDashboard from "./InfraccionesDashboard"
import { DetalleInfraccionModal, type InfraccionDetalle } from "@/features/depInfracciones/components/TablaDevInfracciones/DetalleInfraccionModal"

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
    const listaDatos = respuestaServidor?.data ?? []

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [detalle, setDetalle] = useState<InfraccionDetalle | null>(null)

    async function fetchDetalle(id: string) {
        setLoading(true)
        setDetalle(null)
        try {
            const res = await fetch(`/api/depInfracciones/detalleInfraccion/${id}`)
            if (!res.ok) throw new Error('Error al obtener el detalle de la infracción')
            const json = await res.json()
            setDetalle(json.data)
        } catch (error) {
            console.error('Error en el fetchDetalle:', error)
        } finally {
            setLoading(false)
        }
    }

    function handleOpenDetalle(id: string) {
        setOpen(true)
        fetchDetalle(id)
    }

    function handleCloseDetalle() {
        setOpen(false)
        setDetalle(null)
        router.refresh()
    }

    return (
        <>
            <InfraccionesDashboard
                data={listaDatos}
                visibleColumns={columns}
                onOpenDetalle={handleOpenDetalle}
            />

            <DetalleInfraccionModal
                isOpen={open}
                onClose={handleCloseDetalle}
                loading={loading}
                detalle={detalle}
            />
        </>
    )
}
