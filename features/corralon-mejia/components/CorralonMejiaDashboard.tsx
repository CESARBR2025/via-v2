'use client'

import CorralonBaseDashboard, { type CorralonConfig } from '@/features/compartido/components/CorralonBaseDashboard'

const BADGE_MAP: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  LIBERADO_POR_LIBERACIONES: { bg: '#FEF3C7', text: '#78350F', dot: '#F59E0B', label: 'Pendiente' },
  EN_REVISION_MW: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'En Revisión' },
  CERRADA: { bg: '#DCFCE7', text: '#166534', dot: '#22C55E', label: 'Cerrada' },
}

const config: CorralonConfig = {
  title: 'Panel Corralón Mejía',
  badgeMap: BADGE_MAP,
  pendientesStatus: ['LIBERADA_POR_ACCIDENTE', 'LIBERADA_POR_INFRACCION', 'LIBERADA_POR_DELITO'],
  cerradasStatus: ['FINALIZADA_ACCIDENTE', 'FINALIZADA_INFRACCION', 'FINALIZADA_DELITO'],
  pendientesEstatus: 'CERRADA',
  cerradasEstatus: 'FINALIZADA',
  isPendienteAction: (row) =>
    ['LIBERADA_POR_LIBERACIONES', 'LIBERADA_POR_ACCIDENTE', 'LIBERADA_POR_DELITO'].includes(row.estatusDependencia),
}

interface Props {
  data: any[]
  visibleColumns: any[]
  onSubirComprobante?: (id: string) => void
  onOpenDetalle?: (id: string) => void
  loading?: boolean
}

export default function CorralonMejiaDashboard({ data, visibleColumns, onSubirComprobante, loading, ...props }: Props) {
  return (
    <CorralonBaseDashboard
      data={data}
      visibleColumns={visibleColumns}
      config={config}
      onSubirComprobante={onSubirComprobante}
      loading={loading}
      {...props}
    />
  )
}
