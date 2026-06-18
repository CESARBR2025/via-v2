'use client'

import SharedSubirComprobanteModal from '@/features/compartido/components/SubirComprobanteModal'

interface Props {
  idInfraccion: string
  onClose: () => void
  onSuccess?: () => void
}

export default function SubirComprobanteModal({ idInfraccion, onClose, onSuccess }: Props) {
  return (
    <SharedSubirComprobanteModal
      idInfraccion={idInfraccion}
      endpoint="/api/corralon-mejia/subirComprobante"
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}
