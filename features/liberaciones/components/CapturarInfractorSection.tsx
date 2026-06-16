'use client'

import { useState } from 'react'
import { Loader2, Save, User } from 'lucide-react'

type Props = {
  infraccionId: string
  onSuccess: () => void
}

export default function CapturarInfractorSection({ infraccionId, onSuccess }: Props) {
  const [nombre, setNombre] = useState('')
  const [appaterno, setAppaterno] = useState('')
  const [apmaterno, setApmaterno] = useState('')
  const [correo, setCorreo] = useState('')
  const [esTitular, setEsTitular] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!nombre.trim() || !appaterno.trim()) {
      setError('Nombre y apellido paterno son requeridos')
      return
    }
    if (esTitular === null) {
      setError('Indica si el infractor es el titular')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/liberaciones/guardarDatosInfractor', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: infraccionId,
          nombre_infractor: nombre.trim().toUpperCase(),
          apellido_paterno_infractor: appaterno.trim().toUpperCase(),
          apellido_materno_infractor: apmaterno.trim().toUpperCase(),
          correo_infractor: correo.trim(),
          es_titular: esTitular,
        }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      onSuccess()
    } catch (err) {
      setError('Error al guardar los datos')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border p-5 space-y-4" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F59E0B' }}>
          <User size={14} strokeWidth={2.2} className="text-white" />
        </div>
        <p className="text-[13px] font-semibold text-[#92400E]">Capturar datos del infractor</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#64748B] block mb-1.5">Nombre(s) *</label>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Nombre(s)"
            className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none transition-colors"
            style={{ borderColor: '#E2E8F0', color: '#0F172A' }}
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#64748B] block mb-1.5">A. Paterno *</label>
          <input
            value={appaterno}
            onChange={e => setAppaterno(e.target.value)}
            placeholder="Paterno"
            className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none transition-colors"
            style={{ borderColor: '#E2E8F0', color: '#0F172A' }}
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#64748B] block mb-1.5">A. Materno</label>
          <input
            value={apmaterno}
            onChange={e => setApmaterno(e.target.value)}
            placeholder="Materno"
            className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none transition-colors"
            style={{ borderColor: '#E2E8F0', color: '#0F172A' }}
          />
        </div>
      </div>

      <div>
        <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#64748B] block mb-1.5">Correo electrónico</label>
        <input
          value={correo}
          onChange={e => setCorreo(e.target.value)}
          placeholder="correo@ejemplo.com"
          type="email"
          className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none transition-colors"
          style={{ borderColor: '#E2E8F0', color: '#0F172A' }}
        />
      </div>

      <div>
        <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#64748B] block mb-2">¿Es el titular? *</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEsTitular(true)}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${esTitular === true ? 'text-white' : 'text-[#64748B] border'}`}
            style={{
              background: esTitular === true ? '#2563EB' : '#FFFFFF',
              borderColor: esTitular === true ? '#2563EB' : '#E2E8F0',
            }}
          >Sí</button>
          <button
            type="button"
            onClick={() => setEsTitular(false)}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${esTitular === false ? 'text-white' : 'text-[#64748B] border'}`}
            style={{
              background: esTitular === false ? '#EF4444' : '#FFFFFF',
              borderColor: esTitular === false ? '#EF4444' : '#E2E8F0',
            }}
          >No</button>
        </div>
      </div>

      {error && <p className="text-[12px] font-medium text-[#DC2626]">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-all disabled:opacity-50"
        style={{ background: saving ? '#94A3B8' : '#F59E0B', boxShadow: saving ? 'none' : '0 4px 12px rgba(245,158,11,0.3)' }}
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} strokeWidth={2.5} />}
        {saving ? 'Guardando…' : 'Guardar datos del infractor'}
      </button>
    </div>
  )
}
