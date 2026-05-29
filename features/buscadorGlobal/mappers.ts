// modules/public/infracciones/mapper.ts

import { InfraccionPublica } from "./types";

export const mapInfraccionPublica = (row: any): InfraccionPublica => ({
  infraccion_id: row.infraccion_id,
  folio: row.folio,
  placa: row.placa,
  latitud: row.latitud,
  longitud: row.longitud,
  codigo_postal: row.codigo_postal,
  calle: row.calle,
  numero: row.numero,
  articulo: row.articulo,
  fraccion: row.fraccion,
});
