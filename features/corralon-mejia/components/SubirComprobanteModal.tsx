'use client'

import { useRef, useState } from "react"
import { CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react"

interface Props {
    idInfraccion: string
    onClose: () => void
    onSuccess?: () => void
}

export default function SubirComprobanteModal({ idInfraccion, onClose, onSuccess }: Props) {
    const [archivo, setArchivo] = useState<File | null>(null)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleSubmit = async () => {
        if (!archivo) return
        setSaving(true)
        try {
            const fd = new FormData()
            fd.append('infraccionId', idInfraccion)
            fd.append('archivo', archivo)

            const res = await fetch('/api/corralon-mejia/subirComprobante', {
                method: 'POST',
                body: fd,
            })
            if (!res.ok) throw new Error('Error al subir comprobante')

            setSuccess(true)
            onSuccess?.()
        } catch (error) {
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-[#E2E8F0] rounded-t-2xl">
                    <h2 className="text-[15px] font-semibold text-[#0F172A]">Subir comprobante de pago</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors"
                    >
                        <X size={16} className="text-[#64748B]" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {success ? (
                        <div className="rounded-xl border p-4 text-center" style={{ borderColor: '#BBF7D0', background: '#F0FDF4' }}>
                            <CheckCircle2 size={24} strokeWidth={2} className="mx-auto text-[#22C55E]" />
                            <p className="text-[14px] font-semibold text-[#166534] mt-2">Comprobante registrado</p>
                            <p className="text-[12px] text-[#16A34A] mt-0.5">El archivo se subió correctamente al expediente digital.</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#64748B]">
                                    Comprobante de pago <span className="text-[#94A3B8] font-normal normal-case">(PDF o imagen)</span>
                                </label>
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    className="w-full rounded-lg border-2 border-dashed p-6 flex flex-col items-center gap-2 transition-colors cursor-pointer"
                                    style={{ borderColor: archivo ? '#22C55E' : '#E2E8F0', background: archivo ? '#F0FDF4' : '#FAFAFA' }}
                                >
                                    {archivo ? (
                                        <>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#DCFCE7' }}>
                                                <FileText size={20} strokeWidth={2} className="text-[#22C55E]" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[14px] font-medium text-[#0F172A] truncate max-w-[220px]">{archivo.name}</p>
                                                <p className="text-[12px] text-[#64748B]">{(archivo.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <button
                                                onClick={e => { e.stopPropagation(); setArchivo(null); if (fileRef.current) fileRef.current.value = '' }}
                                                className="text-[12px] text-[#EF4444] font-medium hover:underline"
                                            >
                                                Quitar archivo
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={24} strokeWidth={1.5} className="text-[#94A3B8]" />
                                            <p className="text-[14px] font-medium text-[#64748B]">Seleccionar archivo</p>
                                            <p className="text-[12px] text-[#94A3B8]">PDF o imagen &middot; Máx 10 MB</p>
                                        </>
                                    )}
                                </button>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*,.pdf"
                                    className="hidden"
                                    onChange={e => setArchivo(e.target.files?.[0] ?? null)}
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={saving || !archivo}
                                className="w-full rounded-lg py-2.5 text-[13px] font-semibold text-white transition-colors disabled:opacity-50"
                                style={{ background: saving ? '#94A3B8' : '#22C55E' }}
                            >
                                {saving ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Loader2 size={14} className="animate-spin" />
                                        Subiendo…
                                    </span>
                                ) : (
                                    'Subir comprobante'
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
