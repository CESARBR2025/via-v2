'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { User, Play, CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import { DetalleCompleto } from '@/features/compartido/types/detalleInfraccion'
import ModalEntregarGarantia from './ModalEntregarGarantia'

interface Props {
  detalle: DetalleCompleto
  onSuccess: () => void
}

export default function CapturarDatosTitularSection({ detalle, onSuccess }: Props) {
  const estatus = detalle.Header.estatus_dependencia

  if (estatus === 'PENDIENTE_DATOS_INFRACTOR') {
    return <TitularForm detalle={detalle} onSuccess={onSuccess} />
  }

  if (estatus === 'PENDIENTE_PAGO_INFRACCION' || estatus === 'PENDIENTE_ENTREGA_GARANTIA' || estatus === 'PENDIENTE_DEVOLUCION_GARANTIA') {
    return <ModalEntregarGarantia detalle={detalle} onSuccess={onSuccess} />
  }

  return null
}

function isNoData(v: string | null | undefined): boolean {
  return !v || v === 'NO_DATA' || v.trim() === ''
}

type FieldName = 'infrNombre' | 'infrAppaterno' | 'infrApmaterno' | 'infrCurp' | 'infrCorreo' | 'nombre' | 'appaterno' | 'apmaterno' | 'curp' | 'correo'

const FIELD_LABELS: Record<FieldName, string> = {
  infrNombre: 'Nombre(s)',
  infrAppaterno: 'A. Paterno',
  infrApmaterno: 'A. Materno',
  infrCurp: 'CURP',
  infrCorreo: 'Correo',
  nombre: 'Nombre(s)',
  appaterno: 'A. Paterno',
  apmaterno: 'A. Materno',
  curp: 'CURP',
  correo: 'Correo',
}

function validateField(name: FieldName, value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return 'Requerido'
  if (name === 'infrCurp' || name === 'curp') {
    if (trimmed.length !== 18) return 'Debe tener 18 caracteres'
  }
  if (name === 'infrCorreo' || name === 'correo') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Correo inválido'
  }
  return undefined
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
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [touched, setTouched] = useState<Set<FieldName>>(new Set())

  const firstErrorRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const markTouched = useCallback((name: FieldName) => {
    setTouched(prev => new Set(prev).add(name))
  }, [])

  const validateAndSet = useCallback((name: FieldName, value: string) => {
    const error = validateField(name, value)
    setFieldErrors(prev => {
      const next = { ...prev }
      if (error) next[name] = error
      else delete next[name]
      return next
    })
  }, [])

  const handleBlur = useCallback((name: FieldName, value: string) => {
    markTouched(name)
    const trimmed = value.trim()
    if (!trimmed && name !== 'infrApmaterno' && name !== 'apmaterno' && name !== 'infrCorreo') {
      validateAndSet(name, value)
    } else if (trimmed) {
      validateAndSet(name, value)
    }
  }, [markTouched, validateAndSet])

  const clearFieldError = useCallback((name: FieldName) => {
    setFieldErrors(prev => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  const handleFieldChange = useCallback((name: FieldName, setter: (v: string) => void, value: string) => {
    setter(value)
    clearFieldError(name)
  }, [clearFieldError])

  const copyInfractorToTitular = () => {
    const vals = {
      nombre: getInfractorNombre(),
      appaterno: getInfractorAppaterno(),
      apmaterno: getInfractorApmaterno(),
      curp: getInfractorCurp(),
      correo: getInfractorCorreo(),
    }
    setNombre(vals.nombre)
    setAppaterno(vals.appaterno)
    setApmaterno(vals.apmaterno)
    setCurp(vals.curp)
    setCorreo(vals.correo)
    setFieldErrors(prev => {
      const next = { ...prev }
      delete next.nombre
      delete next.appaterno
      delete next.apmaterno
      delete next.curp
      delete next.correo
      return next
    })
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

  const getActiveErrors = useCallback((): Partial<Record<FieldName, string>> => {
    const errors: Partial<Record<FieldName, string>> = {}

    if (infractorNoData) {
      for (const name of ['infrNombre', 'infrAppaterno', 'infrCurp'] as FieldName[]) {
        const val = name === 'infrNombre' ? infrNombre : name === 'infrAppaterno' ? infrAppaterno : infrCurp
        const err = validateField(name, val)
        if (err) errors[name] = err
      }
    }

    if (!esTitular) {
      for (const name of ['nombre', 'appaterno', 'curp', 'correo'] as FieldName[]) {
        const val = name === 'nombre' ? nombre : name === 'appaterno' ? appaterno : name === 'curp' ? curp : correo
        const err = validateField(name, val)
        if (err) errors[name] = err
      }
    } else {
      for (const name of ['nombre', 'appaterno', 'curp'] as FieldName[]) {
        const val = name === 'nombre' ? nombre : name === 'appaterno' ? appaterno : curp
        const err = validateField(name, val)
        if (err) errors[name] = err
      }
    }

    return errors
  }, [infractorNoData, esTitular, infrNombre, infrAppaterno, infrCurp, nombre, appaterno, curp, correo])

  const handleSubmit = async () => {
    const errors = getActiveErrors()
    setFieldErrors(errors)
    setSubmitError('')

    if (Object.keys(errors).length > 0) {
      const allNames = new Set<FieldName>([...touched])
      Object.keys(errors).forEach(k => allNames.add(k as FieldName))
      setTouched(allNames)
      return
    }

    setSaving(true)
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
      setSubmitError(err instanceof Error ? err.message : 'Error al guardar los datos')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (Object.keys(fieldErrors).length > 0 && firstErrorRef.current) {
      firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [fieldErrors])

  if (submitted) {
    return (
      <div
        className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#BBF7D0]/40 bg-[#F0FDF4]">
          <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded-lg bg-[#22C55E]">
            <CheckCircle2 size={14} strokeWidth={2.5} className="text-white" />
          </div>
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#16A34A]">Titular registrado</h3>
            <p className="text-[11px] text-[#22C55E] mt-0.5">El caso ha sido iniciado correctamente</p>
          </div>
        </div>
        <div className="px-5 py-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-3">
            <CheckCircle2 size={24} strokeWidth={2} className="text-[#22C55E]" />
          </div>
          <p className="text-[14px] font-semibold text-[#166534]">Datos del titular guardados</p>
          <p className="mt-1 text-[12px] text-[#16A34A]">El proceso ha sido iniciado exitosamente.</p>
        </div>
      </div>
    )
  }

  const infrNombreDisplay = d?.nombre_infractor ?? ''
  const infrAppaternoDisplay = d?.appaterno_infractor ?? ''
  const infrApmaternoDisplay = d?.apmaterno_infractor ?? ''
  const infrCurpDisplay = d?.curp_infractor ?? ''
  const infrCorreoDisplay = d?.correo_infractor ?? ''

  const inputClass = "w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-[13px] text-[#0F172A] outline-none transition-all duration-150 placeholder:text-[#94A3B8] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:cursor-not-allowed"

  return (
    <div ref={formRef} className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded-lg bg-[#2563EB]">
          <User size={14} strokeWidth={2.5} className="text-white" />
        </div>
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#2563EB]">Capturar datos del titular</h3>
          <p className="text-[10px] text-[#64748B] mt-0.5">Registra los datos del titular de la infracción</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* ═══ Paso 1: Datos del infractor ═══ */}
        <div role="group" aria-labelledby="step1-label">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#2563EB] text-[10px] font-bold text-white" aria-hidden="true">1</span>
            <p id="step1-label" className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#64748B]">Datos del infractor</p>
          </div>

          {infractorNoData ? (
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]">
                <AlertCircle size={12} className="text-[#2563EB] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#1E40AF] leading-relaxed">
                  Los datos del infractor no fueron capturados. Complétalos.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Field
                  name="infrNombre"
                  label="Nombre(s)"
                  value={infrNombre}
                  onChange={v => handleFieldChange('infrNombre', setInfrNombre, v)}
                  onBlur={() => handleBlur('infrNombre', infrNombre)}
                  placeholder="Nombre(s)"
                  className={inputClass}
                  error={touched.has('infrNombre') ? fieldErrors.infrNombre : undefined}
                  required
                  autoComplete="given-name"
                />
                <Field
                  name="infrAppaterno"
                  label="A. Paterno"
                  value={infrAppaterno}
                  onChange={v => handleFieldChange('infrAppaterno', setInfrAppaterno, v)}
                  onBlur={() => handleBlur('infrAppaterno', infrAppaterno)}
                  placeholder="Paterno"
                  className={inputClass}
                  error={touched.has('infrAppaterno') ? fieldErrors.infrAppaterno : undefined}
                  required
                  autoComplete="family-name"
                />
                <Field
                  name="infrApmaterno"
                  label="A. Materno"
                  value={infrApmaterno}
                  onChange={v => handleFieldChange('infrApmaterno', setInfrApmaterno, v)}
                  onBlur={() => markTouched('infrApmaterno')}
                  placeholder="Materno"
                  className={inputClass}
                  autoComplete="additional-name"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Field
                  name="infrCurp"
                  label="CURP"
                  value={infrCurp}
                  onChange={v => handleFieldChange('infrCurp', setInfrCurp, v)}
                  onBlur={() => handleBlur('infrCurp', infrCurp)}
                  placeholder="CURP (18 caracteres)"
                  maxLength={18}
                  uppercase
                  className={inputClass}
                  error={touched.has('infrCurp') ? fieldErrors.infrCurp : undefined}
                  required
                  autoComplete="off"
                  inputMode="text"
                />
                <Field
                  name="infrCorreo"
                  label="Correo"
                  value={infrCorreo}
                  onChange={v => handleFieldChange('infrCorreo', setInfrCorreo, v)}
                  onBlur={() => handleBlur('infrCorreo', infrCorreo)}
                  placeholder="correo@ejemplo.com"
                  type="email"
                  className={inputClass}
                  error={touched.has('infrCorreo') ? fieldErrors.infrCorreo : undefined}
                  autoComplete="email"
                />
              </div>
            </div>
          ) : (
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0]">
                  <p className="text-[10px] font-semibold tracking-wider uppercase text-[#94A3B8] mb-0.5">Nombre completo</p>
                  <p className="text-[12px] font-semibold text-[#0F172A] truncate">
                    {[infrNombreDisplay, infrAppaternoDisplay, infrApmaternoDisplay].filter(Boolean).join(' ') || '—'}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0]">
                  <p className="text-[10px] font-semibold tracking-wider uppercase text-[#94A3B8] mb-0.5">CURP</p>
                  <p className="text-[12px] font-semibold font-mono tracking-wider text-[#0F172A]">{infrCurpDisplay || '—'}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0]">
                  <p className="text-[10px] font-semibold tracking-wider uppercase text-[#94A3B8] mb-0.5">Correo</p>
                  <p className="text-[12px] font-semibold text-[#0F172A] truncate">{infrCorreoDisplay || '—'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══ Paso 2: Relación titular ═══ */}
        <div role="group" aria-labelledby="step2-label">
          <div className="flex items-center gap-2.5 mb-3">
            <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white ${esTitular ? 'bg-[#16A34A]' : 'bg-[#2563EB]'}`} aria-hidden="true">2</span>
            <p id="step2-label" className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#64748B]">El infractor es el titular</p>
          </div>

          <div className={`border rounded-xl overflow-hidden ${esTitular ? 'border-[#BBF7D0]' : 'border-[#E2E8F0]'}`}>
            <div className={`flex items-center justify-between px-4 py-2.5 border-b ${esTitular ? 'bg-[#F0FDF4] border-[#BBF7D0]/40' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
              <p className={`text-[11px] font-semibold ${esTitular ? 'text-[#16A34A]' : 'text-[#64748B]'}`}>
                {esTitular ? 'Sí, es el titular' : 'No, es otra persona'}
              </p>
              <div className="inline-flex items-center rounded-md p-0.5 bg-white border border-[#E2E8F0]" role="radiogroup" aria-label="El infractor es el titular">
                <button
                  type="button"
                  role="radio"
                  aria-checked={esTitular}
                  onClick={() => handleToggle(true)}
                  className={`px-3.5 py-1.5 rounded text-[11px] font-semibold transition-all duration-150 ${esTitular
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={!esTitular}
                  onClick={() => handleToggle(false)}
                  className={`px-3.5 py-1.5 rounded text-[11px] font-semibold transition-all duration-150 ${!esTitular
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="p-4">
              {esTitular ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-[#F0FDF4]">
                    <CheckCircle2 size={14} className="text-[#16A34A]" />
                  </div>
                  <p className="text-[12px] text-[#64748B] leading-relaxed">
                    Los datos del infractor se usarán como datos del titular.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]">
                    <AlertCircle size={12} className="text-[#2563EB] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#1E40AF] leading-relaxed">
                      Capture los datos del titular de la infracción.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <Field
                      name="nombre"
                      label="Nombre(s)"
                      value={nombre}
                      onChange={v => handleFieldChange('nombre', setNombre, v)}
                      onBlur={() => handleBlur('nombre', nombre)}
                      placeholder="Nombre(s)"
                      className={inputClass}
                      error={touched.has('nombre') ? fieldErrors.nombre : undefined}
                      required
                      autoComplete="given-name"
                    />
                    <Field
                      name="appaterno"
                      label="A. Paterno"
                      value={appaterno}
                      onChange={v => handleFieldChange('appaterno', setAppaterno, v)}
                      onBlur={() => handleBlur('appaterno', appaterno)}
                      placeholder="Paterno"
                      className={inputClass}
                      error={touched.has('appaterno') ? fieldErrors.appaterno : undefined}
                      required
                      autoComplete="family-name"
                    />
                    <Field
                      name="apmaterno"
                      label="A. Materno"
                      value={apmaterno}
                      onChange={v => handleFieldChange('apmaterno', setApmaterno, v)}
                      onBlur={() => markTouched('apmaterno')}
                      placeholder="Materno"
                      className={inputClass}
                      autoComplete="additional-name"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Field
                      name="curp"
                      label="CURP"
                      value={curp}
                      onChange={v => handleFieldChange('curp', setCurp, v)}
                      onBlur={() => handleBlur('curp', curp)}
                      placeholder="CURP (18 caracteres)"
                      maxLength={18}
                      uppercase
                      className={inputClass}
                      error={touched.has('curp') ? fieldErrors.curp : undefined}
                      required
                      autoComplete="off"
                      inputMode="text"
                    />
                    <Field
                      name="correo"
                      label="Correo electrónico"
                      value={correo}
                      onChange={v => handleFieldChange('correo', setCorreo, v)}
                      onBlur={() => handleBlur('correo', correo)}
                      placeholder="correo@ejemplo.com"
                      type="email"
                      className={inputClass}
                      error={touched.has('correo') ? fieldErrors.correo : undefined}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {submitError && (
          <div
            className="flex items-start gap-2 p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA]"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle size={12} className="text-[#DC2626] shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium text-[#DC2626]">{submitError}</p>
          </div>
        )}

        <div ref={firstErrorRef} />

        {/* ── Submit ── */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          aria-busy={saving}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold text-white transition-all duration-150 ${saving
            ? 'bg-[#94A3B8] cursor-not-allowed opacity-60'
            : 'bg-[#2563EB] shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:bg-[#1D4ED8] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 active:bg-[#1E40AF] active:translate-y-0 active:scale-[0.98]'
            }`}
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Guardando…</span>
            </>
          ) : (
            <>
              <span>Iniciar proceso</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function Field({
  name, label, value, onChange, onBlur, placeholder, maxLength, type, uppercase, className, error, required, autoComplete, inputMode,
}: {
  name: string
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  placeholder?: string
  maxLength?: number
  type?: string
  uppercase?: boolean
  className?: string
  error?: string
  required?: boolean
  autoComplete?: string
  inputMode?: 'text' | 'email' | 'url' | 'search' | 'tel'
}) {
  const fieldId = `field-${name}`
  const errorId = `${fieldId}-error`

  return (
    <div className="space-y-1">
      <label htmlFor={fieldId} className="text-[10px] font-semibold tracking-wider uppercase text-[#64748B]">
        {label}
        {required && <span className="text-[#DC2626] ml-0.5" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          type={type ?? 'text'}
          value={value}
          onChange={e => onChange(uppercase ? e.target.value.toUpperCase() : e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          disabled={false}
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={error ? errorId : undefined}
          className={`${className || ''} ${error
            ? 'border-[#DC2626] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
            : ''
            }`}
          style={{
            fontFamily: uppercase ? 'monospace' : undefined,
            letterSpacing: uppercase ? '0.05em' : undefined,
          }}
        />
      </div>
      <div className="flex items-center justify-between min-h-[16px]">
        {error ? (
          <p id={errorId} role="alert" className="text-[10px] font-medium text-[#DC2626]">{error}</p>
        ) : (
          <span />
        )}
        {maxLength && (
          <p className={`text-[10px] ml-auto ${value.length >= maxLength ? 'text-[#DC2626]' : 'text-[#94A3B8]'}`} aria-live="polite">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}
