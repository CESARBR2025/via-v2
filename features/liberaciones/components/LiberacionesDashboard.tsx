'use client'

import { BotonVerDetalle } from '@/features/compartido/components/ButtonVerDetalles'
import { useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, RefreshCw, CheckCircle2, AlertCircle, Search, User, X } from 'lucide-react'
import CapturarInfractorSection from '@/features/liberaciones/components/CapturarInfractorSection'
import RevisionDocumentosSection from '@/features/liberaciones/components/RevisionDocumentosSection'

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

type EstatusLiberaciones =
    | 'VEHICULO_EN_CORRALON'
    | 'MESA_DE_CONTROL_REVISION'
    | 'LIBERADA_POR_INFRACCION'

const STATUS_TABS: { key: EstatusLiberaciones; label: string; icon: typeof Clock; color: string; accent: string; bg: string }[] = [
    { key: 'VEHICULO_EN_CORRALON', label: 'Capturar datos', icon: Clock, color: '#F59E0B', accent: '#92400E', bg: '#FFFBEB' },
    { key: 'MESA_DE_CONTROL_REVISION', label: 'Revisión documentos', icon: RefreshCw, color: '#2563EB', accent: '#1E40AF', bg: '#EFF6FF' },
    { key: 'LIBERADA_POR_INFRACCION', label: 'Liberadas', icon: CheckCircle2, color: '#22C55E', accent: '#166534', bg: '#F0FDF4' },
]

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    VEHICULO_EN_CORRALON: { bg: '#FEF3C7', text: '#78350F', dot: '#F59E0B', label: 'Sin datos' },
    MESA_DE_CONTROL_REVISION: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'En revisión' },
    LIBERADA_POR_INFRACCION: { bg: '#DCFCE7', text: '#166534', dot: '#22C55E', label: 'Liberada' },
    LIBERADA_POR_DELITO: { bg: '#DCFCE7', text: '#166534', dot: '#22C55E', label: 'Liberada' },
}

function getBadge(status: string) {
    return STATUS_BADGE[status] ?? { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8', label: status }
}

export default function LiberacionesDashboard({
    data,
    visibleColumns,
    onOpenDetalle,
}: Props) {
    const router = useRouter()
    console.log(data)

    const [filtro, setFiltro] = useState<EstatusLiberaciones>('VEHICULO_EN_CORRALON')
    const [busqueda, setBusqueda] = useState('')

    // Action states
    const [capturarInfractorId, setCapturarInfractorId] = useState<string | null>(null)
    const [revisionModalId, setRevisionModalId] = useState<string | null>(null)

    const estadisticas = useMemo(() => {
        const capturarDatos = data.filter(x => x.estatusInfraccion === 'REGISTRADA' && x.estatusDependencia === 'VEHICULO_EN_CORRALON').length
        const revision = data.filter(x => x.estatusInfraccion === 'REGISTRADA' && x.estatusDependencia === 'MESA_DE_CONTROL_REVISION').length
        const liberadas = data.filter(x => x.estatusInfraccion === 'CERRADA' && x.estatusDependencia === 'LIBERADA_POR_INFRACCION').length
        return { capturarDatos, revision, liberadas }
    }, [data])

    console.log(estadisticas.capturarDatos)

    const total = estadisticas.capturarDatos + estadisticas.revision + estadisticas.liberadas

    const registrosFiltrados = useMemo(
        () => data.filter(x => {
            switch (filtro) {
                case 'VEHICULO_EN_CORRALON':
                    return x.estatusInfraccion === 'REGISTRADA' && x.estatusDependencia === 'VEHICULO_EN_CORRALON'
                case 'MESA_DE_CONTROL_REVISION':
                    return x.estatusInfraccion === 'REGISTRADA' && x.estatusDependencia === 'MESA_DE_CONTROL_REVISION'
                case 'LIBERADA_POR_INFRACCION':
                    return x.estatusInfraccion === 'CERRADA' && x.estatusDependencia === 'LIBERADA_POR_INFRACCION'
                default:
                    return false
            }
        }),
        [data, filtro],
    )

    const busquedaLower = busqueda.toLowerCase().trim()
    const registrosVisibles = busqueda
        ? registrosFiltrados.filter(row => {
            const folio = String(row.folio ?? '').toLowerCase()
            return folio.includes(busquedaLower)
        })
        : registrosFiltrados

    const STATS_KEY: Record<EstatusLiberaciones, keyof typeof estadisticas> = {
        VEHICULO_EN_CORRALON: 'capturarDatos',
        MESA_DE_CONTROL_REVISION: 'revision',
        LIBERADA_POR_INFRACCION: 'liberadas',
    }

    async function handleCapturarInfractor(id: string) {
        setCapturarInfractorId(id)
    }

    const rowActions = useCallback((row: any) => {
        const estatus = row.estatusDependencia
        const items: React.ReactNode[] = []

        // "Capturar infractor" for VEHICULO_EN_CORRALON
        if (estatus === 'VEHICULO_EN_CORRALON') {
            items.push(
                <button
                    key="capturar-infractor"
                    onClick={() => handleCapturarInfractor(row.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white transition-all"
                    style={{ background: '#F97316' }}
                >
                    <User size={11} strokeWidth={2.5} />
                    Capturar infractor
                </button>
            )
        }

        // "Revisar documentos" for MESA_DE_CONTROL_REVISION
        if (estatus === 'MESA_DE_CONTROL_REVISION') {
            items.push(
                <button
                    key="revisar-docs"
                    onClick={() => setRevisionModalId(row.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white transition-all"
                    style={{ background: '#2563EB' }}
                >
                    <Search size={11} strokeWidth={2.5} />
                    Revisar documentos
                </button>
            )
        }

        return items
    }, [])

    return (
        <>
            <div className="space-y-6">
                {/* ─── HEADER ─── */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-[22px] font-bold text-[#0F172A] tracking-tight">Panel Liberaciones</h2>
                        <p className="text-[14px] text-[#64748B] mt-0.5">
                            {total} solicitud{total !== 1 ? 'es' : ''} de liberación
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

                {/* ─── TABLA ─── */}
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
                                {STATUS_TABS.find(t => t.key === filtro)?.label ?? 'Solicitudes'}
                            </h3>
                        </div>
                        <span className="text-[12px] font-medium" style={{ color: '#94A3B8' }}>
                            {registrosVisibles.length} registro{registrosVisibles.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Search */}
                    <div className="px-5 py-2.5 border-b flex items-center gap-2" style={{ borderColor: '#F1F5F9', background: '#FFFFFF' }}>
                        <Search size={13} strokeWidth={1.8} className="text-[#94A3B8] shrink-0" />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            placeholder="Buscar por folio..."
                            className="w-full border-none bg-transparent text-[13px] text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
                        />
                        {busqueda && (
                            <button
                                onClick={() => setBusqueda('')}
                                className="text-[10px] font-semibold uppercase tracking-wider text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                            >
                                Limpiar
                            </button>
                        )}
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
                                {registrosVisibles.length === 0 ? (
                                    <tr>
                                        <td colSpan={visibleColumns.length} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertCircle size={22} strokeWidth={1.5} className="text-[#CBD5E1]" />
                                                <p className="text-[14px] font-medium text-[#94A3B8]">No hay registros</p>
                                                <p className="text-[12px] text-[#CBD5E1]">No existen solicitudes con este estatus.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    registrosVisibles.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="transition-colors hover:bg-[#F8FAFC]"
                                            style={{ borderBottom: '1px solid #F1F5F9' }}
                                        >
                                            {visibleColumns.map(column => {
                                                if (column.key === 'acciones') {
                                                    const actions = rowActions(row)
                                                    return (
                                                        <td key={column.key} className="px-4 py-2.5">
                                                            <div className="flex items-center gap-2">
                                                                {actions}
                                                                <BotonVerDetalle
                                                                    idInfraccion={row.id}
                                                                    onOpenDetalle={onOpenDetalle}
                                                                />
                                                            </div>
                                                        </td>
                                                    )
                                                }

                                                if (column.key === 'estatus') {
                                                    const badge = getBadge(row.estatusDependencia ?? row.estatusInfraccion)
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

            {/* ─── Capturar Infractor Modal ─── */}
            {capturarInfractorId && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) setCapturarInfractorId(null) }}
                >
                    <div
                        className="w-full max-w-lg rounded-2xl overflow-hidden"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: '0 20px 60px rgba(15,23,42,0.18), 0 0 0 1px rgba(226,232,240,0.6)',
                        }}
                    >
                        <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: '#E2E8F0', background: '#FFF7ED' }}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#F97316' }}>
                                    <User size={12} strokeWidth={2.5} className="text-white" />
                                </div>
                                <h3 className="text-[13px] font-semibold tracking-wider uppercase" style={{ color: '#9A3412' }}>
                                    Capturar datos del infractor
                                </h3>
                            </div>
                            <button
                                onClick={() => setCapturarInfractorId(null)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                                style={{ background: '#F1F5F9' }}
                            >
                                <X size={14} strokeWidth={2.5} className="text-[#64748B]" />
                            </button>
                        </div>
                        <div className="p-5">
                            <CapturarInfractorSection
                                infraccionId={capturarInfractorId}
                                onSuccess={() => { setCapturarInfractorId(null); router.refresh() }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {revisionModalId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#F1F5F9] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-[#E2E8F0] rounded-t-2xl">
                            <h2 className="text-[15px] font-semibold text-[#0F172A]">Revisión de documentos</h2>
                            <button
                                onClick={() => { setRevisionModalId(null); router.refresh() }}
                                className="px-4 py-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[13px] font-medium text-[#64748B] transition"
                            >
                                Cerrar
                            </button>
                        </div>
                        <div className="p-6">
                            <RevisionDocumentosSection
                                infraccionId={revisionModalId}
                                onValidated={() => { setRevisionModalId(null); router.refresh() }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
