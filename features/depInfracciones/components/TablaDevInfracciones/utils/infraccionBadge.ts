const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  PAGADA:     { bg: 'bg-green-50',  text: 'text-green-800',  label: 'Pagada' },
  PENDIENTE:  { bg: 'bg-amber-50',  text: 'text-amber-800',  label: 'Pendiente' },
  PROCESO:    { bg: 'bg-amber-50',  text: 'text-amber-800',  label: 'Proceso' },
  REGISTRADA: { bg: 'bg-blue-50',   text: 'text-blue-800',   label: 'Registrada' },
  CERRADA:    { bg: 'bg-slate-100', text: 'text-slate-700',  label: 'Cerrada' },
  CANCELADA:  { bg: 'bg-red-50',    text: 'text-red-800',    label: 'Cancelada' },
}

export function getBadgeStyles(estatus?: string | null) {
  return STATUS_MAP[(estatus ?? '').toUpperCase()] ?? { bg: 'bg-red-50', text: 'text-red-800', label: estatus ?? 'Desconocido' }
}
