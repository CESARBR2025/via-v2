// modules/public/infracciones/types.ts

export interface InfraccionPublica {
  infraccion_id: number;
  folio: string;
  placa: string;
  latitud: string;
  longitud: string;
  codigo_postal: string;
  calle: string;
  numero: string;
  articulo: string;
  fraccion: string;
}

export interface BuscarInfraccionesResponse {
  infracciones: InfraccionPublica[];
}
