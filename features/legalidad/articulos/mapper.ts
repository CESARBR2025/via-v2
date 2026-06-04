// ============================================================
// MAPPERS
// features/legalidad/mappers/articulos.mapper.ts
// ============================================================

import { ArticuloLey } from "./types";
import { FraccionLey } from "./types";

interface QueryRow {
  articulo_id: string;
  articulo_numero: number;
  articulo_descripcion: string;
  articulo_activo: boolean;

  fraccion_id: string | null;
  fraccion_numero: string | null;
  fraccion_descripcion: string | null;
  monto_umas: number | null;
  clasificacion: "Leve" | "Media" | "Grave" | null;
  fraccion_activo: boolean | null;
}

export class ArticulosMapper {
  static toDomain(rows: QueryRow[]): ArticuloLey[] {
    const articulosMap = new Map<string, ArticuloLey>();

    for (const row of rows) {
      if (!articulosMap.has(row.articulo_id)) {
        articulosMap.set(row.articulo_id, {
          id: row.articulo_id,
          numero: row.articulo_numero,
          descripcion: row.articulo_descripcion,
          activo: row.articulo_activo,
          fracciones: [],
        });
      }

      if (row.fraccion_id) {
        const fraccion: FraccionLey = {
          id: row.fraccion_id,
          articulo_id: row.articulo_id,
          numero: row.fraccion_numero!,
          descripcion: row.fraccion_descripcion!,
          monto_umas: row.monto_umas!,
          clasificacion: row.clasificacion!,
          activo: row.fraccion_activo!,
        };

        articulosMap.get(row.articulo_id)?.fracciones.push(fraccion);
      }
    }

    return Array.from(articulosMap.values());
  }
}
