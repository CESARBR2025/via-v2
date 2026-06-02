// features/gruas/repository.ts
import { POOL_PG as pool } from "@/lib/db";

export class GruasRepository {
  static async obtenerGruasRP() {
    const result = await pool.query(`
      SELECT
        id,
        nombre,
        activo
      FROM v2_gruas
      WHERE activo = true
      ORDER BY nombre ASC
    `);

    return result.rows;
  }
}
