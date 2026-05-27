// types/infraccion.types.ts

export type InfraccionListItem = {
  id: number;
  folio: string;
  estatus: string;
  placa: string | null;
  created_at: string;
};

export type InfraccionListResponse = {
  data: InfraccionListItem[];
  page: number;
  limit: number;
  total: number;
};
