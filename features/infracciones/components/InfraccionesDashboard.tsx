'use client'

import { BotonVerDetalle } from '@/features/compartido/components/ButtonVerDetalles'
import { useMemo, useState } from 'react'
import { Clock, RefreshCw, CheckCircle2, AlertCircle, Search, User } from 'lucide-react'

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
}

type EstatusInfracciones =
    | 'PENDIENTES_DATOS'
    | 'PAGADAS'
    | 'LIBERADO_POR_INFRACCIONES'

const STATUS_TABS: { key: EstatusInfracciones; label: string; icon: typeof Clock; color: string; accent: string; bg: string }[] = [
    { key: 'PENDIENTES_DATOS', label: 'Captura de datos', icon: Clock, color: '#F59E0B', accent: '#92400E', bg: '#FFFBEB' },
    { key: 'PAGADAS', label: 'Pagadas', icon: RefreshCw, color: '#22C55E', accent: '#166534', bg: '#F0FDF4' },
    { key: 'LIBERADO_POR_INFRACCIONES', label: 'Liberadas', icon: CheckCircle2, color: '#3B82F6', accent: '#1E40AF', bg: '#EFF6FF' },
]

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    PENDIENTES_DATOS: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Sin datos' },
    PAGADAS: { bg: '#DCFCE7', text: '#166534', dot: '#22C55E', label: 'Pagada' },
    LIBERADO_POR_INFRACCIONES: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'Liberada' },
}

function getBadge(status: string) {
    return STATUS_BADGE[status] ?? { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8', label: status }
}

function isNoData(v: string | null | undefined): boolean {
    return !v || v === 'NO_DATA' || v.trim() === ''
}

function dataCompleta(row: any): boolean {
    if (row.estatus === 'PENDIENTE_PAGO' && row.estatus_dependencia === 'PENDIENTE_PAGO_INSTANTE') return true
    const nombre = row.nombre_infractor ?? ''
    const titular = row.nombre_titular_liberacion ?? ''
    return !isNoData(nombre) && !isNoData(titular)
}

function isPagada(row: any): boolean {
    return row.estatus_orden_pago === 'P' || row.estatus_orden_pago === 'PAGADA'
}

function esLiberada(row: any): boolean {
    return row.estatus_dependencia === 'LIBERADO_POR_INFRACCIONES'
}

function esPendientePago(row: any): boolean {
    return row.estatus_dependencia === 'PENDIENTE_PAGO_INFRACCION'
}

export default function InfraccionesDashboard({
    data,
    visibleColumns,
    onOpenDetalle,
}: Props) {
    const [filtro, setFiltro] = useState<EstatusInfracciones>('PENDIENTES_DATOS')

    console.log(data)
    const estadisticas = useMemo(() => {
        const pendientes = data.filter(x => !dataCompleta(x)).length
        const pagadas = data.filter(x => x.estatus === 'PAGADA' && x.estatus_dependencia === 'PENDIENTE_ENTREGA_GARANTIA').length
        const liberadas = data.filter(x => esLiberada(x)).length
        return { pendientes, pagadas, liberadas }
    }, [data])

    const total = estadisticas.pendientes + estadisticas.pagadas + estadisticas.liberadas

    const registrosFiltrados = useMemo(() => {
        switch (filtro) {
            case 'PENDIENTES_DATOS':
                return data.filter(x => !dataCompleta(x))
            case 'PAGADAS':
                return data.filter(x => x.estatus === 'PAGADA' && x.estatus_dependencia === 'PENDIENTE_ENTREGA_GARANTIA')
            case 'LIBERADO_POR_INFRACCIONES':
                return data.filter(x => esLiberada(x))
            default:
                return []
        }
    }, [data, filtro])

    return (
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STATUS_TABS.map(tab => {
                    const count = estadisticas[tab.key === 'PENDIENTES_DATOS' ? 'pendientes' : tab.key === 'PAGADAS' ? 'pagadas' : 'liberadas']
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

                <div className="overflow-x-auto">
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
                                                        <BotonVerDetalle
                                                            idInfraccion={row.id}
                                                            onOpenDetalle={onOpenDetalle}
                                                        />
                                                    </td>
                                                )
                                            }

                                            if (column.key === 'estatus') {
                                                const badgeData = !dataCompleta(row)
                                                    ? STATUS_BADGE.PENDIENTES_DATOS
                                                    : esLiberada(row)
                                                        ? STATUS_BADGE.LIBERADO_POR_INFRACCIONES
                                                        : isPagada(row)
                                                            ? STATUS_BADGE.PAGADAS
                                                            : esPendientePago(row)
                                                                ? { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Pendiente pago' }
                                                                : getBadge(row.estatus_dependencia)
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
    )
}