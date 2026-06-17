'use client'

import { BotonVerDetalle } from '@/features/compartido/components/ButtonVerDetalles'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, RefreshCw, CheckCircle2, AlertCircle, Search, User, DollarSign, Shield, Loader2, Zap } from 'lucide-react'
import type { DetalleCompleto } from '@/features/compartido/types/detalleInfraccion'
import CapturarDatosTitularSection from './CapturarDatosTitularSection'
import ModalEntregarGarantia from './ModalEntregarGarantia'
import { stat } from 'fs'

const AVATAR_COLORS = [
    { bg: '#EFF6FF', text: '#2563EB' },
    { bg: '#FEF3C7', text: '#D97706' },
    { bg: '#DCFCE7', text: '#16A34A' },
    { bg: '#FEE2E2', text: '#DC2626' },
    { bg: '#F3E8FF', text: '#9333EA' },
    { bg: '#FCE7F3', text: '#DB2777' },
    { bg: '#E0F2FE', text: '#0284C7' },
    { bg: '#F0FDFA', text: '#0F766E' },
]

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 0 || !name.trim()) return '?'
    if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase()
    return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase()
}

function hashColor(str: string, palette: typeof AVATAR_COLORS) {
    let hash = 0
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
    return palette[Math.abs(hash) % palette.length]
}

interface Props {
    data: any[]
    visibleColumns: any[]
    onOpenDetalle: (id: string) => void
    onRefresh?: () => void
}

type EstatusInfracciones =
    | 'PENDIENTE_DATOS_INFRACTOR'
    | 'PENDIENTE_PAGO_INFRACCION'
    | 'PENDIENTE_DEVOLUCION_GARANTIA'
    | 'LIBERADO_POR_INFRACCIONES'
    | 'LIBERADA_INFRACCIONES_INSTANTE'

const STATUS_TABS: { key: EstatusInfracciones; label: string; icon: typeof Clock; color: string; accent: string; bg: string }[] = [
    { key: 'PENDIENTE_DATOS_INFRACTOR', label: 'Capturar datos Pendientes', icon: Clock, color: '#F59E0B', accent: '#92400E', bg: '#FFFBEB' },
    { key: 'PENDIENTE_PAGO_INFRACCION', label: 'Pago de Ciudadano Pendiente', icon: DollarSign, color: '#F97316', accent: '#9A3412', bg: '#FFF7ED' },
    { key: 'PENDIENTE_DEVOLUCION_GARANTIA', label: 'Devolucion de Garantia Pendiente', icon: RefreshCw, color: '#22C55E', accent: '#166534', bg: '#F0FDF4' },
    { key: 'LIBERADO_POR_INFRACCIONES', label: 'Infracciones cerradas', icon: CheckCircle2, color: '#3B82F6', accent: '#1E40AF', bg: '#EFF6FF' },
    { key: 'LIBERADA_INFRACCIONES_INSTANTE', label: 'Pagadas al instante', icon: Zap, color: '#06B6D4', accent: '#155E75', bg: '#ECFEFF' },
]

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    PENDIENTE_DATOS_INFRACTOR: { bg: '#FEF3C7', text: '#78350F', dot: '#F59E0B', label: 'Sin datos' },
    PENDIENTE_PAGO_INFRACCION: { bg: '#FFF7ED', text: '#9A3412', dot: '#F97316', label: 'Pendiente pago' },
    PENDIENTE_DEVOLUCION_GARANTIA: { bg: '#DCFCE7', text: '#166534', dot: '#22C55E', label: 'Pagada' },
    LIBERADO_POR_INFRACCIONES: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'Liberada' },
    LIBERADA_INFRACCIONES_INSTANTE: { bg: '#CFFAFE', text: '#155E75', dot: '#06B6D4', label: 'Pagada instante' },
}

function getBadge(status: string) {

    return STATUS_BADGE[status] ?? { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8', label: status }
}

function isNoData(v: string | null | undefined): boolean {
    return !v || v === 'NO_DATA' || v.trim() === ''
}

function dataCompleta(row: any): boolean {
    if (row.estatusInfraccion === 'CERRADA' && row.estatusDependencia === 'LIBERADA_INFRACCIONES_INSTANTE') {
        return !isNoData(row.nombre_infractor)
    }
    const nombre = row.nombre_infractor ?? ''
    const titular = row.nombre_titular_liberacion ?? ''
    return !isNoData(nombre) && !isNoData(titular)
}

function isPagada(row: any): boolean {
    return row.estatus_orden_pago === 'P' || row.estatus_orden_pago === 'PAGADA'
}

function esLiberada(row: any): boolean {
    return row.estatusInfraccion === 'CERRADA' && row.estatusDependencia === 'LIBERADO_POR_INFRACCIONES'
}

function esPagadaInstante(row: any): boolean {
    return row.estatusInfraccion === 'CERRADA' && row.estatusDependencia === 'LIBERADA_INFRACCIONES_INSTANTE'
}

function esPendientePago(row: any): boolean {
    return row.estatusInfraccion === 'PENDIENTE_PAGO' && row.estatusDependencia === 'PENDIENTE_PAGO_INFRACCION'
}

function necesitaCapturaDatos(row: any): boolean {
    return row.estatusInfraccion === 'REGISTRADA' && row.estatusDependencia === 'PENDIENTE_DATOS_INFRACTOR'
}

function necesitaDevolucionGarantia(row: any): boolean {
    return row.estatusInfraccion === 'PAGADA' && row.estatusDependencia === 'PENDIENTE_DEVOLUCION_GARANTIA'
}

export default function InfraccionesDashboard({
    data,
    visibleColumns,
    onOpenDetalle,
    onRefresh,
}: Props) {
    const router = useRouter()
    const [filtro, setFiltro] = useState<EstatusInfracciones>('PENDIENTE_DATOS_INFRACTOR')

    const [capturarDatosDetalle, setCapturarDatosDetalle] = useState<DetalleCompleto | null>(null)
    const [capturarDatosLoading, setCapturarDatosLoading] = useState(false)
    const [devolucionGarantiaDetalle, setDevolucionGarantiaDetalle] = useState<DetalleCompleto | null>(null)
    const [devolucionGarantiaLoading, setDevolucionGarantiaLoading] = useState(false)

    async function handleCapturarDatos(id: string) {
        setCapturarDatosDetalle(null)
        setCapturarDatosLoading(true)
        try {
            const res = await fetch(`/api/depInfracciones/detalleInfraccion/${id}`)
            if (!res.ok) throw new Error('Error al obtener el detalle')
            const json = await res.json()
            setCapturarDatosDetalle(json.data)
        } catch (error) {
            console.error('Error fetching detail for captura:', error)
        } finally {
            setCapturarDatosLoading(false)
        }
    }

    function handleCapturarDatosSuccess() {
        setCapturarDatosDetalle(null)
        router.refresh()
    }

    async function handleDevolucionGarantia(id: string) {
        setDevolucionGarantiaDetalle(null)
        setDevolucionGarantiaLoading(true)
        try {
            const res = await fetch(`/api/depInfracciones/detalleInfraccion/${id}`)
            if (!res.ok) throw new Error('Error al obtener el detalle')
            const json = await res.json()
            setDevolucionGarantiaDetalle(json.data)
        } catch (error) {
            console.error('Error fetching detail for devolucion garantia:', error)
        } finally {
            setDevolucionGarantiaLoading(false)
        }
    }

    function handleDevolucionGarantiaSuccess() {
        setDevolucionGarantiaDetalle(null)
        router.refresh()
    }

    const estadisticas = useMemo(() => {
        const pendientesCapturarDatos = data.filter(x => x.estatusInfraccion === 'REGISTRADA' && x.estatusDependencia === 'PENDIENTE_DATOS_INFRACTOR').length
        const pendientePagoCiudadano = data.filter(x => x.estatusInfraccion === 'PENDIENTE_PAGO' && x.estatusDependencia === 'PENDIENTE_PAGO_INFRACCION').length
        const pendienteDevolucionGarantia = data.filter(x => x.estatusInfraccion === 'PAGADA' && x.estatusDependencia === 'PENDIENTE_DEVOLUCION_GARANTIA').length
        const infraccionesCerradas = data.filter(
            x =>
                x.estatusInfraccion === 'CERRADA' &&
                (
                    x.estatusDependencia === 'LIBERADO_POR_INFRACCIONES'

                )
        ).length;

        const infraccionesPagadasInstante = data.filter(
            x =>
                x.estatusInfraccion === 'CERRADA' &&
                (
                    x.estatusDependencia === 'LIBERADA_INFRACCIONES_INSTANTE'

                )
        ).length;

        return { pendientes: pendientesCapturarDatos, pendientePagoCiudadano, pagadas: pendienteDevolucionGarantia, liberadas: infraccionesCerradas, infraccionesPagadasInstante }
    }, [data])

    const total = estadisticas.pendientes + estadisticas.pendientePagoCiudadano + estadisticas.pagadas + estadisticas.liberadas + estadisticas.infraccionesPagadasInstante

    const registrosFiltrados = useMemo(() => {
        switch (filtro) {
            case 'PENDIENTE_DATOS_INFRACTOR':
                return data.filter(x => x.estatusInfraccion === 'REGISTRADA' && x.estatusDependencia === 'PENDIENTE_DATOS_INFRACTOR')
            case 'PENDIENTE_PAGO_INFRACCION':
                return data.filter(x => x.estatusInfraccion === 'PENDIENTE_PAGO' && x.estatusDependencia === 'PENDIENTE_PAGO_INFRACCION')
            case 'PENDIENTE_DEVOLUCION_GARANTIA':
                return data.filter(x => x.estatusInfraccion === 'PAGADA' && x.estatusDependencia === 'PENDIENTE_DEVOLUCION_GARANTIA')
            case 'LIBERADO_POR_INFRACCIONES':
                return data.filter(x => x.estatusInfraccion === 'CERRADA' && x.estatusDependencia === 'LIBERADO_POR_INFRACCIONES')
            case 'LIBERADA_INFRACCIONES_INSTANTE':
                return data.filter(x => x.estatusInfraccion === 'CERRADA' && x.estatusDependencia === 'LIBERADA_INFRACCIONES_INSTANTE')
            default:
                return []
        }

    }, [data, filtro])

    const STATS_KEY: Record<EstatusInfracciones, keyof typeof estadisticas> = {
        PENDIENTE_DATOS_INFRACTOR: 'pendientes',
        PENDIENTE_PAGO_INFRACCION: 'pendientePagoCiudadano',
        PENDIENTE_DEVOLUCION_GARANTIA: 'pagadas',
        LIBERADO_POR_INFRACCIONES: 'liberadas',
        LIBERADA_INFRACCIONES_INSTANTE: 'infraccionesPagadasInstante',
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-[22px] font-bold text-[#0F172A] tracking-tight">Panel Infracciones</h2>
                        <p className="text-[14px] text-[#64748B] mt-0.5">
                            {total} infracción{total !== 1 ? 'es' : ''} registradas
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
                        <Search size={14} strokeWidth={1.8} className="text-[#94A3B8]" />
                        <span className="text-[12px] font-medium text-[#94A3B8]">Filtrar por estatus</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {STATUS_TABS.map(tab => {
                        const count = estadisticas[STATS_KEY[tab.key]]
                        const activo = filtro === tab.key
                        const Icon = tab.icon

                        return (
                            <button
                                key={tab.key}
                                onClick={() => setFiltro(tab.key)}
                                className="relative rounded-xl border p-5 text-left transition-all duration-200"
                                style={{
                                    background: activo ? tab.bg : '#FFFFFF',
                                    borderColor: activo ? tab.color : '#E2E8F0',
                                    boxShadow: activo
                                        ? `0 4px 12px ${tab.color}22, 0 1px 2px rgba(0,0,0,0.04)`
                                        : '0 1px 2px rgba(0,0,0,0.04)',
                                }}
                            >
                                {activo && (
                                    <span
                                        className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                                        style={{ background: tab.color }}
                                    />
                                )}

                                <div className="flex items-start justify-between mb-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ background: tab.bg }}
                                    >
                                        <Icon size={18} strokeWidth={2} style={{ color: tab.color }} />
                                    </div>
                                    <span className="text-[11px] font-semibold tracking-wider" style={{ color: tab.color }}>
                                        {activo ? 'ACTIVO' : ''}
                                    </span>
                                </div>

                                <p className="text-[12px] font-semibold tracking-wider uppercase" style={{ color: '#64748B' }}>
                                    {tab.label}
                                </p>
                                <div className="flex items-baseline gap-2 mt-0.5">
                                    <span className="text-[30px] font-bold tracking-tight" style={{ color: '#0F172A' }}>
                                        {count}
                                    </span>
                                    <span className="text-[13px] font-medium" style={{ color: '#94A3B8' }}>
                                        / {total}
                                    </span>
                                </div>

                                {count > 0 && (
                                    <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${(count / total) * 100}%`, background: tab.color }}
                                        />
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>

                <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
                    <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: '#F1F5F9', background: '#F8FAFC' }}>
                        <div className="flex items-center gap-2.5">
                            {(() => {
                                const tab = STATUS_TABS.find(t => t.key === filtro)
                                const iconColor = tab?.color ?? '#F59E0B'
                                return (
                                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: iconColor }}>
                                        <AlertCircle size={12} strokeWidth={2.5} className="text-white" />
                                    </div>
                                )
                            })()}
                            <h3 className="text-[13px] font-semibold tracking-wider uppercase" style={{ color: STATUS_TABS.find(t => t.key === filtro)?.color ?? '#F59E0B' }}>
                                {STATUS_TABS.find(t => t.key === filtro)?.label ?? 'Infracciones'}
                            </h3>
                        </div>
                        <span className="text-[12px] font-medium" style={{ color: '#94A3B8' }}>
                            {registrosFiltrados.length} registro{registrosFiltrados.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div key={filtro} className="overflow-x-auto">
                        <table className="w-full text-[13px]">
                            <thead>
                                <tr>
                                    {visibleColumns.map(column => (
                                        <th
                                            key={column.key}
                                            className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                                            style={{ color: '#64748B', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}
                                        >
                                            {column.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {registrosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={visibleColumns.length} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertCircle size={22} strokeWidth={1.5} className="text-[#CBD5E1]" />
                                                <p className="text-[14px] font-medium text-[#94A3B8]">No hay registros</p>
                                                <p className="text-[12px] text-[#CBD5E1]">No existen infracciones con este estatus.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    registrosFiltrados.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="transition-colors hover:bg-[#F8FAFC]"
                                            style={{ borderBottom: '1px solid #F1F5F9' }}
                                        >
                                            {visibleColumns.map(column => {
                                                if (column.key === 'acciones') {
                                                    return (
                                                        <td key={column.key} className="px-4 py-2.5">
                                                            <div className="flex items-center gap-2">
                                                                <BotonVerDetalle
                                                                    idInfraccion={row.id}
                                                                    onOpenDetalle={onOpenDetalle}
                                                                />
                                                                {necesitaCapturaDatos(row) && (
                                                                    <button
                                                                        onClick={() => handleCapturarDatos(row.id)}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-800 transition-colors shadow-sm"
                                                                    >
                                                                        <User size={14} className="text-blue-500" />
                                                                        Capturar datos
                                                                    </button>
                                                                )}
                                                                {necesitaDevolucionGarantia(row) && (
                                                                    <button
                                                                        onClick={() => handleDevolucionGarantia(row.id)}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 hover:text-emerald-800 transition-colors shadow-sm"
                                                                    >
                                                                        <Shield size={14} className="text-emerald-500" />
                                                                        Devolver garantía
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )
                                                }

                                                if (column.key === 'estatus') {

                                                    const badgeData = !dataCompleta(row)
                                                        ? STATUS_BADGE.PENDIENTE_DATOS_INFRACTOR
                                                        : esPagadaInstante(row)
                                                            ? STATUS_BADGE.LIBERADA_INFRACCIONES_INSTANTE
                                                            : esLiberada(row)
                                                                ? STATUS_BADGE.LIBERADO_POR_INFRACCIONES
                                                                : isPagada(row)
                                                                    ? STATUS_BADGE.PENDIENTE_DEVOLUCION_GARANTIA
                                                                    : esPendientePago(row)
                                                                        ? STATUS_BADGE.PENDIENTE_PAGO_INFRACCION
                                                                        : getBadge(row.estatusDependencia)
                                                    return (
                                                        <td key={column.key} className="px-4 py-2.5">
                                                            <span
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                                                                style={{ background: badgeData.bg, color: badgeData.text }}
                                                            >
                                                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: badgeData.dot }} />
                                                                {badgeData.label}
                                                            </span>
                                                        </td>
                                                    )
                                                }

                                                if (column.key === 'nombre_infractor') {
                                                    const name = row['nombre_infractor'] ?? ''
                                                    const initials = getInitials(name)
                                                    const color = hashColor(name, AVATAR_COLORS)
                                                    return (
                                                        <td key={column.key} className="px-4 py-2.5">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                                                                    style={{ background: color.bg, color: color.text }}
                                                                >
                                                                    {initials || <User size={13} strokeWidth={2.5} />}
                                                                </div>
                                                                <span className="font-medium text-[14px]" style={{ color: '#0F172A' }}>
                                                                    {name || '—'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    )
                                                }

                                                return (
                                                    <td key={column.key} className="px-4 py-2.5 font-medium" style={{ color: '#0F172A' }}>
                                                        {row[column.key] ?? '—'}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Capturar datos modal */}
            {capturarDatosDetalle && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
                    style={{ background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(6px)' }}
                    onClick={() => setCapturarDatosDetalle(null)}
                >
                    <div
                        className="w-full max-w-lg rounded-2xl border overflow-hidden"
                        style={{ background: '#FFFFFF', borderColor: '#E2E8F0', boxShadow: '0 25px 60px rgba(15,23,42,0.25), 0 0 0 1px rgba(226,232,240,0.5)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-end px-4 pt-4">
                            <button
                                onClick={() => setCapturarDatosDetalle(null)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#64748B] transition-colors"
                                style={{ background: '#F1F5F9' }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="px-4 pb-4">
                            <CapturarDatosTitularSection
                                detalle={capturarDatosDetalle}
                                onSuccess={handleCapturarDatosSuccess}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Devolver garantía modal */}
            {devolucionGarantiaDetalle && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
                    style={{ background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(6px)' }}
                    onClick={() => setDevolucionGarantiaDetalle(null)} // ✅ click en backdrop cierra
                >
                    <ModalEntregarGarantia
                        detalle={devolucionGarantiaDetalle}
                        onSuccess={handleDevolucionGarantiaSuccess}
                        onClose={() => setDevolucionGarantiaDetalle(null)} // ✅ X y Cancelar cierran
                    />
                </div>
            )}

            {/* Loading overlays */}
            {capturarDatosLoading && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center"
                    style={{ background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(6px)' }}
                >
                    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl" style={{ background: '#FFFFFF' }}>
                        <Loader2 size={24} className="animate-spin text-[#2563EB]" />
                        <p className="text-[13px] font-medium text-[#64748B]">Consultando infracción...</p>
                    </div>
                </div>
            )}

            {devolucionGarantiaLoading && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center"
                    style={{ background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(6px)' }}
                >
                    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl" style={{ background: '#FFFFFF' }}>
                        <Loader2 size={24} className="animate-spin text-[#2563EB]" />
                        <p className="text-[13px] font-medium text-[#64748B]">Consultando infracción...</p>
                    </div>
                </div>
            )}
        </>
    )
}