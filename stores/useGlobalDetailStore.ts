'use client'

import { create } from 'zustand'

type GlobalDetailStore = {
  selectedInfraccionId: string | null
  setSelectedInfraccionId: (id: string | null) => void
}

export const useGlobalDetailStore = create<GlobalDetailStore>((set) => ({
  selectedInfraccionId: null,
  setSelectedInfraccionId: (id) => set({ selectedInfraccionId: id }),
}))
