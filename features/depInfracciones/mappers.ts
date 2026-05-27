// mapper/infraccion.mapper.ts

import { InfraccionListItem } from "./types";

export const mapInfraccionListItem = (row: any): InfraccionListItem => ({
  id: row.id,
  folio: row.folio,
  estatus: row.estatus,
  placa: row.placa,
  created_at: row.created_at,
});
