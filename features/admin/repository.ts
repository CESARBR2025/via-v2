import { POOL_PG as pool } from "@/lib/db";
import type {
  KpiData,
  MonthlyRevenue,
  FinancieroData,
  GeograficoData,
} from "./types";

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

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

      // pendientes de pago
      pool.query(`
          SELECT COUNT(DISTINCT i.id)::int AS total
        FROM v2_infracciones i
        JOIN v2_ordenes_pago_sa7 ops ON ops.infraccion_id = i.id
        WHERE ops.estatus = 'I'
          
      `),
      // pagadas al instante

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
          AND estatus_dependencia in ('VEHICULO_EN_CORRALON', 'RETENIDO_POR_ACCIDENTE_PENDIENTE_OFICIO', 'RETENIDO_POR_DELITO_PENDIENTE_OFICIO')

          
      `),
      pool.query(`
        SELECT COALESCE(SUM(total_pesos), 0)::numeric(12,2) AS total
        FROM v2_ordenes_pago_sa7
        WHERE estatus = 'P'
      `),

      // Deuda pendiente
      pool.query(`
            SELECT COALESCE(SUM(ops.total_pesos), 0)::numeric(12,2) AS total
        FROM v2_infracciones i
        LEFT JOIN v2_ordenes_pago_sa7 ops ON ops.infraccion_id = i.id
        WHERE (ops.estatus IS NULL OR ops.estatus != 'P')
      
      `),

      // Monto promedio
      pool.query(`
          SELECT  COALESCE(AVG(ops.total_pesos), 0)::numeric(12,2) AS total
        FROM v2_infracciones i
        LEFT JOIN v2_ordenes_pago_sa7 ops ON ops.infraccion_id = i.id
       
        
      `),

      // Descuentos INAPAM
      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM v2_infracciones
        WHERE aplica_descuento_inapam = true
      `),
    ];

    const [
      totalRes,
      pagadasRes,
      pendientesRes,
      instanteRes,
      vehiculosRes,
      recaudacionRes,
      deudaRes,
      promedioRes,
      descuentosRes,
    ] = await Promise.all(queries);

    return {
      totalInfracciones: totalRes.rows[0].total,
      infraccionesPagadas: pagadasRes.rows[0].total,
      infraccionesPendientes: pendientesRes.rows[0].total,
      pagadasAlInstante: instanteRes.rows[0].total,
      vehiculosRetenidos: vehiculosRes.rows[0].total,
      recaudacionTotal: Number(recaudacionRes.rows[0].total),
      deudaPendiente: Number(deudaRes.rows[0].total),
      montoPromedio: Number(promedioRes.rows[0].total),
      descuentosInapam: descuentosRes.rows[0].total,
    };
  }

  static async getFinancieroData(): Promise<FinancieroData> {
    const [topFraccionesRes, revenueByDayRes] = await Promise.all([
      pool.query(`
        SELECT fl.descripcion, COUNT(*)::int AS total
        FROM v2_infracciones i
        JOIN v2_fracciones_ley fl ON fl.id = i.fraccion_id
        GROUP BY fl.id, fl.descripcion
        ORDER BY total DESC
        LIMIT 5
      `),
      pool.query(`
        SELECT EXTRACT(DOW FROM ops.created_at)::int AS dia,
               COALESCE(SUM(ops.total_pesos), 0)::numeric(12,2) AS total
        FROM v2_ordenes_pago_sa7 ops
        WHERE ops.estatus = 'P'
        GROUP BY dia
        ORDER BY dia
      `),
    ]);

    return {
      topFracciones: topFraccionesRes.rows.map((r: any) => ({
        descripcion: r.descripcion,
        total: r.total,
      })),
      revenueByDay: DAY_LABELS.map((label, i) => {
        const row = revenueByDayRes.rows.find((r: any) => r.dia === i);
        return { dia: i, label, total: row ? Number(row.total) : 0 };
      }),
    };
  }

  static async getGeograficoData(): Promise<GeograficoData> {
    const [coloniasRes, municipiosRes, totalRes] = await Promise.all([
      pool.query(`
        SELECT colonia AS nombre, COUNT(*)::int AS total
        FROM v2_infracciones
        WHERE colonia IS NOT NULL AND colonia != ''
        GROUP BY colonia
        ORDER BY total DESC
        LIMIT 8
      `),
      pool.query(`
        SELECT municipio AS nombre, COUNT(*)::int AS total
        FROM v2_infracciones
        WHERE municipio IS NOT NULL AND municipio != ''
        GROUP BY municipio
        ORDER BY total DESC
      `),
      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM v2_infracciones
        WHERE latitud IS NOT NULL AND longitud IS NOT NULL
      `),
    ]);

    return {
      topColonias: coloniasRes.rows,
      porMunicipio: municipiosRes.rows,
      totalConUbicacion: totalRes.rows[0].total,
    };
  }

  static async getMonthlyRevenue(year: number): Promise<MonthlyRevenue[]> {
    const result = await pool.query(
      `
        SELECT
          EXTRACT(MONTH FROM created_at)::int AS month,
          COALESCE(SUM(total_pesos), 0)::numeric(12,2) AS total
        FROM v2_ordenes_pago_sa7
        WHERE estatus = 'P'
          AND EXTRACT(YEAR FROM created_at) = $1
        GROUP BY month
        ORDER BY month
      `,
      [year],
    );

    const dataMap = new Map<number, number>();
    for (const row of result.rows) {
      dataMap.set(row.month, Number(row.total));
    }

    return MONTHS.map((label, i) => ({
      month: i + 1,
      label,
      total: dataMap.get(i + 1) ?? 0,
    }));
  }
}
