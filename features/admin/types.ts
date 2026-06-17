export type KpiData = {
  totalInfracciones: number
  infraccionesPagadas: number
  infraccionesPendientes: number
  pagadasAlInstante: number
  vehiculosRetenidos: number
  recaudacionTotal: number
  deudaPendiente: number
  montoPromedio: number
  descuentosInapam: number
}

export type MonthlyRevenue = {
  month: number
  label: string
  total: number
}

export type TopFraccion = {
  descripcion: string
  total: number
}

export type RevenueByDay = {
  dia: number
  label: string
  total: number
}

export type FinancieroData = {
  topFracciones: TopFraccion[]
  revenueByDay: RevenueByDay[]
}

export type GeoItem = {
  nombre: string
  total: number
}

export type GeograficoData = {
  topColonias: GeoItem[]
  porMunicipio: GeoItem[]
  totalConUbicacion: number
}
