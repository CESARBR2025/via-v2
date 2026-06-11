'use client'

import { useState } from 'react'
import { User, Play, Shield, CheckCircle2, Loader2 } from 'lucide-react'
import { DetalleCompleto } from '@/features/compartido/components/ModalDetalleGenerico'

interface Props {
  detalle: DetalleCompleto
  onSuccess: () => void
}

export default function CapturarDatosTitularSection({ detalle, onSuccess }: Props) {
  const estatus = detalle.Header.estatus_dependencia

  console.log(detalle)

  if (estatus === 'PENDIENTE_DATOS_INFRACTOR') {
    return <TitularForm detalle={detalle} onSuccess={onSuccess} />
  }

  if (estatus === 'PENDIENTE_PAGO_INFRACCION' || estatus === 'PENDIENTE_ENTREGA_GARANTIA') {
    return <EntregarGarantiaButton detalle={detalle} onSuccess={onSuccess} />
  }

  return null
}

function isNoData(v: string | null | undefined): boolean {
  return !v || v === 'NO_DATA' || v.trim() === ''
}

function TitularForm({ detalle, onSuccess }: Props) {
  const d = detalle.datos_infractor

  const infractorNoData =
    isNoData(d?.nombre_infractor) &&
    isNoData(d?.curp_infractor)

  const esTitularPredeterminado = d?.es_titular === true

  const [esTitular, setEsTitular] = useState(esTitularPredeterminado)

  const [infrNombre, setInfrNombre] = useState('')
  const [infrAppaterno, setInfrAppaterno] = useState('')
  const [infrApmaterno, setInfrApmaterno] = useState('')
  const [infrCurp, setInfrCurp] = useState('')
  const [infrCorreo, setInfrCorreo] = useState('')

  const getInfractorNombre = () => infrNombre || (d?.nombre_infractor ?? '')
  const getInfractorAppaterno = () => infrAppaterno || (d?.appaterno_infractor ?? '')
  const getInfractorApmaterno = () => infrApmaterno || (d?.apmaterno_infractor ?? '')
  const getInfractorCurp = () => infrCurp || (d?.curp_infractor ?? '')
  const getInfractorCorreo = () => infrCorreo || (d?.correo_infractor ?? '')

  const titularInicial = esTitularPredeterminado
    ? (d?.nombre_infractor ?? '')
    : ''

  const [nombre, setNombre] = useState(titularInicial)
  const [appaterno, setAppaterno] = useState(
    esTitularPredeterminado ? (d?.appaterno_infractor ?? '') : '',
  )
  const [apmaterno, setApmaterno] = useState(
    esTitularPredeterminado ? (d?.apmaterno_infractor ?? '') : '',
  )
  const [curp, setCurp] = useState(
    esTitularPredeterminado ? (d?.curp_infractor ?? '') : '',
  )
  const [correo, setCorreo] = useState(
    esTitularPredeterminado ? (d?.correo_infractor ?? '') : '',
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const copyInfractorToTitular = () => {
    setNombre(getInfractorNombre())
    setAppaterno(getInfractorAppaterno())
    setApmaterno(getInfractorApmaterno())
    setCurp(getInfractorCurp())
    setCorreo(getInfractorCorreo())
  }

  const clearTitular = () => {
    setNombre('')
    setAppaterno('')
    setApmaterno('')
    setCurp('')
    setCorreo('')
  }

  const handleToggle = (value: boolean) => {
    setEsTitular(value)
    if (value) {
      copyInfractorToTitular()
    } else {
      clearTitular()
    }
  }

  const handleSubmit = async () => {
    if (!esTitular) {
      if (!nombre.trim() || !appaterno.trim() || !curp.trim() || !correo.trim()) {
        setError('Todos los campos del titular son obligatorios')
        return
      }
    } else {
      const titularNombre = nombre.trim()
      const titularAppaterno = appaterno.trim()
      const titularCurp = curp.trim()
      if (!titularNombre || !titularAppaterno || !titularCurp) {
        setError('Los datos del titular (nombre, apellido paterno y CURP) son obligatorios')
        return
      }
    }

    if (infractorNoData) {
      if (!infrNombre.trim() || !infrAppaterno.trim() || !infrCurp.trim()) {
        setError('Los datos del infractor (nombre, apellido paterno y CURP) son obligatorios')
        return
      }
    }

    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/infracciones/iniciarProceso', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: detalle.Header.id_infraccion,
          es_titular: esTitular,
          nombre_titular: nombre.trim(),
          appaterno_titular: appaterno.trim(),
          apmaterno_titular: apmaterno.trim(),
          curp_titular: curp.trim().toUpperCase(),
          correo_titular: correo.trim(),
          nombre_infractor: infrNombre.trim().toUpperCase() || null,
          appaterno_infractor: infrAppaterno.trim().toUpperCase() || null,
          apmaterno_infractor: infrApmaterno.trim().toUpperCase() || null,
          curp_infractor: infrCurp.trim().toUpperCase() || null,
          correo_infractor: infrCorreo.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      setSubmitted(true)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los datos')
    } finally {
      setSaving(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
        <div className="px-5 py-3 flex items-center gap-3 border-b" style={{ background: '#F0FDF4', borderColor: '#BBF7D066' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#22C55E' }}>
            <CheckCircle2 size={14} strokeWidth={2.2} className="text-white" />
          </div>
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#16A34A' }}>Titular registrado</h3>
        </div>
        <div className="p-5 text-center">
          <CheckCircle2 size={24} strokeWidth={2} className="mx-auto text-[#22C55E]" />
          <p className="text-[14px] font-semibold text-[#166534] mt-2">Datos del titular guardados</p>
          <p className="text-[12px] text-[#16A34A] mt-0.5">El caso ha sido iniciado correctamente.</p>
        </div>
      </div>
    )
  }

  const infrNombreDisplay = d?.nombre_infractor ?? ''
  const infrAppaternoDisplay = d?.appaterno_infractor ?? ''
  const infrApmaternoDisplay = d?.apmaterno_infractor ?? ''
  const infrCurpDisplay = d?.curp_infractor ?? ''
  const infrCorreoDisplay = d?.correo_infractor ?? ''

  const inputClass = "w-full rounded-lg border px-2.5 py-1.5 text-[13px] outline-none transition-all"

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
      <div className="px-5 py-3 flex items-center gap-3 border-b" style={{ background: '#EFF6FF', borderColor: '#2563EB22' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#2563EB' }}>
          <User size={14} strokeWidth={2.2} className="text-white" />
        </div>
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#2563EB' }}>Capturar datos del titular</h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Infractor data */}
        <div className="rounded-lg p-4 space-y-2" style={{ background: infractorNoData ? '#FFFBEB' : '#F8FAFC', border: `1px solid ${infractorNoData ? '#FDE68A' : '#E2E8F0'}` }}>
          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#64748B]">Datos del infractor</p>
          {infractorNoData ? (
            <>
              <p className="text-[11px] text-[#92400E] mb-2">Los datos del infractor no fueron capturados. Complétalos:</p>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Nombre(s)" value={infrNombre} onChange={setInfrNombre} placeholder="Nombre(s)" />
                  <Field label="A. Paterno" value={infrAppaterno} onChange={setInfrAppaterno} placeholder="Paterno" />
                  <Field label="A. Materno" value={infrApmaterno} onChange={setInfrApmaterno} placeholder="Materno" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="CURP" value={infrCurp} onChange={setInfrCurp} placeholder="CURP (18 caracteres)" maxLength={18} uppercase />
                  <Field label="Correo" value={infrCorreo} onChange={setInfrCorreo} placeholder="correo@ejemplo.com" type="email" />
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-wider uppercase text-[#94A3B8]">Nombre completo</p>
                <p className="text-[13px] font-semibold text-[#0F172A]">
                  {[infrNombreDisplay, infrAppaternoDisplay, infrApmaternoDisplay].filter(Boolean).join(' ') || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider uppercase text-[#94A3B8]">CURP</p>
                <p className="text-[13px] font-semibold font-mono text-[#0F172A]">{infrCurpDisplay || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider uppercase text-[#94A3B8]">Correo</p>
                <p className="text-[13px] font-semibold text-[#0F172A]">{infrCorreoDisplay || '—'}</p>
              </div>
            </div>
          )}

        </div>

        {/* Toggle ¿Es el titular? */}
        <div>
          <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#64748B] block mb-2">¿Es el titular?</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleToggle(true)}
              className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${esTitular ? 'text-white' : 'text-[#64748B] border'}`}
              style={{
                background: esTitular ? '#2563EB' : '#FFFFFF',
                borderColor: esTitular ? '#2563EB' : '#E2E8F0',
                boxShadow: esTitular ? '0 4px 12px rgba(37,99,235,0.2)' : 'none',
              }}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => handleToggle(false)}
              className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${!esTitular ? 'text-white' : 'text-[#64748B] border'}`}
              style={{
                background: !esTitular ? '#EF4444' : '#FFFFFF',
                borderColor: !esTitular ? '#EF4444' : '#E2E8F0',
                boxShadow: !esTitular ? '0 4px 12px rgba(239,68,68,0.2)' : 'none',
              }}
            >
              No
            </button>
          </div>
        </div>

        {!esTitular && (
          <div className="rounded-lg p-4 space-y-3" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#DC2626]">Datos del titular (capturar)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Nombre(s)" value={nombre} onChange={setNombre} placeholder="Nombre(s)" />
              <Field label="A. Paterno" value={appaterno} onChange={setAppaterno} placeholder="Paterno" />
              <Field label="A. Materno" value={apmaterno} onChange={setApmaterno} placeholder="Materno" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="CURP" value={curp} onChange={setCurp} placeholder="CURP (18 caracteres)" maxLength={18} uppercase />
              <Field label="Correo electrónico" value={correo} onChange={setCorreo} placeholder="correo@ejemplo.com" type="email" />
            </div>
          </div>
        )}

        {esTitular && (
          <div className="rounded-lg p-4 space-y-2" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#16A34A]">Datos del titular (prellenados)</p>
            <p className="text-[12px] text-[#166534]">Los datos del infractor se usarán como datos del titular.</p>
          </div>
        )}

        {error && (
          <p className="text-[12px] font-medium text-[#DC2626]">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: saving ? '#94A3B8' : '#2563EB', boxShadow: saving ? 'none' : '0 4px 12px rgba(37,99,235,0.25)' }}
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Play size={14} strokeWidth={2.5} fill="white" />
          )}
          {saving ? 'Guardando…' : 'Iniciar proceso'}
        </button>
      </div>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, maxLength, type, uppercase,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  maxLength?: number
  type?: string
  uppercase?: boolean
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold tracking-wider uppercase text-[#64748B]">{label}</label>
      <input
        type={type ?? 'text'}
        value={value}
        onChange={e => onChange(uppercase ? e.target.value.toUpperCase() : e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-lg border px-2.5 py-1.5 text-[13px] outline-none transition-all"
        style={{ borderColor: '#E2E8F0', color: '#0F172A', background: '#FFFFFF', fontFamily: uppercase ? 'monospace' : undefined, letterSpacing: uppercase ? '0.05em' : undefined }}
        onFocus={e => { e.target.style.borderColor = '#EF4444'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.12)' }}
        onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}

function EntregarGarantiaButton({ detalle, onSuccess }: Props) {
  const [liberando, setLiberando] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const pagoCompletado = detalle.Header.estatus_orden_pago === 'P'

  const garantiaLabel = (() => {
    const g = detalle.garantia?.garantia_retenida
    if (!g || g === 'NO_DATA') return 'No especificada'
    if (g === 'true') return 'Garantía entregada'
    return g
  })()

  const handleLiberar = async () => {
    setLiberando(true)
    try {
      const res = await fetch('/api/infracciones/liberarGarantia', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: detalle.Header.id_infraccion }),
      })
      if (!res.ok) throw new Error('Error al liberar garantía')
      setModalOpen(false)
      onSuccess()
    } catch (err) {
      console.error(err)
    } finally {
      setLiberando(false)
    }
  }

  return (
    <>
      <div className="rounded-xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
        <div className="px-5 py-3 flex items-center gap-3 border-b" style={{ background: '#F0FDF4', borderColor: '#BBF7D066' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#22C55E' }}>
            <Shield size={14} strokeWidth={2.2} className="text-white" />
          </div>
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#16A34A' }}>Liberar garantía</h3>
        </div>
        <div className="p-5 space-y-3">
          <div className="rounded-lg p-4 space-y-2" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#16A34A]">Garantía retenida</p>
            <p className="text-[15px] font-bold text-[#0F172A]">{garantiaLabel}</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            disabled={!pagoCompletado || liberando}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: pagoCompletado ? '#22C55E' : '#94A3B8',
              boxShadow: pagoCompletado ? '0 4px 12px rgba(34,197,94,0.25)' : 'none',
            }}
          >
            {liberando ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle2 size={14} strokeWidth={2.5} />
            )}
            {liberando ? 'Liberando…' : 'Entregar garantía'}
          </button>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(15,23,42,0.5)' }}
          onClick={() => !liberando && setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border overflow-hidden"
            style={{ background: '#FFFFFF', borderColor: '#E2E8F0', boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.08)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#F1F5F9' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#22C55E' }}>
                  <Shield size={16} strokeWidth={2.2} className="text-white" />
                </div>
                <h2 className="text-[16px] font-bold text-[#0F172A]">Confirmar liberación</h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                disabled={liberando}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#64748B] transition-colors disabled:opacity-50"
                style={{ background: '#F1F5F9' }}
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="rounded-xl p-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#64748B] mb-1">Folio</p>
                <p className="text-[15px] font-bold text-[#0F172A] font-mono">{detalle.Header.folio_de_infraccion}</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#16A34A] mb-1">Garantía retenida</p>
                <p className="text-[15px] font-bold text-[#0F172A]">{garantiaLabel}</p>
              </div>
              <p className="text-[12px] text-[#64748B]">
                Al liberar la garantía, el estatus cambiará a <strong>Liberada</strong> y se dará por concluido el proceso de infracciones.
              </p>
            </div>
            <div className="px-6 py-4 border-t flex items-center justify-end gap-3" style={{ borderColor: '#F1F5F9', background: '#F8FAFC' }}>
              <button
                onClick={() => setModalOpen(false)}
                disabled={liberando}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold border transition-colors disabled:opacity-50"
                style={{ borderColor: '#E2E8F0', color: '#64748B', background: '#FFFFFF' }}
              >
                Cerrar
              </button>
              <button
                onClick={handleLiberar}
                disabled={liberando}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: liberando ? '#94A3B8' : '#22C55E', boxShadow: liberando ? 'none' : '0 4px 12px rgba(34,197,94,0.25)' }}
              >
                {liberando ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} strokeWidth={2.5} />
                )}
                {liberando ? 'Liberando…' : 'Liberar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
