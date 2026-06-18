'use client'

import { useState, useEffect } from 'react'
import { DetalleInfraccionModal, type InfraccionDetalle } from '@/features/depInfracciones/components/TablaDevInfracciones/DetalleInfraccionModal'
import { useGlobalDetailStore } from '@/stores/useGlobalDetailStore'

export default function GlobalDetailModal() {
  const { selectedInfraccionId, setSelectedInfraccionId } = useGlobalDetailStore()
  const [detalle, setDetalle] = useState<InfraccionDetalle | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedInfraccionId) {
      setDetalle(null)
      return
    }
    setLoading(true)
    setDetalle(null)
    fetch(`/api/depInfracciones/detalleInfraccion/${selectedInfraccionId}`)
      .then(res => res.json())
      .then(json => setDetalle(json.data))
      .catch(() => setDetalle(null))
      .finally(() => setLoading(false))
  }, [selectedInfraccionId])

  return (
    <DetalleInfraccionModal
      isOpen={!!selectedInfraccionId}
      onClose={() => { setSelectedInfraccionId(null); setDetalle(null) }}
      loading={loading}
      detalle={detalle}
    />
  )
}
