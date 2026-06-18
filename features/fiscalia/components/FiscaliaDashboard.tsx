'use client'

import { BotonVerDetalle } from '@/features/compartido/components/ButtonVerDetalles'
import CargarOficioSection from '@/features/compartido/components/CargarOficioSection'
import ConfirmacionModal from '@/features/compartido/components/ConfirmacionModal'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle2, AlertCircle, Search, User, FileText, Play, Loader2, ArrowUpDown, ArrowUp, ArrowDown, Download, Calendar } from 'lucide-react'
import type { DetalleCompleto } from '@/features/compartido/types/detalleInfraccion'

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
    loading?: boolean
}

type EstatusFiscalia =
    | 'REGISTRADA'
    | 'LIBERADO_POR_FISCALIA'

const STATUS_TABS: { key: EstatusFiscalia; label: string; icon: typeof Clock; color: string; accent: string; bg: string }[] = [
    { key: 'REGISTRADA', label: 'Pendientes', icon: Clock, color: '#F59E0B', accent: '#92400E', bg: '#FFFBEB' },
    { key: 'LIBERADO_POR_FISCALIA', label: 'Liberados', icon: CheckCircle2, color: '#22C55E', accent: '#166534', bg: '#F0FDF4' },
]

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    PENDIENTE: { bg: '#FEF3C7', text: '#78350F', dot: '#F59E0B', label: 'Pendiente' },
    RETENIDO_POR_ACCIDENTE_PENDIENTE_OFICIO: { bg: '#FEF3C7', text: '#78350F', dot: '#F59E0B', label: 'Pendiente' },
    RETENIDO_POR_DELITO_PENDIENTE_OFICIO: { bg: '#FEF3C7', text: '#78350F', dot: '#F59E0B', label: 'Pendiente' },
    EN_PROCESO_FISCALIA: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'En Proceso' },
    LIBERADO_POR_FISCALIA: { bg: '#DCFCE7', text: '#166534', dot: '#22C55E', label: 'Liberada' },
    LIBERADO_POR_LIBERACIONES: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'Por revisar' },
    EN_REVISION_MW: { bg: '#FEF3C7', text: '#78350F', dot: '#F59E0B', label: 'En revisión' },
    CERRADA: { bg: '#DCFCE7', text: '#166534', dot: '#22C55E', label: 'Cerrada' },
    MESA_DE_CONTROL_PENDIENTE_DOCS: { bg: '#DCFCE7', text: '#166534', dot: '#22C55E', label: 'Liberada' },
}

function getBadge(status: string) {
    return STATUS_BADGE[status] ?? { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8', label: status }
}

const SORTABLE_KEYS = new Set(['folio', 'nombre_infractor', 'placa'])

export default function FiscaliaDashboard({
    data,
    visibleColumns,
    onOpenDetalle,
    loading = false,
}: Props) {
    const router = useRouter()
    const [filtro, setFiltro] = useState<EstatusFiscalia>('REGISTRADA')
    const [busqueda, setBusqueda] = useState('')
    const [pagina, setPagina] = useState(1)
    const limite = 10
    const [sortField, setSortField] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')

    // ─── Modal detalle oficio ───
    const [oficioFormId, setOficioFormId] = useState<string | null>(null)
    const [oficioFormData, setOficioFormData] = useState<DetalleCompleto | null>(null)
    const [loadingOficioForm, setLoadingOficioForm] = useState(false)

    // ─── Confirmacion Tomar caso ───
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null)
    const [confirmLoading, setConfirmLoading] = useState(false)

    // ─── Finalizar proceso ───
    const [finalizandoId, setFinalizandoId] = useState<string | null>(null)

    function handleFiltroChange(key: EstatusFiscalia) {
        setFiltro(key)
        setPagina(1)
    }

    // ─── Stats ───
    const estadisticas = useMemo(() => {
        const pendientes = data.filter(
            x =>
                x.estatusInfraccion === 'REGISTRADA' &&
                ['RETENIDO_POR_ACCIDENTE_PENDIENTE_OFICIO', 'RETENIDO_POR_ACCIDENTE_DELITO_OFICIO'].includes(x.estatusDependencia)
        ).length

        const liberadas = data.filter(
            x =>
                x.estatusInfraccion === 'REGISTRADA' &&
                ['MESA_DE_CONTROL_PENDIENTE_DOCS'].includes(x.estatusDependencia)
        ).length

        return { pendientes, liberadas }
    }, [data])

    const total = estadisticas.pendientes + estadisticas.liberadas

    // ─── Filtro ───
    const registrosFiltrados = useMemo(() => {
        switch (filtro) {
            case 'REGISTRADA':
                return data.filter(
                    x =>
                        x.estatusInfraccion === 'REGISTRADA' &&
                        ['RETENIDO_POR_ACCIDENTE_PENDIENTE_OFICIO', 'RETENIDO_POR_ACCIDENTE_DELITO_OFICIO'].includes(x.estatusDependencia))
            case 'LIBERADO_POR_FISCALIA':
                return data.filter(
                    x =>
                        x.estatusInfraccion === 'REGISTRADA' &&
                        ['MESA_DE_CONTROL_PENDIENTE_DOCS', 'LIBERADA_POR_ACCIDENTE'].includes(x.estatusDependencia))
            default:
                return []
        }
    }, [data, filtro])

    const busquedaLower = busqueda.toLowerCase().trim()
    const registrosVisibles = busqueda
        ? registrosFiltrados.filter(row => {
            const folio = String(row.folio ?? '').toLowerCase()
            return folio.includes(busquedaLower)
        })
        : registrosFiltrados

    const registrosFiltradosFecha = useMemo(() => {
        if (!fechaInicio && !fechaFin) return registrosVisibles
        return registrosVisibles.filter(row => {
            const fecha = new Date(row.created_at)
            if (fechaInicio && fecha < new Date(fechaInicio)) return false
            if (fechaFin) {
                const endDate = new Date(fechaFin)
                endDate.setHours(23, 59, 59, 999)
                if (fecha > endDate) return false
            }
            return true
        })
    }, [registrosVisibles, fechaInicio, fechaFin])

    const registrosOrdenados = useMemo(() => {
        if (!sortField) return registrosFiltradosFecha
        return [...registrosFiltradosFecha].sort((a, b) => {
            const aVal = a[sortField] ?? ''
            const bVal = b[sortField] ?? ''
            const cmp = String(aVal).localeCompare(String(bVal), 'es', { numeric: true })
            return sortDirection === 'asc' ? cmp : -cmp
        })
    }, [registrosFiltradosFecha, sortField, sortDirection])

    const totalPaginas = Math.max(1, Math.ceil(registrosOrdenados.length / limite))
    const paginaSegura = Math.min(pagina, totalPaginas)
    const registrosPaginados = registrosOrdenados.slice((paginaSegura - 1) * limite, paginaSegura * limite)

    function handleSort(key: string) {
        if (sortField === key) {
            setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(key)
            setSortDirection('asc')
        }
        setPagina(1)
    }

    function exportarCSV() {
        const headers = visibleColumns.filter(c => c.key !== 'acciones').map(c => c.label)
        const rows = registrosOrdenados.map(row => {
            return visibleColumns.filter(c => c.key !== 'acciones').map(c => {
                if (c.key === 'estatus') {
                    return getBadge(row.estatusDependencia ?? row.estatusInfraccion).label
                }
                return row[c.key] ?? ''
            })
        })
        const bom = '\uFEFF'
        const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')
        const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `fiscalia-${filtro}-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    // ─── Handlers ───
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

    function handleTomarCaso(id: string) {
        setConfirmTargetId(id)
        setConfirmOpen(true)
    }

    async function iniciarRevision() {
        if (!confirmTargetId) return
        setConfirmLoading(true)
        try {
            const response = await fetch('/api/fiscalia/iniciarProceso', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: confirmTargetId }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Algo salió mal')
            setConfirmOpen(false)
            setConfirmTargetId(null)
            router.refresh()
        } catch (error) {
            console.error('Error en la petición:', error)
        } finally {
            setConfirmLoading(false)
        }
    }

    async function handleFinalizarProceso(id: string) {
        setFinalizandoId(id)
        try {
            const res = await fetch('/api/fiscalia/finalizarProceso', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })
            if (res.ok) router.refresh()
        } finally {
            setFinalizandoId(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* ─── HEADER ─── */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-[22px] font-medium leading-tight text-slate-900">Panel Fiscalía</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {total} infracción{total !== 1 ? 'es' : ''} asignada{total !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4 animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100" />
                                    <div className="h-3 w-12 rounded bg-slate-100" />
                                </div>
                                <div className="h-3 w-32 rounded bg-slate-100" />
                                <div className="h-8 w-20 rounded bg-slate-100" />
                                <div className="h-1.5 w-full rounded-full bg-slate-100" />
                            </div>
                        ))}
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white shadow-card overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                            <div className="h-4 w-44 rounded bg-slate-200" />
                        </div>
                        <div className="divide-y divide-slate-100">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                                    <div className="h-3.5 w-16 rounded bg-slate-100" />
                                    <div className="h-3.5 w-32 rounded bg-slate-100" />
                                    <div className="h-3.5 w-28 rounded bg-slate-100" />
                                    <div className="h-5 w-14 rounded-full bg-slate-100" />
                                    <div className="h-7 w-20 rounded-md bg-slate-100 ml-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
            <>

            {/* ─── STATS CARDS ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STATUS_TABS.map(tab => {
                    const count = estadisticas[tab.key === 'REGISTRADA' ? 'pendientes' : 'liberadas']
                    const activo = filtro === tab.key
                    const Icon = tab.icon

                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleFiltroChange(tab.key)}
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
                                <span className="text-[11px] font-medium tracking-wider" style={{ color: tab.color }}>
                                    {activo ? 'ACTIVO' : ''}
                                </span>
                            </div>

                            <p className="text-xs font-medium tracking-wider uppercase text-slate-500">
                                {tab.label}
                            </p>
                            <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="text-[30px] font-medium tracking-tight text-slate-900">
                                    {count}
                                </span>
                                <span className="text-sm font-medium text-slate-400">
                                    / {total}
                                </span>
                            </div>

                            {count > 0 && (
                                <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-slate-200">
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
            <div className="rounded-xl border overflow-hidden bg-white border-slate-200 shadow-card">
                <div className="px-5 py-3.5 border-b flex items-center justify-between border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-700">
                            <AlertCircle size={12} strokeWidth={2.5} className="text-white" />
                        </div>
                        <h3 className="text-sm font-medium tracking-wider uppercase text-blue-700">
                            {STATUS_TABS.find(t => t.key === filtro)?.label ?? 'Infracciones'}
                        </h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportarCSV}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                            <Download size={12} strokeWidth={1.5} />
                            CSV
                        </button>
                        <span className="text-xs font-medium text-slate-400">
                            {registrosOrdenados.length} registro{registrosOrdenados.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Search + Date filter */}
                <div className="px-5 py-2.5 border-b flex items-center gap-3 border-slate-100 bg-white flex-wrap">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Search size={13} strokeWidth={1.8} className="text-slate-400 shrink-0" />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
                            placeholder="Buscar por folio..."
                            className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        />
                        {busqueda && (
                            <button
                                onClick={() => { setBusqueda(''); setPagina(1) }}
                                className="text-[10px] font-medium uppercase tracking-wider text-blue-700 hover:text-blue-800 transition-colors shrink-0"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Calendar size={13} strokeWidth={1.5} className="text-slate-400" />
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={e => { setFechaInicio(e.target.value); setPagina(1) }}
                            className="w-[130px] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
                        />
                        <span className="text-xs text-slate-300">—</span>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={e => { setFechaFin(e.target.value); setPagina(1) }}
                            className="w-[130px] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
                        />
                        {(fechaInicio || fechaFin) && (
                            <button
                                onClick={() => { setFechaInicio(''); setFechaFin(''); setPagina(1) }}
                                className="text-[10px] font-medium uppercase tracking-wider text-blue-700 hover:text-blue-800 transition-colors shrink-0"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                {visibleColumns.map(column => (
                                    <th
                                        key={column.key}
                                        className={`px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider ${SORTABLE_KEYS.has(column.key) ? 'cursor-pointer select-none hover:text-slate-700' : ''} text-slate-500 bg-slate-50 border-b border-slate-100`}
                                        onClick={SORTABLE_KEYS.has(column.key) ? () => handleSort(column.key) : undefined}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            {column.label}
                                            {SORTABLE_KEYS.has(column.key) && (
                                                sortField === column.key ? (
                                                    sortDirection === 'asc' ? <ArrowUp size={11} strokeWidth={2} /> : <ArrowDown size={11} strokeWidth={2} />
                                                ) : (
                                                    <ArrowUpDown size={11} strokeWidth={1.5} className="text-slate-300" />
                                                )
                                            )}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {registrosOrdenados.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleColumns.length} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle size={22} strokeWidth={1.5} className="text-slate-300" />
                                            <p className="text-sm font-medium text-slate-400">No hay registros</p>
                                            <p className="text-xs text-slate-300">No existen infracciones con este estatus.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                registrosPaginados.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="transition-colors hover:bg-slate-50 border-b border-slate-100"
                                    >
                                        {visibleColumns.map(column => {
                                            if (column.key === 'acciones') {
                                                const estatusDep = row.estatusDependencia ?? ''
                                                return (
                                                    <td key={column.key} className="px-4 py-2.5">
                                                        <div className="flex items-center gap-2">
                                                            <BotonVerDetalle
                                                                idInfraccion={row.id}
                                                                onOpenDetalle={onOpenDetalle}
                                                            />

                                                            {['RETENIDO_POR_ACCIDENTE_PENDIENTE_OFICIO', 'RETENIDO_POR_DELITO_PENDIENTE_OFICIO', 'EN_REVISION_MW'].includes(estatusDep) && (
                                                                <button
                                                                    onClick={() => handleOpenOficioForm(row.id)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors"
                                                                >
                                                                    <FileText size={14} />
                                                                    Cargar oficio
                                                                </button>
                                                            )}

                                                            {estatusDep === 'LIBERADO_POR_LIBERACIONES' && (
                                                                <button
                                                                    onClick={() => handleTomarCaso(row.id)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                                                                >
                                                                    <Play size={14} />
                                                                    Tomar caso
                                                                </button>
                                                            )}

                                                            {estatusDep === 'EN_REVISION_MW' && (
                                                                <button
                                                                    onClick={() => handleFinalizarProceso(row.id)}
                                                                    disabled={finalizandoId === row.id}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
                                                                >
                                                                    {finalizandoId === row.id ? (
                                                                        <Loader2 size={14} className="animate-spin" />
                                                                    ) : (
                                                                        <CheckCircle2 size={14} />
                                                                    )}
                                                                    {finalizandoId === row.id ? 'Finalizando...' : 'Finalizar proceso'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )
                                            }

                                            if (column.key === 'estatus') {
                                                const badge = getBadge(row.estatusDependencia ?? row.estatusInfraccion)
                                                return (
                                                    <td key={column.key} className="px-4 py-2.5">
                                                        <span
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
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
                                                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                                                                style={{ background: color.bg, color: color.text }}
                                                            >
                                                                {initials || <User size={13} strokeWidth={2.5} />}
                                                            </div>
                                                            <span className="font-medium text-sm text-slate-900">
                                                                {name || '—'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                )
                                            }

                                            return (
                                                <td key={column.key} className="px-4 py-2.5 font-medium text-slate-900">
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

                {totalPaginas > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-white">
                        <span className="text-xs text-slate-400">
                            {registrosOrdenados.length} registros — Página {paginaSegura} de {totalPaginas}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPagina(p => Math.max(1, p - 1))}
                                disabled={paginaSegura <= 1}
                                className="inline-flex items-center justify-center w-8 h-8 text-xs font-medium rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                ‹
                            </button>
                            {(() => {
                                const pages: (number | '...')[] = []
                                const delta = 1
                                const start = Math.max(2, paginaSegura - delta)
                                const end = Math.min(totalPaginas - 1, paginaSegura + delta)
                                pages.push(1)
                                if (start > 2) pages.push('...')
                                for (let i = start; i <= end; i++) pages.push(i)
                                if (end < totalPaginas - 1) pages.push('...')
                                if (totalPaginas > 1) pages.push(totalPaginas)
                                return pages.map((p, i) =>
                                    p === '...' ? (
                                        <span key={`e${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-slate-300">···</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPagina(p)}
                                            className={`w-7 h-7 text-xs font-medium rounded-md transition-colors ${p === paginaSegura ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )
                            })()}
                            <button
                                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                                disabled={paginaSegura >= totalPaginas}
                                className="inline-flex items-center justify-center w-8 h-8 text-xs font-medium rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                ›
                            </button>
                        </div>
                    </div>
                )}
            </div>
            </>
            )}

            {/* ─── MODAL: Confirmacion Tomar caso ─── */}
            <ConfirmacionModal
                isOpen={confirmOpen}
                onConfirmar={iniciarRevision}
                onCancelar={() => { setConfirmOpen(false); setConfirmTargetId(null) }}
                loading={confirmLoading}
                titulo="Asignar caso"
                mensaje="¿Deseas tomar este caso? El estatus cambiará a «En Revisión» y se te asignará la atención."
                labelConfirmar="Sí, tomar caso"
                labelCancelar="Cancelar"
                variant="success"
            />

            {/* ─── MODAL: Cargar oficio ─── */}
            {loadingOficioForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white">
                        <Loader2 size={24} className="animate-spin text-blue-700" />
                        <p className="text-sm font-medium text-slate-500">Cargando datos del oficio...</p>
                    </div>
                </div>
            )}

            {oficioFormId && oficioFormData && !loadingOficioForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" onClick={() => handleCloseOficioForm()}>
                    <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden">
                            <CargarOficioSection
                                idInfraccion={oficioFormId}
                                folio={oficioFormData.Header.folio_de_infraccion}
                                noOficioActual={oficioFormData.Header.no_oficio_fiscalia}
                                noCarpetaActual={oficioFormData.Header.no_carpeta_investigacion}
                                nombreInfractor={oficioFormData.datos_infractor?.nombre_infractor}
                                appaternoInfractor={oficioFormData.datos_infractor?.appaterno_infractor}
                                apmaternoInfractor={oficioFormData.datos_infractor?.apmaterno_infractor}
                                correoInfractor={oficioFormData.datos_infractor?.correo_infractor}
                                curpInfractor={oficioFormData.datos_infractor?.curp_infractor}
                                onSuccess={handleCloseOficioForm}
                                onClose={handleCloseOficioForm}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
