'use client'

import { AlertTriangle, X } from 'lucide-react'

interface ConfirmacionModalProps {
    isOpen: boolean
    titulo: string
    mensaje: string
    labelConfirmar: string
    labelCancelar: string
    onConfirmar: () => void
    onCancelar: () => void
    loading?: boolean
    variant?: 'danger' | 'warning' | 'success'
}

const VARIANTES = {
    danger: {
        iconBg: '#FEE2E2',
        iconColor: '#EF4444',
        btnBg: '#EF4444',
        btnHover: '#DC2626',
    },
    warning: {
        iconBg: '#FEF3C7',
        iconColor: '#F59E0B',
        btnBg: '#F59E0B',
        btnHover: '#D97706',
    },
    success: {
        iconBg: '#DCFCE7',
        iconColor: '#22C55E',
        btnBg: '#22C55E',
        btnHover: '#16A34A',
    },
}

export default function ConfirmacionModal({
    isOpen,
    titulo,
    mensaje,
    labelConfirmar,
    labelCancelar,
    onConfirmar,
    onCancelar,
    loading = false,
    variant = 'warning',
}: ConfirmacionModalProps) {
    if (!isOpen) return null

    const v = VARIANTES[variant]

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget && !loading) onCancelar() }}
        >
            <div
                className="w-full max-w-sm rounded-2xl overflow-hidden"
                style={{
                    background: '#FFFFFF',
                    boxShadow: '0 20px 60px rgba(15,23,42,0.18), 0 0 0 1px rgba(226,232,240,0.6)',
                }}
            >
                <div className="relative p-6 pb-5">
                    <button
                        onClick={onCancelar}
                        disabled={loading}
                        className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: '#F1F5F9' }}
                    >
                        <X size={14} strokeWidth={2.5} className="text-[#64748B]" />
                    </button>

                    <div className="flex flex-col items-center text-center gap-4">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ background: v.iconBg }}
                        >
                            <AlertTriangle size={26} strokeWidth={1.8} style={{ color: v.iconColor }} />
                        </div>

                        <div>
                            <h3 className="text-[17px] font-bold text-[#0F172A]">{titulo}</h3>
                            <p className="text-[14px] text-[#64748B] mt-1.5 leading-relaxed">{mensaje}</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6 flex flex-col gap-2.5">
                    <button
                        onClick={onConfirmar}
                        disabled={loading}
                        className="w-full rounded-xl py-2.5 text-[14px] font-semibold text-white transition-all"
                        style={{
                            background: loading ? '#94A3B8' : v.btnBg,
                        }}
                    >
                        {loading ? 'Procesando…' : labelConfirmar}
                    </button>
                    <button
                        onClick={onCancelar}
                        disabled={loading}
                        className="w-full rounded-xl py-2.5 text-[14px] font-semibold transition-colors"
                        style={{
                            color: '#64748B',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                        }}
                    >
                        {labelCancelar}
                    </button>
                </div>
            </div>
        </div>
    )
}
