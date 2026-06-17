'use client'

import { useState } from 'react'
import { Shield, CheckCircle2, Loader2, FileText, User, Truck, Calendar, MapPin, Hash, X } from 'lucide-react'
import { DetalleCompleto } from '@/features/compartido/types/detalleInfraccion'

interface Props {
  detalle: DetalleCompleto
  onSuccess: () => void
  onClose?: () => void
}

export default function ModalEntregarGarantia({ detalle, onSuccess, onClose }: Props) {
  const [liberando, setLiberando] = useState(false)
  const [error, setError] = useState('')

  const pagoCompletado = detalle.Header.estatus_orden_pago === 'P'

  const garantiaLabel = (() => {
    const g = detalle.garantia?.garantia_retenida
    if (!g || g === 'NO_DATA') return 'No especificada'
    if (g === 'true') return 'Garantía entregada'
    return g
  })()

  const montoTotal = (() => {
    const total = Number(detalle.Infraccion.total_pesos) || 0
    return total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 })
  })()

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
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al liberar garantía')
    } finally {
      setLiberando(false)
    }
  }

  return (
    // ✅ Solo la tarjeta, sin overlay propio — el padre maneja el backdrop
    <div
      className="w-full max-w-2xl rounded-2xl border overflow-hidden"
      style={{
        background: '#FFFFFF',
        borderColor: '#E2E8F0',
        boxShadow: '0 25px 80px rgba(0,0,0,0.2), 0 10px 24px rgba(0,0,0,0.08)',
      }}
      onClick={e => e.stopPropagation()} // ✅ Evita cerrar al clickar dentro
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{ borderColor: '#F1F5F9', background: '#F8FAFC' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#22C55E' }}
          >
            <Shield size={18} strokeWidth={2.2} className="text-white" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#0F172A]">Devolver garantía</h2>
            <p className="text-[11px] text-[#64748B] mt-0.5">Folio {detalle.Header.folio_de_infraccion}</p>
          </div>
        </div>
        {/* ✅ Botón X llama a onClose del padre */}
        <button
          onClick={onClose}
          disabled={liberando}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#64748B] transition-colors disabled:opacity-50"
          style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">

        {/* Garantía */}
        <div className="rounded-xl p-4" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#16A34A] mb-1">
                Garantía retenida
              </p>
              <p className="text-[18px] font-bold text-[#0F172A]">{garantiaLabel}</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: '#DCFCE7' }}
            >
              <CheckCircle2 size={20} strokeWidth={2} className="text-[#22C55E]" />
            </div>
          </div>
        </div>

        {/* Monto */}
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}
        >
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#EA580C] mb-0.5">
              Monto de la infracción
            </p>
            <p className="text-[11px] text-[#64748B]">
              {detalle.Infraccion.articulo_descripcion} — {detalle.Infraccion.fraccion_descripcion}
            </p>
          </div>
          <p className="text-[20px] font-bold text-[#0F172A]">{montoTotal}</p>
        </div>

        {/* Grid de detalles */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-2 mb-2">
              <User size={13} strokeWidth={2} className="text-[#64748B]" />
              <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#64748B]">Infractor</span>
            </div>
            <p className="text-[14px] font-semibold text-[#0F172A]">
              {detalle.datos_infractor.nombre_infractor || '—'}
            </p>
            {detalle.datos_infractor.curp_infractor && (
              <p className="text-[11px] text-[#64748B] font-mono mt-0.5">
                {detalle.datos_infractor.curp_infractor}
              </p>
            )}
          </div>

          <div className="rounded-xl p-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-2 mb-2">
              <Truck size={13} strokeWidth={2} className="text-[#64748B]" />
              <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#64748B]">Vehículo</span>
            </div>
            <p className="text-[14px] font-semibold text-[#0F172A]">{detalle.vehiculo.placa || '—'}</p>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              {detalle.vehiculo.marca} {detalle.vehiculo.modelo} {detalle.vehiculo.anio}
            </p>
          </div>

          <div className="rounded-xl p-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={13} strokeWidth={2} className="text-[#64748B]" />
              <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#64748B]">Fecha infracción</span>
            </div>
            <p className="text-[14px] font-semibold text-[#0F172A]">
              {new Date(detalle.Header.fecha_de_registro_de_infraccion).toLocaleDateString('es-MX', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>

          <div className="rounded-xl p-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={13} strokeWidth={2} className="text-[#64748B]" />
              <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#64748B]">Estatus pago</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${pagoCompletado ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'}`} />
              <p className="text-[14px] font-semibold text-[#0F172A]">
                {pagoCompletado ? 'Pagado' : 'Pendiente'}
              </p>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        {detalle.ubicacion?.calle && (
          <div className="rounded-xl p-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={13} strokeWidth={2} className="text-[#64748B]" />
              <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#64748B]">Ubicación</span>
            </div>
            <p className="text-[13px] text-[#0F172A]">
              {detalle.ubicacion.calle} {detalle.ubicacion.numero}, {detalle.ubicacion.cod_postal},{' '}
              {detalle.ubicacion.municipio}, {detalle.ubicacion.estado}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg p-3" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <p className="text-[12px] font-medium text-[#DC2626]">{error}</p>
          </div>
        )}

        <p className="text-[12px] text-[#64748B] leading-relaxed">
          Al confirmar, la garantía será liberada y la infracción pasará a estatus{' '}
          <strong style={{ color: '#0F172A' }}>Cerrada</strong>. Este proceso es irreversible.
        </p>
      </div>

      {/* Footer */}
      <div
        className="px-6 py-4 border-t flex items-center justify-between"
        style={{ borderColor: '#E2E8F0', background: '#FAFAFA' }}
      >
        <div className="flex items-center gap-2">
          <Hash size={12} strokeWidth={2} className="text-[#94A3B8]" />
          <span className="text-[11px] text-[#94A3B8] font-mono">ID: {detalle.Header.id_infraccion}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* ✅ Cancelar también llama a onClose del padre */}
          <button
            onClick={onClose}
            disabled={liberando}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold border transition-colors disabled:opacity-50"
            style={{ borderColor: '#E2E8F0', color: '#64748B', background: '#FFFFFF' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleLiberar}
            disabled={liberando || !pagoCompletado}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-white transition-all disabled:opacity-50"
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