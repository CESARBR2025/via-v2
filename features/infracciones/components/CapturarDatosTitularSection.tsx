'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { User, CheckCircle2, Loader2, AlertCircle, ArrowRight, Info } from 'lucide-react'
import type { DetalleCompleto } from '@/features/compartido/types/detalleInfraccion'
import ModalEntregarGarantia from './ModalEntregarGarantia'
import { useToastStore } from '@/stores/useToastStore'

interface Props {
  detalle: DetalleCompleto
  onSuccess: () => void
  onClose?: () => void
}

export default function CapturarDatosTitularSection({ detalle, onSuccess, onClose }: Props) {
  const estatus = detalle.Header.estatus_dependencia

  if (estatus === 'PENDIENTE_DATOS_INFRACTOR') {
    return <TitularForm detalle={detalle} onSuccess={onSuccess} onClose={onClose} />
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

function TitularForm({ detalle, onSuccess, onClose }: Props) {
  const addToast = useToastStore((s) => s.addToast)
  const d = detalle.datos_infractor

  const infractorNoData =
    isNoData(d?.nombre_infractor) &&
    isNoData(d?.curp_infractor)

  const esTitularPredeterminado = d?.es_titular === true

  const [esTitular, setEsTitular] = useState(esTitularPredeterminado)
  const [paso, setPaso] = useState(infractorNoData ? 1 : 2)

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
          nombre_titular: esTitular ? getInfractorNombre() : nombre.trim(),
          appaterno_titular: esTitular ? getInfractorAppaterno() : appaterno.trim(),
          apmaterno_titular: esTitular ? getInfractorApmaterno() : apmaterno.trim(),
          curp_titular: esTitular ? getInfractorCurp() : curp.trim().toUpperCase(),
          correo_titular: esTitular ? getInfractorCorreo() : correo.trim(),
          nombre_infractor: infrNombre.trim().toUpperCase() || null,
          appaterno_infractor: infrAppaterno.trim().toUpperCase() || null,
          apmaterno_infractor: infrApmaterno.trim().toUpperCase() || null,
          curp_infractor: infrCurp.trim().toUpperCase() || null,
          correo_infractor: infrCorreo.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      addToast('Datos guardados correctamente', 'success')
      setSubmitted(true)
      onSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar los datos'
      setSubmitError(msg)
      addToast(msg, 'error')
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
      <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden" role="status" aria-live="polite">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-green-200/40 bg-green-50">
          <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded-lg bg-green-500">
            <CheckCircle2 size={14} strokeWidth={2.5} className="text-white" />
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-green-600">Titular registrado</h3>
            <p className="text-[11px] text-green-500 mt-0.5">El caso ha sido iniciado correctamente</p>
          </div>
        </div>
        <div className="px-5 py-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
            <CheckCircle2 size={24} strokeWidth={2} className="text-green-500" />
          </div>
          <p className="text-sm font-medium text-green-700">Datos del titular guardados</p>
          <p className="mt-1 text-xs text-green-600">El proceso ha sido iniciado exitosamente.</p>
        </div>
      </div>
    )
  }

  const infrNombreDisplay = d?.nombre_infractor ?? ''
  const infrAppaternoDisplay = d?.appaterno_infractor ?? ''
  const infrApmaternoDisplay = d?.apmaterno_infractor ?? ''
  const infrCurpDisplay = d?.curp_infractor ?? ''
  const infrCorreoDisplay = d?.correo_infractor ?? ''

  const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition-all duration-150 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"

  function avanzarPaso() {
    if (paso === 1 && infractorNoData) {
      const errors: Partial<Record<FieldName, string>> = {}
      for (const name of ['infrNombre', 'infrAppaterno', 'infrCurp'] as FieldName[]) {
        const val = name === 'infrNombre' ? infrNombre : name === 'infrAppaterno' ? infrAppaterno : infrCurp
        const err = validateField(name, val)
        if (err) errors[name] = err
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        const allNames = new Set<FieldName>(touched)
        Object.keys(errors).forEach(k => allNames.add(k as FieldName))
        setTouched(allNames)
        return
      }
    }
    setPaso(p => p + 1)
  }

  async function handleSiSubmit() {
    setEsTitular(true)
    setSaving(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/infracciones/iniciarProceso', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: detalle.Header.id_infraccion,
          es_titular: true,
          nombre_titular: getInfractorNombre(),
          appaterno_titular: getInfractorAppaterno(),
          apmaterno_titular: getInfractorApmaterno(),
          curp_titular: getInfractorCurp(),
          correo_titular: getInfractorCorreo(),
          nombre_infractor: infrNombre.trim().toUpperCase() || null,
          appaterno_infractor: infrAppaterno.trim().toUpperCase() || null,
          apmaterno_infractor: infrApmaterno.trim().toUpperCase() || null,
          curp_infractor: infrCurp.trim().toUpperCase() || null,
          correo_infractor: infrCorreo.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      addToast('Datos guardados correctamente', 'success')
      setSubmitted(true)
      onSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar los datos'
      setSubmitError(msg)
      addToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div ref={formRef} className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded-lg bg-blue-700">
            <User size={14} strokeWidth={2.5} className="text-white" />
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-blue-700">Capturar datos del titular</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Registra los datos del titular de la infracción</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-500 transition-colors bg-white border border-slate-200"
            aria-label="Cerrar"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Stepper */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[11px] font-medium px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
            Paso {paso} de {esTitular && paso === 2 ? '2' : '3'}
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: esTitular && paso === 2 ? 2 : 3 }).map((_, i) => {
              const stepNum = i + 1
              return (
                <span
                  key={stepNum}
                  className={
                    stepNum === paso
                      ? 'h-[7px] w-5 rounded-full bg-blue-700'
                      : stepNum < paso
                        ? 'h-[7px] w-[7px] rounded-full bg-blue-700 opacity-35'
                        : 'h-[7px] w-[7px] rounded-full bg-slate-200'
                  }
                />
              )
            })}
          </div>
        </div>

        {/* ═══ Paso 1: Datos del infractor ═══ */}
        {paso === 1 && (
          <div role="group" aria-labelledby="step1-label">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-700 text-[10px] font-medium text-white" aria-hidden="true">1</span>
              <p id="step1-label" className="text-[11px] font-medium tracking-wider uppercase text-slate-500">Datos del infractor</p>
            </div>

            {infractorNoData ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                  <AlertCircle size={12} className="text-blue-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-800 leading-relaxed">
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
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <p className="text-[10px] font-medium tracking-wider uppercase text-slate-400 mb-0.5">Nombre completo</p>
                    <p className="text-xs font-medium text-slate-900 truncate">
                      {[infrNombreDisplay, infrAppaternoDisplay, infrApmaternoDisplay].filter(Boolean).join(' ') || '—'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <p className="text-[10px] font-medium tracking-wider uppercase text-slate-400 mb-0.5">CURP</p>
                    <p className="text-xs font-medium font-mono tracking-wider text-slate-900">{infrCurpDisplay || '—'}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <p className="text-[10px] font-medium tracking-wider uppercase text-slate-400 mb-0.5">Correo</p>
                    <p className="text-xs font-medium text-slate-900 truncate">{infrCorreoDisplay || '—'}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={avanzarPaso}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 active:scale-[0.99] shadow-sm transition-all duration-150"
            >
              <span>Continuar</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* ═══ Paso 2: Relación titular ═══ */}
        {paso === 2 && (
          <div role="group" aria-labelledby="step2-label">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-medium text-white bg-blue-700" aria-hidden="true">2</span>
              <p id="step2-label" className="text-[11px] font-medium tracking-wider uppercase text-slate-500">El infractor es el titular</p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50">
                <p className="text-[11px] font-medium text-slate-500">¿El infractor es el propietario?</p>
                <div className="inline-flex items-center rounded-md p-0.5 bg-white border border-slate-200">
                  <button
                    type="button"
                    onClick={handleSiSubmit}
                    disabled={saving}
                    className="px-3.5 py-1.5 rounded text-[11px] font-medium transition-all duration-150 bg-blue-700 text-white shadow-sm"
                  >
                    {saving ? 'Guardando…' : 'Sí'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaso(3)}
                    className="px-3.5 py-1.5 rounded text-[11px] font-medium transition-all duration-150 text-slate-500 hover:text-slate-900"
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="p-4">
                {esTitular ? (
                  <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <Loader2 size={24} className="animate-spin text-blue-700" />
                    <p className="text-sm font-medium text-slate-500">Iniciando proceso…</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <AlertCircle size={14} className="text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-medium text-amber-800">El infractor y el titular son personas distintas</p>
                        <p className="text-[10px] text-amber-700 mt-0.5">Capture los datos del propietario del vehículo para continuar el proceso.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPaso(1)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-[13px] font-medium text-slate-600 bg-transparent border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 transition-colors duration-150"
                      >
                        <ArrowRight size={14} strokeWidth={2.5} className="rotate-180" />
                        <span>Regresar</span>
                      </button>
                      <button
                        onClick={() => setPaso(3)}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 active:scale-[0.99] shadow-sm transition-all duration-150"
                      >
                        <span>Continuar</span>
                        <ArrowRight size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ Paso 3: Datos del titular ═══ */}
        {paso === 3 && (
          <div role="group" aria-labelledby="step3-label">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-700 text-[10px] font-medium text-white" aria-hidden="true">3</span>
              <p id="step3-label" className="text-[11px] font-medium tracking-wider uppercase text-slate-500">Datos del titular</p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
                <p className="text-[11px] font-medium text-slate-500">Complete los datos del propietario</p>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <AlertCircle size={14} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-medium text-amber-800">El infractor y el titular son personas distintas</p>
                    <p className="text-[10px] text-amber-700 mt-0.5">Capture los datos del propietario del vehículo para continuar el proceso.</p>
                  </div>
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
                <div className="flex items-start gap-1.5 px-0.5">
                  <Info size={12} className="text-blue-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    Estos datos deben coincidir con los del propietario registrados en la tarjeta de circulación.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setPaso(2)}
                className="inline-flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-[13px] font-medium text-slate-600 bg-transparent border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 transition-colors duration-150"
              >
                <ArrowRight size={14} strokeWidth={2.5} className="rotate-180" />
                <span>Regresar</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                aria-busy={saving}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium text-white transition-all duration-150 ${
                  saving
                    ? 'bg-blue-200 text-blue-300 cursor-not-allowed'
                    : 'bg-blue-700 hover:bg-blue-800 active:bg-blue-900 active:scale-[0.99] shadow-sm'
                }`}
              >
                {saving ? (
                  <><Loader2 size={14} className="animate-spin" /><span>Guardando…</span></>
                ) : (
                  <><span>Iniciar proceso</span><ArrowRight size={14} strokeWidth={2.5} /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {submitError && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200" role="alert" aria-live="assertive">
            <AlertCircle size={12} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium text-red-600">{submitError}</p>
          </div>
        )}

        <div ref={firstErrorRef} />
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
      <label htmlFor={fieldId} className="text-[10px] font-medium tracking-wider uppercase text-slate-500">
        {label}
        {required && <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>}
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
            ? 'border-red-300 focus:border-red-300 focus:ring-2 focus:ring-red-200/50'
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
          <p id={errorId} role="alert" className="text-[10px] font-medium text-red-600">{error}</p>
        ) : (
          <span />
        )}
        {maxLength && (
          <p className={`text-[10px] ml-auto ${value.length >= maxLength ? 'text-red-600' : 'text-slate-400'}`} aria-live="polite">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}
