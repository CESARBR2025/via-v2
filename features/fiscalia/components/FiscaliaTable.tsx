'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import FiscaliaDashboard from "./FiscaliaDashboard"
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

interface FiscaliaTableProps {
    respuestaServidor: {
        data: DataRow[]
        total: number
    }
}

const columns = [
    { key: "folio", label: "Folio" },
    { key: "nombre_infractor", label: "Nombre Infractor" },
    { key: "placa", label: "Placa" },
    { key: "estatus", label: "Estatus" },
    { key: "acciones", label: "Acciones" },
]

export default function FiscaliaTable({ respuestaServidor }: FiscaliaTableProps) {
    const router = useRouter()
    const listaDatos = respuestaServidor?.data ?? []

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [detalle, setDetalle] = useState<InfraccionDetalle | null>(null)

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

    function handleOpenDetalle(id: string) {
        setOpen(true)
        setDetalle(null)
        refetchDetalle(id)
    }

    function handleCloseDetalle() {
        setOpen(false)
        setDetalle(null)
        router.refresh()
    }

    return (
        <>
            <FiscaliaDashboard
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
