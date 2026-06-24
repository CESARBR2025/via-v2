export type KpiData = {
  totalInfracciones: number;
  infraccionesPagadas: number;
  infraccionesPendientes: number;
  pagadasAlInstante: number;
  vehiculosRetenidos: number;
  recaudacionTotal: number;
  deudaPendiente: number;
  montoPromedio: number;
  descuentosInapam: number;
};

export type MonthlyRevenue = {
  month: number;
  label: string;
  total: number;
};

export type TopFraccion = {
  descripcion: string;
  total: number;
};

export type RevenueByDay = {
  dia: number;
  label: string;
  total: number;
};

export type FinancieroData = {
  topFracciones: TopFraccion[];
  revenueByDay: RevenueByDay[];
};

export type GeoItem = {
  nombre: string;
  total: number;
};

export type GeograficoData = {
  topColonias: GeoItem[];
  porMunicipio: GeoItem[];
  totalConUbicacion: number;
};

export type RevenueBySector = {
  sector: string;
  infracciones: number;
  pagos: number;
  total: number;
};

export type TopOficial = {
  usuarioId: string;
  nombres: string;
  apellidoP: string | null;
  apellidoM: string | null;
  numeroEmpleado: string | null;
  infracciones: number;
  pagos: number;
  total: number;
};

export type RevenueBySeverity = {
  clasificacion: string;
  infracciones: number;
  pagos: number;
  total: number;
};
