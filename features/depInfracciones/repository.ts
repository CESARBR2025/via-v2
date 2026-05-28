// repository/infraccion.repository.ts

import { POOL_PG as pool } from "@/lib/db";

export class DepInfraccionesRepository {
  static async findList(params: {
    from: string;
    to: string;
    limit: number;
    offset: number;
  }) {
    const { from, to, limit, offset } = params;

    const query = `
      SELECT
        id,
        folio,
        estatus,
        placa,
        created_at
      FROM v2_infracciones
      WHERE tipo_garantia != 'VEHICULO'
        AND pago_al_momento = false
        AND estatus != 'PAGADA'
        AND created_at BETWEEN $1 AND $2
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4
    `;

    const values = [from, to, limit, offset];

    const result = await pool.query(query, values);

    return {
      rows: result.rows,
    };
  }

  static async countList(params: { from: string; to: string }) {
    const { from, to } = params;

    const query = `
      SELECT COUNT(*)::int AS total
      FROM v2_infracciones
      WHERE tipo_garantia != 'VEHICULO'
        AND pago_al_momento = false
        AND created_at BETWEEN $1 AND $2
    `;

    const result = await pool.query(query, [from, to]);

    return result.rows[0].total;
  }

  static async findById(id: string) {
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

    const result = await pool.query(query, [id]);

    return result.rows[0];
  }
}
