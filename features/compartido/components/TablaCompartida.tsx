'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Loader2 } from "lucide-react" // Opcional para un look premium
import { ModalDetalleInfraccionDtoInfracciones } from "@/features/depInfracciones/components/TablaDevInfracciones/ModalDetallesInfraccion"
import { InfraccionDetalle } from "@/features/buscadorGlobal/components/ModalDetallesPublico"
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
    // Pasamos el rol obtenido desde el servidor como prop
    userRole: string | undefined
}

const columns = [
    { key: "folio", label: "Folio", roles: ["dependencia_externa", "MANAGER", "USER"] },
    { key: "nombre_infractor", label: "Nombre Infractor", roles: ["dependencia_externa", "MANAGER", "USER"] },
    { key: "correo_infractor", label: "Correo", roles: ["dependencia_externa", "MANAGER", "USER"] },
    { key: "placa", label: "Placa", roles: ["dependencia_externa", "MANAGER"] },
    { key: "estatus", label: "Estatus", roles: ["dependencia_externa", "MANAGER", "USER"] },
    { key: "acciones", label: "Acciones", roles: ["dependencia_externa", "MANAGER", "USER"] },
]

export default function TablaCompartida({ respuestaServidor, userRole }: TablaCompartidaProps) {
    const router = useRouter()

    // --- ESTADOS LOCALES DEL MODAL (Controlados 100% por la tabla) ---
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [detalle, setDetalle] = useState<InfraccionDetalle | null>(null)

    if (!userRole) {
        return <div className="text-red-500 font-medium p-4">Error: No tienes un rol asignado.</div>
    }

    const listaDatos = respuestaServidor?.data ?? []
    const visibleColumns = columns.filter((column) => column.roles.includes(userRole))

    // --- LÓGICA DE CONTROL DEL MODAL ---
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
        setDetalle(null) // Evita parpadeo de datos anteriores
        await refetchDetalle(id)
    }

    function handleCloseDetalle() {
        setOpen(false)
        router.refresh() // Sincroniza mutaciones externas si las hubiera
    }

    return (
        <div className="p-4">
            <p className="mb-4 font-semibold text-slate-700">
                Rol actual: <span className="text-blue-600">{userRole}</span>
                <span className="ml-4 text-xs text-slate-400">(Total: {respuestaServidor?.total ?? 0})</span>
            </p>

            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            {visibleColumns.map((column) => (
                                <th key={column.key} className="px-6 py-3 font-medium text-slate-500 uppercase tracking-wider text-xs">
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {listaDatos.length === 0 ? (
                            <tr>
                                <td colSpan={visibleColumns.length} className="px-6 py-8 text-center text-slate-400">
                                    No hay registros disponibles.
                                </td>
                            </tr>
                        ) : (
                            listaDatos.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                    {visibleColumns.map((column) => (
                                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-slate-700">
                                            {(() => {
                                                // RENDER DE LA COLUMNA DE ACCIONES
                                                if (column.key === "acciones") {
                                                    return (
                                                        <button
                                                            onClick={() => handleOpenDetalle(row.id)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                                                        >
                                                            <Eye size={14} className="text-slate-400" />
                                                            Ver detalle
                                                        </button>
                                                    )
                                                }

                                                const cellValue = row[column.key];

                                                if (column.key === "created_at" && cellValue) {
                                                    return new Date(cellValue).toLocaleDateString()
                                                }

                                                return cellValue ?? "-"
                                            })()}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* EL MODAL VIVE E INTERACTÚA INTERNAMENTE AQUÍ */}
            {open && (
                <ModalDetalleInfraccionDtoInfracciones
                    isOpen={open}
                    onClose={handleCloseDetalle}
                    loading={loading}
                    detalle={detalle}
                    onRefresh={detalle ? () => refetchDetalle(detalle.Header.id_infraccion) : undefined}
                />
            )}
        </div>
    )
}