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
      SELECT *
      FROM v2_infracciones
      WHERE id = $1
      LIMIT 1
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
  }
}
