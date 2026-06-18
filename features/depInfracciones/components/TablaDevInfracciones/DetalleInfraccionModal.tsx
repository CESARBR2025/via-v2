'use client'

import { useEffect, useRef, useState } from 'react'
import {
  X, FileText, MapPin, Car, User, Gavel, ShieldCheck,
  Loader, FileSearch, Mail, Tag, Layers, Calendar, Palette, Map, Crosshair,
  IdCard, BadgeCheck,
} from 'lucide-react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { abrirDocumento } from '@/features/expediente/helpers/abrirDocumento'

/* ─── INTERFACES ─── */

export interface InfraccionHeader {
  id_infraccion: string
  folio_de_infraccion: string
  fecha_de_registro_de_infraccion: string
  estatus_de_infraccion: string
  url_ine: string
  url_tarjeta_circulacion: string
  url_inapam: string
  url_evidencias: string[]
}

export interface InfraccionLegal {
  articulo_numero: string
  articulo_descripcion: string
  fraccion_numero: string
  fraccion_descripcion: string
  total_umas: string
  total_pesos: string
}

export interface InfraccionInfractor {
  nombre_infractor: string
  correo_infractor: string
  curp_infractor: string
}

export interface InfraccionOficial {
  numero_empleado: string
  nombre_completo: string
  patrulla_nombre: string
  activo: string | boolean
}

export interface InfraccionVehiculo {
  placa: string
  tipo: string
  marca: string
  modelo: string
  anio: string
  color: string
}

export interface InfraccionGarantia {
  garantia_retenida: string
}

export interface InfraccionUbicacion {
  latitud: string
  longitud: string
  calle: string
  cod_postal: string
  numero: string
  municipio: string
  estado: string
}

export interface InfraccionDetalle {
  Header: InfraccionHeader
  Infraccion: InfraccionLegal
  datos_infractor: InfraccionInfractor
  vehiculo: InfraccionVehiculo
  garantia: InfraccionGarantia
  ubicacion: InfraccionUbicacion
  oficial: InfraccionOficial
}

interface Props {
  isOpen: boolean
  onClose: () => void
  loading: boolean
  detalle: InfraccionDetalle | null
}

/* ─── STATUS CONFIG ─── */

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  PAGADA: { bg: 'bg-green-50', text: 'text-green-800', dot: 'bg-green-500', label: 'Pagada' },
  PENDIENTE: { bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-500', label: 'Pendiente' },
  REGISTRADA: { bg: 'bg-blue-50', text: 'text-blue-800', dot: 'bg-blue-500', label: 'Registrada' },
  CANCELADA: { bg: 'bg-red-50', text: 'text-red-800', dot: 'bg-red-500', label: 'Cancelada' },
}

function getStatusStyle(status?: string) {
  return STATUS_STYLES[status ?? ''] ?? { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400', label: status ?? 'Desconocido' }
}

/* ─── UTILS ─── */

function formatDate(d: string): string {
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(v: string): string {
  const num = parseFloat(v || '0')
  if (isNaN(num)) return v
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num)
}

function sanitize(value: string | null | undefined, fallback = '—'): string {
  if (!value || value === 'NO_DATA') return fallback
  return value
}

function mapGarantia(value: string): string {
  if (value === 'TRJ_CIRCULACION') return 'Tarjeta de Circulación'
  return sanitize(value, 'Ninguna')
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.round(diffMs / 60000)
  const diffHours = Math.round(diffMs / 3600000)
  const diffDays = Math.round(diffMs / 86400000)

  if (diffMins < 1) return 'recién'
  if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`
  if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  if (diffDays < 30) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
  return formatDate(dateStr)
}

/* ─── MAIN COMPONENT ─── */

export function DetalleInfraccionModal({ isOpen, onClose, loading, detalle }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const h = detalle?.Header
  const status = getStatusStyle(h?.estatus_de_infraccion)

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Detalle de infracción"
    >
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in { animation: modal-in 0.2s ease-out; }
      `}</style>

      <div className="w-full max-w-4xl flex flex-col bg-white rounded-xl shadow-modal max-h-[90vh] animate-modal-in">
        {/* ══ HEADER ══ */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="min-w-0 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <FileSearch size={18} className="text-blue-700" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${status.bg} ${status.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {loading ? 'Consultando…' : status.label}
                </span>
              </div>
              <h2 className="text-[17px] font-medium leading-snug text-slate-900">
                {loading ? 'Cargando…' : `Folio #${h?.folio_de_infraccion ?? '—'}`}
              </h2>
              {!loading && h && (
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <span>{formatDate(h.fecha_de_registro_de_infraccion)}</span>
                  <span className="text-slate-300">&middot;</span>
                  <span className="text-slate-400">{timeAgo(h.fecha_de_registro_de_infraccion)}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* ══ BODY ══ */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <LoadingState />
          ) : detalle ? (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* ─── LEFT COLUMN (3/5) ─── */}
                <div className="lg:col-span-3 space-y-0">

                  {/* MONTO */}
                  <div className="rounded-xl p-5 bg-gradient-to-br from-blue-700 to-blue-900 shadow-[0_4px_12px_rgba(29,78,216,0.3)] relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
                    <div className="absolute top-12 -right-3 w-16 h-16 rounded-full bg-white/5" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/15 text-white text-[10px] font-medium tracking-wider uppercase">
                          Total
                        </span>
                      </div>
                      <p className="text-2xl font-medium text-white">
                        {formatCurrency(detalle.Infraccion.total_pesos)}
                      </p>
                      <p className="text-xs text-white/60 mt-1">
                        {detalle.Infraccion.total_umas} UMAs equivalentes
                      </p>
                    </div>
                  </div>

                  {/* FUNDAMENTO LEGAL */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <Section icon={Gavel} title="Fundamento Legal" iconBg="bg-slate-50" iconColor="text-slate-700">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="shrink-0 px-2 py-1 rounded-md bg-blue-700 text-white text-[11px] font-medium font-mono leading-none">
                            Art. {sanitize(detalle.Infraccion.articulo_numero)}
                          </span>
                          <p className="text-sm text-slate-700 leading-snug">
                            {detalle.Infraccion.articulo_descripcion}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="shrink-0 px-2 py-1 rounded-md bg-slate-600 text-white text-[11px] font-medium font-mono leading-none">
                            Frac. {sanitize(detalle.Infraccion.fraccion_numero)}
                          </span>
                          <p className="text-sm text-slate-700 leading-snug">
                            {detalle.Infraccion.fraccion_descripcion}
                          </p>
                        </div>
                      </div>
                    </Section>
                  </div>

                  {/* INFRACTOR */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <Section icon={User} title="Datos del Infractor" iconBg="bg-blue-50" iconColor="text-blue-700">
                      <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-slate-500">Nombre completo</p>
                            <p className="text-sm text-slate-900 mt-0.5 leading-snug flex items-center gap-1.5">
                              <User size={13} className="text-slate-400 shrink-0" strokeWidth={1.5} />
                              {sanitize(detalle.datos_infractor.nombre_infractor)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500">Correo electrónico</p>
                            <p className="text-sm text-slate-900 mt-0.5 leading-snug flex items-center gap-1.5">
                              <Mail size={13} className="text-slate-400 shrink-0" strokeWidth={1.5} />
                              {sanitize(detalle.datos_infractor.correo_infractor, 'No registrado')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500">CURP</p>
                            <p className="text-sm text-slate-900 mt-0.5 leading-snug flex items-center gap-1.5 font-mono tracking-wide">
                              <IdCard size={13} className="text-slate-400 shrink-0" strokeWidth={1.5} />
                              {sanitize(detalle.datos_infractor.curp_infractor)}
                            </p>
                          </div>
                      </div>
                    </Section>
                  </div>

                  {/* VEHICULO */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <Section icon={Car} title="Datos del Vehículo" iconBg="bg-indigo-50" iconColor="text-indigo-700">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <div className="px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-200">
                          <p className="text-[10px] font-medium tracking-widest text-indigo-600 uppercase mb-0.5">Placa</p>
                          <p className="text-lg font-medium text-indigo-900 tracking-[0.2em] font-mono">
                            {sanitize(detalle.vehiculo.placa)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <FieldWithIcon icon={Tag} label="Marca" value={sanitize(detalle.vehiculo.marca)} />
                        <FieldWithIcon icon={Layers} label="Modelo" value={sanitize(detalle.vehiculo.modelo)} />
                        <FieldWithIcon icon={Calendar} label="Año" value={sanitize(detalle.vehiculo.anio, 'No especificado')} />
                        <FieldWithIcon icon={Palette} label="Color" value={sanitize(detalle.vehiculo.color)} />
                        <FieldWithIcon icon={Car} label="Tipo" value={sanitize(detalle.vehiculo.tipo, 'No especificado')} />
                      </div>
                    </Section>
                  </div>

                  {/* CAPTURA */}
                  {detalle.oficial?.numero_empleado !== 'NO_DATA' && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <Section icon={BadgeCheck} title="Oficial que registró" iconBg="bg-emerald-50" iconColor="text-emerald-700">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-sm font-medium text-slate-900 leading-snug flex items-center gap-1.5">
                              <User size={13} className="text-slate-400 shrink-0" strokeWidth={1.5} />
                              {detalle.oficial.nombre_completo}
                            </p>
                            <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                              <BadgeCheck size={11} className="text-slate-400 shrink-0" strokeWidth={1.5} />
                              {detalle.oficial.numero_empleado}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Car size={11} className="text-slate-400 shrink-0" strokeWidth={1.5} />
                              Patrulla: {sanitize(detalle.oficial.patrulla_nombre, 'No asignada')}
                            </p>
                          </div>
                          {detalle.oficial.activo !== 'NO_DATA' && (
                            <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full leading-none ${
                              String(detalle.oficial.activo) === 'true'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {String(detalle.oficial.activo) === 'true' ? 'Oficial en servicio' : 'Oficial con baja'}
                            </span>
                          )}
                        </div>
                      </Section>
                    </div>
                  )}
                </div>

                {/* ─── RIGHT COLUMN (2/5) ─── */}
                <div className="lg:col-span-2 space-y-6">

                  {/* MAPA */}
                  <MapSection ubicacion={detalle.ubicacion} />

                  {/* GARANTIA */}
                  <Section icon={ShieldCheck} title="Garantía Retenida" iconBg="bg-amber-50" iconColor="text-amber-700">
                    <div className="flex items-center gap-3 p-3.5 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                        <ShieldCheck size={16} className="text-white" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-medium text-amber-900">
                        {mapGarantia(detalle.garantia.garantia_retenida)}
                      </p>
                    </div>
                  </Section>

                  {/* DOCUMENTOS */}
                  <DocumentosSection detalle={detalle} />

                </div>
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* ══ FOOTER ══ */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 shrink-0">
          {!loading && h && (
            <p className="text-xs text-slate-400 mr-auto hidden sm:block">
              ID interno: <span className="font-mono text-slate-500">{h.id_infraccion}</span>
            </p>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-transparent text-slate-600 text-[13px] font-normal border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 transition-colors duration-150"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══ MAPA + STREET VIEW ══ */

const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

function MapSection({ ubicacion }: { ubicacion: InfraccionUbicacion }) {
  const [view, setView] = useState<'map' | 'street'>('street')
  const [svStatus, setSvStatus] = useState<'unknown' | 'ok' | 'unavailable'>('unknown')

  useEffect(() => {
    if (view === 'street' && svStatus === 'unavailable') {
      setView('map')
    }
  }, [view, svStatus])

  const lat = Number(ubicacion.latitud)
  const lng = Number(ubicacion.longitud)
  const hasCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GMAPS_KEY ?? '',
  })

  const toggleView = (v: 'map' | 'street') => {
    setView(v)
    if (v === 'street') {
      setSvStatus('unknown')
    }
  }

  const tabClass = (v: 'map' | 'street') =>
    `px-3 py-1 text-[11px] font-medium transition-colors duration-150 ${
      view === v
        ? 'bg-white text-blue-700 shadow-sm'
        : 'text-slate-500 hover:text-slate-700'
    }`

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center">
            <MapPin size={13} className="text-emerald-700" strokeWidth={1.5} />
          </span>
          Ubicación de la Infracción
        </h3>

        {hasCoords && isLoaded && !loadError && (
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
            <button onClick={() => toggleView('street')} className={tabClass('street')}>
              Street View
            </button>
            <button onClick={() => toggleView('map')} className={tabClass('map')}>
              Mapa
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="h-52 sm:h-60 w-full">
          {!GMAPS_KEY ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-50">
              <p className="text-xs text-slate-400">Google Maps no configurado</p>
            </div>
          ) : loadError ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-50">
              <p className="text-xs text-red-500">Error al cargar el mapa</p>
            </div>
          ) : !isLoaded ? (
            <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
              <p className="text-xs text-slate-400">Cargando mapa…</p>
            </div>
          ) : !hasCoords ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-50">
              <p className="text-xs text-slate-400">Coordenadas no disponibles</p>
            </div>
          ) : view === 'street' ? (
            svStatus === 'unavailable' ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 gap-2">
                <MapPin size={20} className="text-slate-300" strokeWidth={1.5} />
                <p className="text-xs text-slate-400">Street View no disponible en esta ubicación</p>
                <button
                  onClick={() => setView('map')}
                  className="text-xs font-medium text-blue-700 hover:text-blue-800"
                >
                  Ver mapa
                </button>
              </div>
            ) : (
              <StreetViewMap lat={lat} lng={lng} onStatus={setSvStatus} />
            )
          ) : (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={{ lat, lng }}
              zoom={16}
              options={{
                fullscreenControl: false,
                mapTypeControl: false,
                streetViewControl: false,
                zoomControl: true,
                clickableIcons: false,
                draggable: false,
                scrollwheel: false,
                disableDoubleClickZoom: true,
              }}
            >
              <Marker position={{ lat, lng }} />
            </GoogleMap>
          )}
        </div>

        <div className="p-3.5 bg-white border-t border-slate-200 space-y-2">
          <p className="text-sm font-medium text-slate-900 leading-snug flex items-center gap-1.5">
            <MapPin size={13} className="text-slate-400 shrink-0" strokeWidth={1.5} />
            {ubicacion.calle} #{ubicacion.numero}
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Map size={12} className="text-slate-400 shrink-0" strokeWidth={1.5} />
            CP {ubicacion.cod_postal} &middot; {ubicacion.municipio}, {ubicacion.estado}
          </p>
          {hasCoords && (
            <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Crosshair size={11} className="text-slate-400 shrink-0" strokeWidth={1.5} />
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </p>
          )}

        </div>
      </div>
    </div>
  )
}

/* ══ STREET VIEW (imperativo) ══ */

function StreetViewMap({ lat, lng, onStatus }: { lat: number; lng: number; onStatus: (s: 'ok' | 'unavailable') => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const onStatusRef = useRef(onStatus)
  onStatusRef.current = onStatus

  useEffect(() => {
    if (!ref.current || !window.google?.maps) {
      onStatusRef.current('unavailable')
      return
    }

    const panorama = new window.google.maps.StreetViewPanorama(ref.current, {
      position: { lat, lng },
      pov: { heading: 0, pitch: 0 },
      zoom: 1,
      addressControl: false,
      showRoadLabels: false,
      fullscreenControl: false,
      zoomControl: true,
      motionTracking: false,
      motionTrackingControl: false,
      clickToGo: false,
      scrollwheel: false,
      linksControl: false,
    })

    const listener = panorama.addListener('status_changed', () => {
      onStatusRef.current(panorama.getStatus() === 'OK' ? 'ok' : 'unavailable')
      google.maps.event.removeListener(listener)
    })

    const timeout = setTimeout(() => {
      if (panorama.getStatus() !== 'OK') {
        onStatusRef.current('unavailable')
      }
    }, 3000)

    return () => {
      clearTimeout(timeout)
      google.maps.event.removeListener(listener)
    }
  }, [lat, lng])

  return <div ref={ref} className="w-full h-full" />
}

/* ══ SECTION ══ */

function Section({
  icon: Icon,
  title,
  iconBg,
  iconColor,
  children,
}: {
  icon: typeof User
  title: string
  iconBg: string
  iconColor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
        <span className={`w-6 h-6 rounded-md ${iconBg} flex items-center justify-center`}>
          <Icon size={13} className={iconColor} strokeWidth={1.5} />
        </span>
        {title}
      </h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

/* ══ FIELD ══ */

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-sm text-slate-900 mt-0.5 leading-snug">{value}</p>
    </div>
  )
}

function FieldWithIcon({ icon: Icon, label, value }: { icon: typeof Tag; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-sm text-slate-900 mt-0.5 leading-snug flex items-center gap-1.5">
        <Icon size={13} className="text-slate-400 shrink-0" strokeWidth={1.5} />
        {value}
      </p>
    </div>
  )
}

/* ══ DOCUMENTOS ══ */

function DocumentosSection({ detalle }: { detalle: InfraccionDetalle }) {
  const documentos: { nombre: string; ruta: string }[] = [
    detalle.Header.url_ine && detalle.Header.url_ine !== 'NO_DATA'
      ? { nombre: 'INE', ruta: detalle.Header.url_ine }
      : null,
    detalle.Header.url_inapam && detalle.Header.url_inapam !== 'NO_DATA'
      ? { nombre: 'INAPAM', ruta: detalle.Header.url_inapam }
      : null,
    detalle.Header.url_tarjeta_circulacion && detalle.Header.url_tarjeta_circulacion !== 'NO_DATA'
      ? { nombre: 'Tarjeta de Circulación', ruta: detalle.Header.url_tarjeta_circulacion }
      : null,
  ].filter(Boolean) as { nombre: string; ruta: string }[]

  const evidencias = (detalle.Header.url_evidencias ?? []).map((ruta: string, i: number) => ({
    nombre: `Evidencia ${i + 1}`,
    ruta,
  }))

  const todos = [...documentos, ...evidencias]

  return (
    <div>
      <h3 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center">
          <FileText size={13} className="text-slate-700" strokeWidth={1.5} />
        </span>
        Documentación
      </h3>

      {todos.length === 0 ? (
        <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center">
          <p className="text-xs text-slate-400">No existen documentos adjuntos</p>
        </div>
      ) : (
        <div className="space-y-2">
          {todos.map((doc) => (
            <div
              key={`${doc.nombre}-${doc.ruta}`}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150 group"
            >
              <div className="min-w-0 flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <FileText size={12} className="text-slate-400" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {doc.nombre.includes('Evidencia') ? 'Evidencia' : 'Documento'}
                  </p>
                  <p className="text-sm font-medium text-slate-900 truncate max-w-[140px]">
                    {doc.nombre}
                  </p>
                </div>
              </div>
              <button
                onClick={() => abrirDocumento(doc.ruta)}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-medium hover:bg-blue-800 active:bg-blue-900 transition-colors duration-150"
              >
                Ver
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ══ LOADING ══ */

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-700 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-900">Consultando infracción</p>
        <p className="text-xs text-slate-500 mt-1">Obteniendo información del registro…</p>
      </div>
    </div>
  )
}

/* ══ EMPTY ══ */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-4">
      <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
        <FileSearch size={24} className="text-slate-400" strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-900">No se encontró información</p>
        <p className="text-xs text-slate-500 mt-1">No se pudo obtener el detalle de esta infracción.</p>
      </div>
    </div>
  )
}
