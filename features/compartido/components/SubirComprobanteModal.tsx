'use client'

import { useRef, useState } from "react"
import { FileText, Loader2, Upload, X, AlertCircle } from "lucide-react"
import { useToastStore } from "@/stores/useToastStore"

interface Props {
  idInfraccion: string
  endpoint: string
  onClose: () => void
  onSuccess?: () => void
}

export default function SubirComprobanteModal({ idInfraccion, endpoint, onClose, onSuccess }: Props) {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const addToast = useToastStore((s) => s.addToast)

  const handleSubmit = async () => {
    if (!archivo) { setError('Debe seleccionar un archivo'); return }
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('infraccionId', idInfraccion)
      fd.append('archivo', archivo)

      const res = await fetch(endpoint, {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) throw new Error('Error al subir comprobante')

      addToast('Comprobante subido correctamente', 'success')
      onSuccess?.()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al subir comprobante'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-modal overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200">
          <h2 className="text-sm font-medium text-slate-900">Subir comprobante de pago</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-500 transition-colors bg-slate-100">
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200" role="alert">
              <AlertCircle size={12} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium tracking-wider uppercase text-slate-500">
              Comprobante de pago <span className="text-red-600" aria-hidden="true">*</span>
              <span className="text-slate-400 font-normal normal-case"> (PDF o imagen)</span>
            </label>
            <button
              onClick={() => fileRef.current?.click()}
              className={`w-full rounded-lg border-2 border-dashed p-6 flex flex-col items-center gap-2 transition-colors cursor-pointer ${archivo ? 'bg-green-50 border-green-300' : error ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
            >
              {archivo ? (
                <>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-100">
                    <FileText size={20} strokeWidth={2} className="text-green-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-900 truncate max-w-[220px]">{archivo.name}</p>
                    <p className="text-xs text-slate-500">{(archivo.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setArchivo(null); if (fileRef.current) fileRef.current.value = ''; setError('') }} className="text-xs text-red-600 font-medium hover:underline">Quitar archivo</button>
                </>
              ) : (
                <>
                  <Upload size={24} strokeWidth={1.5} className="text-slate-400" />
                  <p className="text-sm font-medium text-slate-500">Seleccionar archivo</p>
                  <p className="text-xs text-slate-400">PDF o imagen &middot; Máx 10 MB</p>
                  {error && <p className="text-xs font-medium text-red-600">{error}</p>}
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => { setArchivo(e.target.files?.[0] ?? null); setError('') }} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 active:scale-[0.99] shadow-sm transition-all duration-150 disabled:bg-blue-200 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 size={14} className="animate-spin" /><span>Subiendo…</span></>
            ) : (
              'Subir comprobante'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
