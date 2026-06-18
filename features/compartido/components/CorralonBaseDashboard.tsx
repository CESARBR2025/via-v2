'use client'

import { useMemo, useState } from 'react'
import { BotonVerDetalle } from '@/features/compartido/components/ButtonVerDetalles'
import { Clock, CheckCircle2, AlertCircle, Search, User, Upload, Eye, ArrowUpDown, ArrowUp, ArrowDown, Download, Calendar } from 'lucide-react'
import { abrirDocumento } from '@/features/expediente/helpers/abrirDocumento'

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

function hashColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export interface CorralonConfig {
  title: string
  badgeMap: Record<string, { bg: string; text: string; dot: string; label: string }>
  pendientesStatus: string[]
  cerradasStatus: string[]
  pendientesEstatus: string
  cerradasEstatus: string
  isPendienteAction: (row: any) => boolean
}

interface Props {
  data: any[]
  visibleColumns: any[]
  config: CorralonConfig
  onSubirComprobante?: (id: string) => void
  onOpenDetalle?: (id: string) => void
  loading?: boolean
}

function getBadge(status: string, badgeMap: Record<string, { bg: string; text: string; dot: string; label: string }>) {
  return badgeMap[status] ?? { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8', label: status }
}

const SORTABLE_KEYS = new Set(['folio', 'nombre_infractor', 'placa'])

export default function CorralonBaseDashboard({
  data,
  visibleColumns,
  config,
  onSubirComprobante,
  onOpenDetalle,
  loading,
}: Props) {
  const [filtro, setFiltro] = useState<'PENDIENTE' | 'CERRADAS'>('PENDIENTE')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const limite = 10
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  function handleFiltroChange(key: 'PENDIENTE' | 'CERRADAS') {
    setFiltro(key); setPagina(1)
  }

  const STATUS_TABS = [
    { key: 'PENDIENTE' as const, label: 'Pendientes', icon: Clock, color: '#F59E0B', accent: '#92400E', bg: '#FFFBEB' },
    { key: 'CERRADAS' as const, label: 'Cerradas', icon: CheckCircle2, color: '#22C55E', accent: '#166534', bg: '#F0FDF4' },
  ]

  const estadisticas = useMemo(() => {
    const pendientes = data.filter(x => x.estatusInfraccion === config.pendientesEstatus && config.pendientesStatus.includes(x.estatusDependencia)).length
    const cerradas = data.filter(x => x.estatusInfraccion === config.cerradasEstatus && config.cerradasStatus.includes(x.estatusDependencia)).length
    return { pendientes, cerradas }
  }, [data, config])

  const total = estadisticas.pendientes + estadisticas.cerradas

  const registrosFiltrados = useMemo(() => {
    switch (filtro) {
      case 'PENDIENTE': return data.filter(x => x.estatusInfraccion === config.pendientesEstatus && config.pendientesStatus.includes(x.estatusDependencia))
      case 'CERRADAS': return data.filter(x => x.estatusInfraccion === config.cerradasEstatus && config.cerradasStatus.includes(x.estatusDependencia))
      default: return []
    }
  }, [data, filtro, config])

  const busquedaLower = busqueda.toLowerCase().trim()
  const registrosVisibles = busqueda
    ? registrosFiltrados.filter(row => String(row.folio ?? '').toLowerCase().includes(busquedaLower))
    : registrosFiltrados

  const registrosFiltradosFecha = useMemo(() => {
    if (!fechaInicio && !fechaFin) return registrosVisibles
    return registrosVisibles.filter(row => {
      const fecha = new Date(row.created_at)
      if (fechaInicio && fecha < new Date(fechaInicio)) return false
      if (fechaFin) { const end = new Date(fechaFin); end.setHours(23, 59, 59, 999); if (fecha > end) return false }
      return true
    })
  }, [registrosVisibles, fechaInicio, fechaFin])

  const registrosOrdenados = useMemo(() => {
    if (!sortField) return registrosFiltradosFecha
    return [...registrosFiltradosFecha].sort((a, b) => {
      const aVal = a[sortField] ?? ''; const bVal = b[sortField] ?? ''
      return (sortDirection === 'asc' ? 1 : -1) * String(aVal).localeCompare(String(bVal), 'es', { numeric: true })
    })
  }, [registrosFiltradosFecha, sortField, sortDirection])

  const totalPaginas = Math.max(1, Math.ceil(registrosOrdenados.length / limite))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const registrosPaginados = registrosOrdenados.slice((paginaSegura - 1) * limite, paginaSegura * limite)

  function handleSort(key: string) {
    if (sortField === key) setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(key); setSortDirection('asc') }
    setPagina(1)
  }

  function exportarCSV() {
    const headers = visibleColumns.filter(c => c.key !== 'acciones').map(c => c.label)
    const rows = registrosOrdenados.map((row: any) => visibleColumns.filter(c => c.key !== 'acciones').map(c => c.key === 'estatus' ? getBadge(row.estatusDependencia ?? row.estatusInfraccion, config.badgeMap).label : row[c.key] ?? ''))
    const bom = '\uFEFF'
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = `${config.title.toLowerCase().replace(/\s+/g, '-')}-${filtro}-${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-medium leading-tight text-slate-900">{config.title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{total} vehículo{total !== 1 ? 's' : ''} en el corralón</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex items-start justify-between"><div className="w-10 h-10 rounded-xl bg-slate-100" /><div className="h-3 w-12 rounded bg-slate-100" /></div>
                <div className="h-3 w-32 rounded bg-slate-100" /><div className="h-8 w-20 rounded bg-slate-100" /><div className="h-1.5 w-full rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white shadow-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50"><div className="h-4 w-44 rounded bg-slate-200" /></div>
            <div className="divide-y divide-slate-100">{Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="h-3.5 w-16 rounded bg-slate-100" /><div className="h-3.5 w-32 rounded bg-slate-100" /><div className="h-3.5 w-28 rounded bg-slate-100" />
                <div className="h-5 w-14 rounded-full bg-slate-100" /><div className="h-7 w-20 rounded-md bg-slate-100 ml-auto" />
              </div>
            ))}</div>
          </div>
        </div>
      ) : (
      <>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STATUS_TABS.map(tab => {
          const count = estadisticas[tab.key === 'PENDIENTE' ? 'pendientes' : 'cerradas']
          const activo = filtro === tab.key; const Icon = tab.icon
          return (
            <button key={tab.key} onClick={() => handleFiltroChange(tab.key)}
              className="relative rounded-xl border p-5 text-left transition-all duration-200"
              style={{ background: activo ? tab.bg : '#FFFFFF', borderColor: activo ? tab.color : '#E2E8F0', boxShadow: activo ? `0 4px 12px ${tab.color}22, 0 1px 2px rgba(0,0,0,0.04)` : '0 1px 2px rgba(0,0,0,0.04)' }}>
              {activo && <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ background: tab.color }} />}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: tab.bg }}><Icon size={18} strokeWidth={2} style={{ color: tab.color }} /></div>
                <span className="text-[11px] font-medium tracking-wider" style={{ color: tab.color }}>{activo ? 'ACTIVO' : ''}</span>
              </div>
              <p className="text-xs font-medium tracking-wider uppercase text-slate-500">{tab.label}</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-[30px] font-medium tracking-tight text-slate-900">{count}</span>
                <span className="text-sm font-medium text-slate-400">/ {total}</span>
              </div>
              {count > 0 && (
                <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-slate-200">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(count / total) * 100}%`, background: tab.color }} />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden bg-white border-slate-200 shadow-card">
        <div className="px-5 py-3.5 border-b flex items-center justify-between border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#F59E0B' }}>
              <AlertCircle size={12} strokeWidth={2.5} className="text-white" />
            </div>
            <h3 className="text-sm font-medium tracking-wider uppercase" style={{ color: '#F59E0B' }}>
              {STATUS_TABS.find(t => t.key === filtro)?.label ?? 'Vehículos'}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportarCSV} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"><Download size={12} strokeWidth={1.5} />CSV</button>
            <span className="text-xs font-medium text-slate-400">{registrosOrdenados.length} registro{registrosOrdenados.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Search + Date */}
        <div className="px-5 py-2.5 border-b flex items-center gap-3 border-slate-100 bg-white flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Search size={13} strokeWidth={1.8} className="text-slate-400 shrink-0" />
            <input type="text" value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1) }} placeholder="Buscar por folio..." className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            {busqueda && <button onClick={() => { setBusqueda(''); setPagina(1) }} className="text-[10px] font-medium uppercase tracking-wider text-blue-700 hover:text-blue-800 transition-colors shrink-0">Limpiar</button>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Calendar size={13} strokeWidth={1.5} className="text-slate-400" />
            <input type="date" value={fechaInicio} onChange={e => { setFechaInicio(e.target.value); setPagina(1) }} className="w-[130px] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10" />
            <span className="text-xs text-slate-300">—</span>
            <input type="date" value={fechaFin} onChange={e => { setFechaFin(e.target.value); setPagina(1) }} className="w-[130px] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10" />
            {(fechaInicio || fechaFin) && <button onClick={() => { setFechaInicio(''); setFechaFin(''); setPagina(1) }} className="text-[10px] font-medium uppercase tracking-wider text-blue-700 hover:text-blue-800 transition-colors shrink-0">Limpiar</button>}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr>
              {visibleColumns.map((column: any) => (
                <th key={column.key} className={`px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider ${SORTABLE_KEYS.has(column.key) ? 'cursor-pointer select-none hover:text-slate-700' : ''} text-slate-500 bg-slate-50 border-b border-slate-100`}
                  onClick={SORTABLE_KEYS.has(column.key) ? () => handleSort(column.key) : undefined}>
                  <span className="inline-flex items-center gap-1">{column.label}{SORTABLE_KEYS.has(column.key) && (sortField === column.key ? sortDirection === 'asc' ? <ArrowUp size={11} strokeWidth={2} /> : <ArrowDown size={11} strokeWidth={2} /> : <ArrowUpDown size={11} strokeWidth={1.5} className="text-slate-300" />)}</span>
                </th>
              ))}
            </tr></thead>
            <tbody>
              {registrosOrdenados.length === 0 ? (
                <tr><td colSpan={visibleColumns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle size={22} strokeWidth={1.5} className="text-slate-300" />
                    <p className="text-sm font-medium text-slate-400">No hay registros</p>
                    <p className="text-xs text-slate-300">No existen vehículos con este estatus.</p>
                  </div>
                </td></tr>
              ) : registrosPaginados.map((row: any) => (
                <tr key={row.id} className="transition-colors hover:bg-slate-50 border-b border-slate-100">
                  {visibleColumns.map((column: any) => {
                    if (column.key === 'acciones') {
                      const esPendiente = config.isPendienteAction(row)
                      return (
                        <td key={column.key} className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            {onOpenDetalle && <BotonVerDetalle idInfraccion={row.id} onOpenDetalle={onOpenDetalle} />}
                            {row.url_orden_salida_liberaciones && row.url_orden_salida_liberaciones !== 'NO_DATA' && (
                              <button onClick={() => abrirDocumento(row.url_orden_salida_liberaciones)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"><Eye size={14} />Ver orden</button>
                            )}
                            {row.urlOficioCorralon && row.urlOficioCorralon !== 'NO_DATA' && (
                              <button onClick={() => abrirDocumento(row.urlOficioCorralon)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"><Eye size={14} />Ver pago</button>
                            )}
                            {onSubirComprobante && esPendiente && (
                              <button onClick={() => onSubirComprobante(row.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"><Upload size={14} />Subir comprobante</button>
                            )}
                          </div>
                        </td>
                      )
                    }
                    if (column.key === 'estatus') {
                      const badge = getBadge(row.estatusDependencia ?? row.estatusInfraccion, config.badgeMap)
                      return (
                        <td key={column.key} className="px-4 py-2.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium" style={{ background: badge.bg, color: badge.text }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: badge.dot }} />{badge.label}
                          </span>
                        </td>
                      )
                    }
                    if (column.key === 'nombre_infractor') {
                      const name = row['nombre_infractor'] ?? ''
                      const initials = getInitials(name); const color = hashColor(name)
                      return (
                        <td key={column.key} className="px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ background: color.bg, color: color.text }}>{initials || <User size={13} strokeWidth={2.5} />}</div>
                            <span className="font-medium text-sm text-slate-900">{name || '—'}</span>
                          </div>
                        </td>
                      )
                    }
                    return <td key={column.key} className="px-4 py-2.5 font-medium text-slate-900">{row[column.key] ?? '—'}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-white">
            <span className="text-xs text-slate-400">{registrosOrdenados.length} registros — Página {paginaSegura} de {totalPaginas}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={paginaSegura <= 1} className="inline-flex items-center justify-center w-8 h-8 text-xs font-medium rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">‹</button>
              {(() => {
                const pages: (number | '...')[] = []; const delta = 1
                const start = Math.max(2, paginaSegura - delta); const end = Math.min(totalPaginas - 1, paginaSegura + delta)
                pages.push(1); if (start > 2) pages.push('...')
                for (let i = start; i <= end; i++) pages.push(i)
                if (end < totalPaginas - 1) pages.push('...'); if (totalPaginas > 1) pages.push(totalPaginas)
                return pages.map((p, i) => p === '...' ? <span key={`e${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-slate-300">···</span> : (
                  <button key={p} onClick={() => setPagina(p as number)} className={`w-7 h-7 text-xs font-medium rounded-md transition-colors ${p === paginaSegura ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{p}</button>
                ))
              })()}
              <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={paginaSegura >= totalPaginas} className="inline-flex items-center justify-center w-8 h-8 text-xs font-medium rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">›</button>
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  )
}
