import { POOL_PG as pool } from "@/lib/db";
import type { KpiData } from "./types";

export class AdminRepository {
  static async getKpiData(): Promise<KpiData> {
    const queries = [
      pool.query(`SELECT COUNT(*)::int AS total FROM v2_infracciones`),
      pool.query(`
        SELECT COUNT(DISTINCT i.id)::int AS total
        FROM v2_infracciones i
        JOIN v2_ordenes_pago_sa7 ops ON ops.infraccion_id = i.id
        WHERE ops.estatus = 'P'
      `),

      pool.query(`
          SELECT COUNT(DISTINCT i.id)::int AS total
        FROM v2_infracciones i
        JOIN v2_ordenes_pago_sa7 ops ON ops.infraccion_id = i.id
        WHERE ops.estatus = 'I'
          
      `),
      pool.query(`
             SELECT COUNT(DISTINCT i.id)::int AS total
        FROM v2_infracciones i
        JOIN v2_ordenes_pago_sa7 ops ON ops.infraccion_id = i.id
        WHERE ops.estatus = 'P'
          AND i.tipo_garantia != 'VEHICULO'
      `),

      // Vehiculos retenidos
      pool.query(`
                  SELECT COUNT(*)::int AS total
        FROM v2_infracciones
        WHERE tipo_garantia = 'VEHICULO'
          AND estatus  IN ('CERRADA')
          AND estatus_dependencia in ('LIBERADA_POR_ACCIDENTE', 'LIBERADA_POR_INFRACCION', 'LIBERADA_POR_DELITO')

          
      `),
      pool.query(`
        SELECT COALESCE(SUM(total_pesos), 0)::numeric(12,2) AS total
        FROM v2_ordenes_pago_sa7
        WHERE estatus = 'P'
      `),
    ];

    const [
      totalRes,
      pagadasRes,
      pendientesRes,
      instanteRes,
      vehiculosRes,
      recaudacionRes,
    ] = await Promise.all(queries);

    return {
      totalInfracciones: totalRes.rows[0].total,
      infraccionesPagadas: pagadasRes.rows[0].total,
      infraccionesPendientes: pendientesRes.rows[0].total,
      pagadasAlInstante: instanteRes.rows[0].total,
      vehiculosRetenidos: vehiculosRes.rows[0].total,
      recaudacionTotal: Number(recaudacionRes.rows[0].total),
    };
  }
}
