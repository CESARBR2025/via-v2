'use client'

import { BotonVerDetalle } from '@/features/compartido/components/ButtonVerDetalles'
import { useMemo, useState } from 'react'
import { Clock, CheckCircle2, AlertCircle, Search, User, FileText } from 'lucide-react'

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
    onCargarOficio?: (id: string) => void
}

type EstatusJuzgado =
    | 'REGISTRADA'
    | 'LIBERADO_POR_JUZGADO'

const STATUS_TABS: { key: EstatusJuzgado; label: string; icon: typeof Clock; color: string; accent: string; bg: string }[] = [
    { key: 'REGISTRADA', label: 'Pendientes', icon: Clock, color: '#F59E0B', accent: '#92400E', bg: '#FFFBEB' },
    { key: 'LIBERADO_POR_JUZGADO', label: 'Liberados', icon: CheckCircle2, color: '#8B5CF6', accent: '#5B21B6', bg: '#F5F3FF' },
]

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    PENDIENTE: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Pendiente' },
    RETENIDO_POR_ACCIDENTE_PENDIENTE_OFICIO: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Pendiente' },
    EN_PROCESO_JUZGADO: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'En Proceso' },
    LIBERADO_POR_JUZGADO: { bg: '#F3E8FF', text: '#5B21B6', dot: '#8B5CF6', label: 'Liberada' },
}

function getBadge(status: string) {
    return STATUS_BADGE[status] ?? { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8', label: status }
}

export default function JuzgadoDashboard({
    data,
    visibleColumns,
    onOpenDetalle,
    onCargarOficio,
}: Props) {
    const [filtro, setFiltro] = useState<EstatusJuzgado>('REGISTRADA')

    const estadisticas = useMemo(() => {
        const pendientes = data.filter(x => x.estatus === 'REGISTRADA' && x.estatus_dependencia === 'RETENIDO_POR_ACCIDENTE_PENDIENTE_OFICIO').length
        const liberadas = data.filter(x => x.estatus_dependencia === 'MESA_DE_CONTROL_PENDIENTE_DOCS').length
        return { pendientes, liberadas }
    }, [data])

    const total = estadisticas.pendientes + estadisticas.liberadas




    const registrosFiltrados = useMemo(() => {
        switch (filtro) {
            case 'REGISTRADA':
                return data.filter(
                    x =>
                        x.estatus === 'REGISTRADA' &&
                        x.estatus_dependencia ===
                        'RETENIDO_POR_ACCIDENTE_PENDIENTE_OFICIO'
                )

            case 'LIBERADO_POR_JUZGADO':
                return data.filter(
                    x =>
                        x.estatus === 'REGISTRADA' &&
                        x.estatus_dependencia ===
                        'MESA_DE_CONTROL_PENDIENTE_DOCS'
                )

            default:
                return []
        }
    }, [data, filtro])


    return (
        <div className="space-y-6">
            {/* ─── HEADER ─── */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-[22px] font-bold text-[#0F172A] tracking-tight">Panel Juzgado Cívico</h2>
                    <p className="text-[14px] text-[#64748B] mt-0.5">
                        {total} infracción{total !== 1 ? 'es' : ''} asignada{total !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}>
                    <Search size={14} strokeWidth={1.8} className="text-[#94A3B8]" />
                    <span className="text-[12px] font-medium text-[#94A3B8]">Filtrar por estatus</span>
                </div>
            </div>

            {/* ─── STATS CARDS ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STATUS_TABS.map(tab => {
                    const count = estadisticas[tab.key === 'REGISTRADA' ? 'pendientes' : 'liberadas']
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

            {/* ─── TABLA ─── */}
            <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
                <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: '#F1F5F9', background: '#F8FAFC' }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#8B5CF6' }}>
                            <AlertCircle size={12} strokeWidth={2.5} className="text-white" />
                        </div>
                        <h3 className="text-[13px] font-semibold tracking-wider uppercase" style={{ color: '#8B5CF6' }}>
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
                                registrosFiltrados.map((row, idx) => (
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
                                                            {onCargarOficio && row.estatus === 'REGISTRADA' && row.estatus_dependencia === 'RETENIDO_POR_ACCIDENTE_PENDIENTE_OFICIO' && (
                                                                <button
                                                                    onClick={() => onCargarOficio(row.id)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors shadow-sm"
                                                                    style={{ background: '#FFF7ED', color: '#F97316', border: '1px solid #FED7AA' }}
                                                                >
                                                                    <FileText size={14} />
                                                                    Cargar oficio
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )
                                            }

                                            if (column.key === 'estatus') {
                                                const badge = getBadge(row.estatus_dependencia ?? row.estatus)
                                                return (
                                                    <td key={column.key} className="px-4 py-2.5">
                                                        <span
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                                                            style={{ background: badge.bg, color: badge.text }}
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: badge.dot }} />
                                                            {badge.label}
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
