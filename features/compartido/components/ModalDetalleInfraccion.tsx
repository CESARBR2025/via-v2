'use client'

import React, { useEffect, useRef } from 'react'
import {
  X, FileText, Clock, AlertCircle, User, Shield, MapPin,
  CheckCircle2, ExternalLink, DollarSign, Car,
  Scale, Hash, FileSpreadsheet, CalendarDays, Image, Eye,
  CreditCard,
} from 'lucide-react'
import type { DetalleCompleto } from '@/features/compartido/types/detalleInfraccion'

// ─── Design tokens ───
const T = {
  primary: '#2563EB',
  primaryDark: '#1E3A8A',
  success: '#22C55E',
  successBg: '#DCFCE7',
  successText: '#166534',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  warningText: '#78350F',
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  dangerText: '#991B1B',
  info: '#3B82F6',
  infoBg: '#DBEAFE',
  infoText: '#1E40AF',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  background: '#F8FAFC',
}

// ─── Props ───
interface Props {
  isOpen: boolean
  onClose: () => void
  loading?: boolean
  detalle: DetalleCompleto | null
}

// ─── Status helpers ───
const STATUS_MAP: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  PAGADA: { dot: T.success, bg: T.successBg, text: T.successText, label: 'Pagada' },
  PENDIENTE: { dot: T.warning, bg: T.warningBg, text: T.warningText, label: 'Pendiente de Pago' },
  REGISTRADA: { dot: T.info, bg: T.infoBg, text: T.infoText, label: 'Registrada' },
  CANCELADA: { dot: T.danger, bg: T.dangerBg, text: T.dangerText, label: 'Cancelada' },
}

function getStatus(status?: string) {
  return STATUS_MAP[status ?? ''] ?? { dot: T.textMuted, bg: '#F1F5F9', text: '#475569', label: status ?? 'Desconocido' }
}

function fmtDate(d: string): string {
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function sani(value: string | null | undefined, fallback = '—'): string {
  if (!value || value === 'NO_DATA') return fallback
  return value
}

// ─── Component ───
export default function ModalDetalleInfraccion({
  isOpen, onClose, loading = false, detalle,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const cb = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', cb)
    return () => document.removeEventListener('keydown', cb)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const h = detalle?.Header
  const status = getStatus(h?.estatus_de_infraccion)

  const docs: { name: string; path: string; isEvidence?: boolean }[] = [
    h?.url_ine && h.url_ine !== 'NO_DATA' ? { name: 'INE', path: h.url_ine } : null,
    h?.url_inapam && h.url_inapam !== 'NO_DATA' ? { name: 'INAPAM', path: h.url_inapam } : null,
    h?.url_tarjeta_circulacion && h.url_tarjeta_circulacion !== 'NO_DATA' ? { name: 'Tarjeta de Circulación', path: h.url_tarjeta_circulacion } : null,
    h?.url_oficio_pago_corralon ? { name: 'Comprobante de Pago (Corralón)', path: h.url_oficio_pago_corralon } : null,
    h?.url_orden_salida_liberaciones && h.url_orden_salida_liberaciones !== 'NO_DATA'
      ? { name: 'Orden de Salida (Liberación)', path: h.url_orden_salida_liberaciones }
      : null,
  ].filter(Boolean) as { name: string; path: string }[]

  const evidence = (h?.url_evidencias ?? []).map((p, i) => ({ name: `Evidencia ${i + 1}`, path: p, isEvidence: true }))
  const allFiles = [...docs, ...evidence]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog" aria-modal="true"
    >
      <div
        ref={ref}
        className="w-full max-w-4xl flex flex-col rounded-2xl overflow-hidden"
        style={{
          maxHeight: 'calc(100vh - 48px)',
          background: T.surface,
          boxShadow: '0 25px 60px rgba(15,23,42,0.25), 0 0 0 1px rgba(226,232,240,0.5)',
        }}
      >
        {/* ═══ Header ═══ */}
        <div className="relative shrink-0" style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #1D4ED8 100%)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.08]" style={{ background: '#FFFFFF', transform: 'translate(30%, -30%)' }} />
          <div className="absolute -bottom-6 left-1/4 w-24 h-24 rounded-full opacity-[0.06]" style={{ background: '#FFFFFF' }} />

          <div className="relative px-6 sm:px-8 pt-5 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
                  <FileText size={20} strokeWidth={1.8} className="text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-0.5">
                    {loading ? (
                      <span className="text-[11px] font-semibold tracking-widest uppercase text-white/50">Consultando…</span>
                    ) : (
                      <>
                        <span className="text-[11px] font-semibold tracking-widest uppercase text-white/60">Boleta de Infracción</span>
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{ background: status.bg, color: status.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
                          {status.label}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {loading ? 'Consultando infracción…' : `Folio #${h?.folio_de_infraccion ?? '—'}`}
                  </h2>
                  {!loading && h && (
                    <p className="text-[12px] text-white/50 mt-1 flex items-center gap-1.5">
                      <Clock size={11} strokeWidth={2.5} />
                      {fmtDate(h.fecha_de_registro_de_infraccion)}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={onClose} aria-label="Cerrar"
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.15)' }}>
                <X size={15} strokeWidth={2.5} className="text-white/80" />
              </button>
            </div>
          </div>
        </div>

        {/* ═══ Body ═══ */}
        <div className="flex-1 overflow-y-auto" style={{ background: T.background }}>
          {loading ? <LoadingState /> : !detalle ? <EmptyState /> : (
            <div className="p-5 sm:p-7 space-y-5">

              {/* ─── 1. Estatus & Folio ─── */}
              <Section icon={<CalendarDays size={16} />} accent={T.primary} label="Identificación" variant="simple">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px]" style={{ color: T.textSecondary }}>Folio</p>
                    <p className="text-[18px] font-bold" style={{ color: T.textPrimary, fontFamily: "'DM Mono', 'Fira Code', monospace" }}>
                      {h?.folio_de_infraccion ?? '—'}
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                    style={{ background: status.bg, color: status.text }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: status.dot }} />
                    {status.label}
                  </span>
                </div>
              </Section>

              {/* ─── 2. Ubicación ─── */}
              <Section icon={<MapPin size={16} />} accent="#0F766E" label="Ubicación">
                <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: '#F0FDFA', border: '1px solid #CCFBF1' }}>
                  <MapPin size={16} className="text-[#0F766E] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[15px] font-bold text-[#134E4A]">
                      {detalle.ubicacion.calle} #{detalle.ubicacion.numero}
                    </p>
                    <p className="text-[12px] text-[#0F766E] mt-0.5">
                      CP {detalle.ubicacion.cod_postal} &middot; {detalle.ubicacion.municipio}, {detalle.ubicacion.estado}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${detalle.ubicacion.latitud},${detalle.ubicacion.longitud}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-xl group transition-all mt-3"
                  style={{ background: '#F0FDFA', border: '1px solid #CCFBF1' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#0F766E' }}>
                    <MapPin size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold tracking-widest text-[#0F766E] uppercase">Ver en Google Maps</p>
                    <p className="text-[11px] font-mono font-semibold text-[#134E4A] truncate">
                      {detalle.ubicacion.latitud}, {detalle.ubicacion.longitud}
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-[#0F766E]/50 group-hover:text-[#0F766E] transition-colors shrink-0" />
                </a>
              </Section>

              {/* ─── 3. Datos del Infractor ─── */}
              <Section icon={<User size={16} />} accent="#475569" label="Datos del Infractor">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Nombre completo" value={`${sani(detalle.datos_infractor.nombre_infractor)} ${sani(detalle.datos_infractor.appaterno_infractor)} ${sani(detalle.datos_infractor.apmaterno_infractor)}`.trim() || '—'} />
                  <Field label="Correo" value={sani(detalle.datos_infractor.correo_infractor, 'No registrado')} />
                  <Field label="CURP" value={sani(detalle.datos_infractor.curp_infractor, 'No registrado')} mono />
                </div>
                {!!detalle.datos_infractor.nombre_titular_liberacion && detalle.datos_infractor.nombre_titular_liberacion !== 'NO_DATA' && (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl mt-3" style={{ background: T.successBg, border: '1px solid #BBF7D0' }}>
                    <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: T.success }}>
                      <CheckCircle2 size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: T.successText }}>Titular verificado</p>
                      <p className="text-[11px]" style={{ color: T.successText }}>
                        {sani(detalle.datos_infractor.nombre_titular_liberacion)} se identificó como titular del vehículo
                      </p>
                    </div>
                  </div>
                )}
              </Section>

              {/* ─── 4. Vehículo ─── */}
              <Section icon={<Car size={16} />} accent="#0891B2" label="Vehículo">
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 mb-4" style={{ borderColor: '#0891B2', background: '#F0F9FF' }}>
                  <Car size={16} className="text-[#0891B2]" />
                  <div>
                    <p className="text-[9px] font-semibold tracking-widest text-[#0891B2] uppercase">Placa</p>
                    <p className="text-lg font-bold tracking-[0.2em] text-[#0C4A6E]" style={{ fontFamily: "'DM Mono', 'Fira Code', monospace" }}>
                      {sani(detalle.vehiculo.placa)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Field label="Marca" value={sani(detalle.vehiculo.marca)} />
                  <Field label="Modelo" value={sani(detalle.vehiculo.modelo)} />
                  <Field label="Año" value={sani(detalle.vehiculo.anio, 'N/E')} />
                  <Field label="Color" value={sani(detalle.vehiculo.color)} />
                </div>
              </Section>

              {/* ─── 5. Fundamento Legal ─── */}
              <Section icon={<Scale size={16} />} accent="#7C3AED" label="Fundamento Legal">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: '#F5F3FF', border: '1px solid #EDE9FE' }}>
                    <Hash size={16} className="text-[#7C3AED] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold tracking-widest text-[#7C3AED] uppercase mb-0.5">Artículo</p>
                      <p className="text-[14px] font-medium" style={{ color: T.textPrimary }}>{detalle.Infraccion.articulo_descripcion}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: '#F5F3FF', border: '1px solid #EDE9FE' }}>
                    <FileSpreadsheet size={16} className="text-[#7C3AED] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold tracking-widest text-[#7C3AED] uppercase mb-0.5">Fracción</p>
                      <p className="text-[14px] font-medium" style={{ color: T.textPrimary }}>{detalle.Infraccion.fraccion_descripcion}</p>
                    </div>
                  </div>
                </div>
              </Section>

              {/* ─── 6. Garantía & Montos ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Section icon={<Shield size={16} />} accent="#D97706" label="Garantía Retenida" variant="simple">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: T.warning }}>
                      <Shield size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold tracking-widest text-[#92400E] uppercase">Tipo</p>
                      <p className="text-[15px] font-bold text-[#78350F]">
                        {detalle.garantia.garantia_retenida === 'TRJ_CIRCULACION' ? 'Tarjeta de Circulación'
                          : detalle.garantia.garantia_retenida === 'VEHICULO' ? 'Vehículo'
                            : detalle.garantia.garantia_retenida === 'PLACA' ? 'Placa'
                              : sani(detalle.garantia.garantia_retenida, 'Ninguna')}
                      </p>
                    </div>
                  </div>
                </Section>

                <Section icon={<DollarSign size={16} />} accent={T.primary} label="Montos" variant="simple">
                  <div className="p-3.5 rounded-xl" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                    <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: T.textSecondary }}>Total</p>
                    <p className="text-[18px] font-bold" style={{ color: T.textPrimary }}>
                      {detalle.Infraccion.total_umas === 'NO_DATA' ? '—' : `${detalle.Infraccion.total_umas} UMAs`}
                    </p>
                    <p className="text-[13px] font-medium mt-0.5" style={{ color: T.textSecondary }}>
                      {detalle.Infraccion.total_pesos === 'NO_DATA' ? 'Sin monto registrado' : (
                        <>Equivalente a <span className="font-bold" style={{ color: T.primary }}>
                          {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(detalle.Infraccion.total_pesos))}
                        </span></>
                      )}
                    </p>
                  </div>
                </Section>
              </div>

              {/* ─── 7. Documentos ─── */}
              <Section icon={<FileText size={16} />} accent={T.primary} label="Documentos">
                {allFiles.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-6 text-center" style={{ borderColor: T.border }}>
                    <FileText size={24} className="mx-auto mb-2" style={{ color: T.textMuted }} />
                    <p className="text-[13px]" style={{ color: T.textMuted }}>Sin documentos adjuntos</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {allFiles.map((f) => (
                      <div
                        key={`${f.name}-${f.path}`}
                        className="flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer"
                        style={{
                          background: f.isEvidence ? '#FFFBEB' : T.background,
                          border: f.isEvidence ? '1px solid #FDE68A' : `1px solid ${T.border}`,
                        }}
                        onClick={() => window.open(f.path, '_blank')}
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: f.isEvidence ? '#FEF3C7' : '#EFF6FF' }}>
                          {f.isEvidence
                            ? <Image size={15} className="text-[#D97706]" />
                            : <FileText size={15} className="text-[#2563EB]" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium truncate" style={{ color: T.textPrimary }}>{f.name}</p>
                          <p className="text-[10px]" style={{ color: T.textMuted }}>{f.isEvidence ? 'Evidencia' : 'Documento'}</p>
                        </div>
                        <Eye size={12} className="shrink-0" style={{ color: T.textMuted }} />
                      </div>
                    ))}
                  </div>
                )}
              </Section>

            </div>
          )}
        </div>

        {/* ═══ Footer ═══ */}
        <div className="shrink-0 px-6 sm:px-8 py-3.5 flex items-center justify-between gap-4 border-t" style={{ borderColor: T.border, background: T.surface }}>
          <span className="text-[11px]" style={{ color: T.textMuted }}>Sistema de Gestión de Infracciones &middot; Municipio de Querétaro</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors"
            style={{ background: T.primary }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Subcomponents ───

function Section({
  icon, accent, label, children, variant = 'normal',
}: {
  icon: React.ReactNode
  accent: string
  label: string
  children: React.ReactNode
  variant?: 'normal' | 'simple'
}) {
  if (variant === 'simple') {
    return (
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: T.surface, borderColor: T.border, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
      >
        <div className="px-5 py-3.5 border-b flex items-center gap-2.5" style={{ borderColor: T.borderLight, background: T.background }}>
          <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: accent }}>
            {icon}
          </div>
          <h3 className="text-[12px] font-semibold tracking-wider uppercase" style={{ color: accent }}>{label}</h3>
        </div>
        <div className="p-5">{children}</div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: T.surface, borderColor: T.border, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
    >
      <div className="px-5 py-3.5 border-b flex items-center gap-2.5" style={{ borderColor: T.borderLight }}>
        <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: accent }}>
          {icon}
        </div>
        <h3 className="text-[13px] font-semibold tracking-wider" style={{ color: accent }}>{label}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg p-3.5" style={{ background: T.background, border: `1px solid ${T.border}` }}>
      <p className="text-[10px] font-semibold tracking-widest uppercase mb-0.5" style={{ color: T.textMuted }}>{label}</p>
      <p
        className="text-[14px] font-semibold truncate"
        style={{ color: T.textPrimary, fontFamily: mono ? "'DM Mono', 'Fira Code', monospace" : undefined, letterSpacing: mono ? '0.05em' : undefined }}
      >
        {value}
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: '#DBEAFE' }} />
        <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: T.primary }} />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-bold" style={{ color: T.textPrimary }}>Consultando base de datos</p>
        <p className="text-[13px] mt-1" style={{ color: T.textMuted }}>Obteniendo información de la infracción…</p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: T.background }}>
        <AlertCircle size={26} strokeWidth={1.5} style={{ color: T.textMuted }} />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-bold" style={{ color: '#475569' }}>No se encontró información</p>
        <p className="text-[13px] mt-1" style={{ color: T.textMuted }}>No se pudo obtener el detalle de esta infracción.</p>
      </div>
    </div>
  )
}
