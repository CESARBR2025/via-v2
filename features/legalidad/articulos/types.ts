// ============================================================
// TYPES
// features/legalidad/types/articulos.types.ts
// ============================================================

export interface FraccionLey {
  id: string;
  articulo_id: string;
  numero: string;
  descripcion: string;
  monto_umas: number;
  clasificacion: "Leve" | "Media" | "Grave";
  activo: boolean;
}

export interface ArticuloLey {
  id: string;
  numero: number;
  descripcion: string;
  activo: boolean;
  fracciones: FraccionLey[];
}

export interface ArticulosResponse {
  success: boolean;
  data: ArticuloLey[];
  message?: string;
}
