'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import CorralonMWDashboard from "./CorralonMWDashboard"
import SubirComprobanteModal from "./SubirComprobanteModal"

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

interface CorralonMWTableProps {
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

export default function CorralonMWTable({ respuestaServidor }: CorralonMWTableProps) {
    const router = useRouter()
    const [comprobanteId, setComprobanteId] = useState<string | null>(null)

    const listaDatos = respuestaServidor?.data ?? []

    function handleOpenComprobante(id: string) {
        setComprobanteId(id)
    }

    function handleCloseComprobante() {
        setComprobanteId(null)
        router.refresh()
    }

    return (
        <>
            <CorralonMWDashboard
                data={listaDatos}
                visibleColumns={columns}
                onSubirComprobante={handleOpenComprobante}
            />

            {comprobanteId && (
                <SubirComprobanteModal
                    idInfraccion={comprobanteId}
                    onClose={handleCloseComprobante}
                    onSuccess={handleCloseComprobante}
                />
            )}
        </>
    )
}
