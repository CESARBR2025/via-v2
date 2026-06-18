'use client'

import { useState } from 'react'
import { Shield, CheckCircle2, Loader2, FileText, User, Truck, Calendar, Hash, X, AlertCircle } from 'lucide-react'
import type { DetalleCompleto } from '@/features/compartido/types/detalleInfraccion'
import { useToastStore } from '@/stores/useToastStore'

interface Props {
  detalle: DetalleCompleto
  onSuccess: () => void
  onClose?: () => void
}

function getGarantiaInfo(g: string | undefined, placa: string | undefined): { icon: string; label: string; desc: string } {
  if (!g || g === 'NO_DATA') return { icon: 'circle', label: 'No especificada', desc: 'No se retuvo ninguna garantía' }
  if (g === 'true') return { icon: 'check', label: 'Garantía entregada', desc: 'La garantía fue entregada previamente' }
  if (g === 'PLACA') return { icon: 'plate', label: 'Placa del vehículo', desc: `Placa ${placa || 'no registrada'}` }
  if (g === 'TRJ_CIRCULACION') return { icon: 'card', label: 'Tarjeta de circulación', desc: 'Tarjeta de circulación retenida' }
  return { icon: 'circle', label: g, desc: '' }
}

export default function ModalEntregarGarantia({ detalle, onSuccess, onClose }: Props) {
  const addToast = useToastStore((s) => s.addToast)
  const [liberando, setLiberando] = useState(false)
  const [error, setError] = useState('')

  const pagoCompletado = detalle.Header.estatus_orden_pago === 'P'

  const garantia = getGarantiaInfo(detalle.garantia?.garantia_retenida, detalle.vehiculo?.placa)

  const handleLiberar = async () => {
    setLiberando(true)
    setError('')
    try {
      const res = await fetch('/api/infracciones/liberarGarantia', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: detalle.Header.id_infraccion }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al liberar garantía')
      addToast('Garantía liberada correctamente', 'success')
      onSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al liberar garantía'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLiberando(false)
    }
  }

  return (
    <div
      className="w-full max-w-2xl rounded-2xl border overflow-hidden bg-white border-slate-200 shadow-modal"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-500">
            <Shield size={18} strokeWidth={2.2} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-medium text-slate-900">Devolver garantía</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Folio {detalle.Header.folio_de_infraccion}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={liberando}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-500 transition-colors disabled:opacity-50 bg-white border border-slate-200"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">

        {/* Garantía */}
        <div className="rounded-xl p-4 bg-green-50 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium tracking-wider uppercase text-green-600 mb-1">
                Garantía retenida
              </p>
              <p className="text-lg font-medium text-slate-900">{garantia.label}</p>
              {garantia.desc && (
                <p className="text-xs text-slate-500 mt-0.5">{garantia.desc}</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-green-100">
              <CheckCircle2 size={20} strokeWidth={2} className="text-green-500" />
            </div>
          </div>
        </div>

        {/* Grid de detalles */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-4 bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <User size={13} strokeWidth={2} className="text-slate-500" />
              <span className="text-[10px] font-medium tracking-wider uppercase text-slate-500">Infractor</span>
            </div>
            <p className="text-sm font-medium text-slate-900">
              {detalle.datos_infractor.nombre_infractor || '—'}
            </p>
            {detalle.datos_infractor.curp_infractor && (
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {detalle.datos_infractor.curp_infractor}
              </p>
            )}
          </div>

          <div className="rounded-xl p-4 bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Truck size={13} strokeWidth={2} className="text-slate-500" />
              <span className="text-[10px] font-medium tracking-wider uppercase text-slate-500">Vehículo</span>
            </div>
            <p className="text-sm font-medium text-slate-900">{detalle.vehiculo.placa || '—'}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {detalle.vehiculo.marca} {detalle.vehiculo.modelo} {detalle.vehiculo.anio}
            </p>
          </div>

          <div className="rounded-xl p-4 bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={13} strokeWidth={2} className="text-slate-500" />
              <span className="text-[10px] font-medium tracking-wider uppercase text-slate-500">Fecha infracción</span>
            </div>
            <p className="text-sm font-medium text-slate-900">
              {new Date(detalle.Header.fecha_de_registro_de_infraccion).toLocaleDateString('es-MX', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>

          <div className="rounded-xl p-4 bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={13} strokeWidth={2} className="text-slate-500" />
              <span className="text-[10px] font-medium tracking-wider uppercase text-slate-500">Estatus pago</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${pagoCompletado ? 'bg-green-500' : 'bg-amber-500'}`} />
              <p className="text-sm font-medium text-slate-900">
                {pagoCompletado ? 'Pagado' : 'Pendiente'}
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200" role="alert">
            <AlertCircle size={12} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-red-600">{error}</p>
          </div>
        )}

        <p className="text-xs text-slate-500 leading-relaxed">
          Al confirmar, la garantía será liberada y la infracción pasará a estatus{' '}
          <strong className="text-slate-900 font-medium">Cerrada</strong>. Este proceso es irreversible.
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t flex items-center justify-between border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <Hash size={12} strokeWidth={2} className="text-slate-400" />
          <span className="text-[11px] text-slate-400 font-mono">ID: {detalle.Header.id_infraccion}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={liberando}
            className="px-4 py-2 rounded-lg text-[13px] font-medium border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 transition-colors duration-150 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleLiberar}
            disabled={liberando || !pagoCompletado}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-medium text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: liberando ? '#94A3B8' : '#22C55E',
              boxShadow: liberando ? 'none' : '0 4px 12px rgba(34,197,94,0.25)',
            }}
          >
            {liberando ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Liberando…
              </>
            ) : (
              <>
                <CheckCircle2 size={14} strokeWidth={2.5} />
                Confirmar devolución
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
