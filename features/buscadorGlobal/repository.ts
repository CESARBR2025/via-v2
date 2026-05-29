import "server-only";

import { POOL_PG as pool } from "@/lib/db";

import { mapInfraccionPublica } from "./mappers";

import { InfraccionPublica } from "./types";

export class BuscadorGlobalRepository {
  // Listar infracciones por placa
  static async listarInfraccionesPlaca(
    placa: string,
  ): Promise<InfraccionPublica[]> {
    try {
      const query = `
        SELECT
          i.id AS infraccion_id,
          i.folio,
          i.placa,

          CONCAT(
            COALESCE(i.calle, ''),
            ' ',
            COALESCE(i.numero, ''),
            ', CP ',
            COALESCE(i.codigo_postal, '')
          ) AS lugar,

          i.latitud,
          i.longitud,

          a.descripcion AS articulo,
          f.descripcion AS fraccion

        FROM v2_infracciones i

        LEFT JOIN v2_articulos_ley a
          ON a.id = i.articulo_id

        LEFT JOIN v2_fracciones_ley f
          ON f.id = i.fraccion_id

        WHERE UPPER(i.placa) = UPPER($1)

        ORDER BY i.created_at DESC;
      `;

      const result = await pool.query(query, [placa]);

      return result.rows.map(mapInfraccionPublica);
    } catch (error) {
      console.error("[REPOSITORY][LISTAR_INFRACCIONES_PLACA]", error);

      throw error;
    }
  }

  // Buscar toda la data de la infraccion global
  static async buscarInfraccionCompletaRepository(idInfraccion: string) {
    try {
      const query = `
  SELECT 
    i.id,
    i.folio,
    i.estatus,
    i.created_at,

    i.articulo_id,
    a.descripcion as articulo_descripcion,
    i.fraccion_id,
    f.descripcion as fraccion_descripcion,

    i.nombre_infractor,
    i.apellido_paterno_infractor,
    i.apellido_materno_infractor,
    i.curp_infractor,
    i.marca,
    i.modelo,
    i.color,
    i.placa,

    i.latitud,
    i.longitud,
    i.codigo_postal,
    i.calle,
    i.numero,
    i.municipio,
    i.estado,

    i.tipo_garantia,
    i.garantia_entregada,

    o.total_umas,
    o.total_pesos

  FROM v2_infracciones i
  LEFT JOIN v2_ordenes_pago_sa7 o
    ON o.infraccion_id = i.id
  JOIN v2_articulos_ley a on i.articulo_id = a.id
  JOIN v2_fracciones_ley f on i.fraccion_id = f.id
  WHERE i.id = $1 
  ORDER BY o.created_at DESC
  LIMIT 1;
`;

      const result = await pool.query(query, [idInfraccion]);

      return result.rows[0];
    } catch (error) {
      console.error(
        "[REPOSITORY][TRAER_DATA_COMPLETA_INFRACCIONES_PLACA]",
        error,
      );

      throw error;
    }
  }
}
