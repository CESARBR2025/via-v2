// ============================================================
// REPOSITORY
// features/legalidad/repositories/articulos.repository.ts
// ============================================================

import { POOL_PG as db } from "@/lib/db";

export class ArticulosRepository {
  static async obtenerArticulos() {
    const query = `
            SELECT
                al.id AS articulo_id,
                al.numero AS articulo_numero,
                al.descripcion AS articulo_descripcion,
                al.activo AS articulo_activo,

                fl.id AS fraccion_id,
                fl.numero AS fraccion_numero,
                fl.descripcion AS fraccion_descripcion,
                fl.monto_umas,
                fl.clasificacion,
                fl.activo AS fraccion_activo

            FROM v2_articulos_ley al

            LEFT JOIN v2_fracciones_ley fl
                ON fl.articulo_id = al.id
                AND fl.activo = true

            WHERE al.activo = true

            ORDER BY
                al.numero ASC,
                fl.numero ASC
        `;

    const result = await db.query(query);

    return result.rows;
  }
}
