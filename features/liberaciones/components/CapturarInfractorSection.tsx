'use client'

import { useState } from 'react'
import { Loader2, Save, AlertCircle } from 'lucide-react'
import { useToastStore } from '@/stores/useToastStore'

type Props = {
  infraccionId: string
  onSuccess: () => void
}

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-all duration-150 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"

function Field({ label, value, onChange, placeholder, error, required, type }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
  error?: string; required?: boolean; type?: string
}) {
  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div className="space-y-1">
      <label htmlFor={fieldId} className="text-xs font-medium tracking-wider uppercase text-slate-500">
        {label}
        {required && <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>}
      </label>
      <input
        id={fieldId}
        type={type ?? 'text'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        aria-required={required}
        className={`${inputClass} ${error ? 'border-red-300 focus:border-red-300 focus:ring-2 focus:ring-red-200/50' : ''}`}
      />
      {error && <p className="text-xs font-medium text-red-600" role="alert">{error}</p>}
    </div>
  )
}

export default function CapturarInfractorSection({ infraccionId, onSuccess }: Props) {
  const [nombre, setNombre] = useState('')
  const [appaterno, setAppaterno] = useState('')
  const [apmaterno, setApmaterno] = useState('')
  const [correo, setCorreo] = useState('')
  const [esTitular, setEsTitular] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const addToast = useToastStore((s) => s.addToast)

  const handleSubmit = async () => {
    const nuevos: Record<string, string> = {}
    if (!nombre.trim()) nuevos.nombre = 'Requerido'
    if (!appaterno.trim()) nuevos.appaterno = 'Requerido'
    if (esTitular === null) nuevos.esTitular = 'Selecciona una opción'
    setErrores(nuevos)
    setError('')
    if (Object.keys(nuevos).length > 0) return

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
      addToast('Datos del infractor guardados correctamente', 'success')
      onSuccess()
    } catch {
      const msg = 'Error al guardar los datos del infractor'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 text-[11px] font-medium px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
        Liberación por infracción
      </span>

      {/* Nombre + Apellidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field
          label="Nombre(s)"
          value={nombre}
          onChange={v => { setNombre(v); setErrores(p => ({ ...p, nombre: '' })) }}
          placeholder="Nombre(s)"
          error={errores.nombre}
          required
        />
        <Field
          label="A. Paterno"
          value={appaterno}
          onChange={v => { setAppaterno(v); setErrores(p => ({ ...p, appaterno: '' })) }}
          placeholder="Paterno"
          error={errores.appaterno}
          required
        />
        <Field
          label="A. Materno"
          value={apmaterno}
          onChange={v => setApmaterno(v)}
          placeholder="Materno"
        />
      </div>

      {/* Correo */}
      <Field
        label="Correo electrónico"
        value={correo}
        onChange={v => setCorreo(v)}
        placeholder="correo@ejemplo.com"
        type="email"
      />

      {/* ¿Es el titular? */}
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-wider uppercase text-slate-500">
          ¿Es el titular? <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>
        </p>
        <div className="inline-flex items-center rounded-md p-0.5 bg-white border border-slate-200">
          <button
            type="button"
            onClick={() => { setEsTitular(true); setErrores(p => ({ ...p, esTitular: '' })) }}
            className={`px-4 py-1.5 rounded text-[13px] font-medium transition-all duration-150 ${esTitular === true ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Sí
          </button>
          <button
            type="button"
            onClick={() => { setEsTitular(false); setErrores(p => ({ ...p, esTitular: '' })) }}
            className={`px-4 py-1.5 rounded text-[13px] font-medium transition-all duration-150 ${esTitular === false ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            No
          </button>
        </div>
        {errores.esTitular && <p className="text-xs font-medium text-red-600">{errores.esTitular}</p>}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200" role="alert">
          <AlertCircle size={12} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-red-600">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        aria-busy={saving}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 active:scale-[0.99] shadow-sm transition-all duration-150 disabled:bg-blue-200 disabled:text-blue-300 disabled:cursor-not-allowed"
      >
        {saving ? (
          <><Loader2 size={14} className="animate-spin" /><span>Guardando…</span></>
        ) : (
          <><Save size={14} strokeWidth={2.5} /><span>Guardar datos del infractor</span></>
        )}
      </button>
    </div>
  )
}
