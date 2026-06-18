'use client'

import CorralonBaseDashboard, { type CorralonConfig } from '@/features/compartido/components/CorralonBaseDashboard'

const BADGE_MAP: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  LIBERADA_POR_ACCIDENTE: { bg: '#FEF3C7', text: '#78350F', dot: '#F59E0B', label: 'Pendiente' },
  LIBERADA_POR_INFRACCION: { bg: '#FEF3C7', text: '#78350F', dot: '#F59E0B', label: 'Pendiente' },
  LIBERADA_POR_DELITO: { bg: '#FEF3C7', text: '#78350F', dot: '#F59E0B', label: 'Pendiente' },
  EN_REVISION_MW: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'En Revisión' },
  FINALIZADA_ACCIDENTE: { bg: '#DCFCE7', text: '#166534', dot: '#22C55E', label: 'Cerrada' },
  FINALIZADA_INFRACCION: { bg: '#DCFCE7', text: '#166534', dot: '#22C55E', label: 'Cerrada' },
  FINALIZADA_DELITO: { bg: '#DCFCE7', text: '#166534', dot: '#22C55E', label: 'Cerrada' },
}

const config: CorralonConfig = {
  title: 'Panel Corralón MW',
  badgeMap: BADGE_MAP,
  pendientesStatus: ['LIBERADA_POR_ACCIDENTE', 'LIBERADA_POR_INFRACCION', 'LIBERADA_POR_DELITO'],
  cerradasStatus: ['FINALIZADA_ACCIDENTE', 'FINALIZADA_INFRACCION', 'FINALIZADA_DELITO'],
  pendientesEstatus: 'CERRADA',
  cerradasEstatus: 'FINALIZADA',
  isPendienteAction: (row) =>
    row.estatusInfraccion === 'CERRADA' &&
    ['LIBERADA_POR_ACCIDENTE', 'LIBERADA_POR_INFRACCION', 'LIBERADA_POR_DELITO'].includes(row.estatusDependencia),
}

interface Props {
  data: any[]
  visibleColumns: any[]
  onSubirComprobante?: (id: string) => void
  onOpenDetalle?: (id: string) => void
  loading?: boolean
}

export default function CorralonMWDashboard({ data, visibleColumns, onSubirComprobante, loading, ...props }: Props) {
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
