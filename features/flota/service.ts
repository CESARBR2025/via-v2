import { POOL_PG } from "@/lib/db";

const FLOTA_API_URL = "http://proyecto-flota.vercel.app/api/publica";

interface FlotaVehiculo {
  id: string;
  numero_unidad: string;
  placas?: string;
  descripcion?: string;
}

type FlotaApiResponse =
  | FlotaVehiculo[]
  | { data: FlotaVehiculo[] }
  | { vehicles?: FlotaVehiculo[] }
  | { results?: FlotaVehiculo[] }
  | { patrullas?: FlotaVehiculo[] };

function extraerVehiculos(raw: FlotaApiResponse): FlotaVehiculo[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    if (Array.isArray((raw as any).data)) return (raw as any).data;
    if (Array.isArray((raw as any).vehicles)) return (raw as any).vehicles;
    if (Array.isArray((raw as any).results)) return (raw as any).results;
    if (Array.isArray((raw as any).patrullas)) return (raw as any).patrullas;
  }
  return [];
}

export class FlotaService {
  static async obtenerFlota(): Promise<FlotaVehiculo[]> {
    const apiKey = process.env.NEXT_PUBLIC_FLOTA_API_KEY;

    if (!apiKey) {
      console.warn("[FLOTA] API key no configurada");
      return [];
    }

    const res = await fetch(FLOTA_API_URL, {
      headers: { "x-api-key": apiKey },
      next: { revalidate: 120 },
    });

    if (!res.ok) {
      console.error(`[FLOTA] Error HTTP ${res.status}`);
      return [];
    }

    const raw: FlotaApiResponse = await res.json();
    return extraerVehiculos(raw);
  }

  static async listarPatrullasParaAsignacion(): Promise<
    { id: string; numero_unidad: string; placas: string }[]
  > {
    const flota = await this.obtenerFlota();
    if (flota.length === 0) return [];

    for (const v of flota) {
      const existente = await POOL_PG.query(
        `SELECT id FROM v2_patrullas WHERE numero_unidad = $1`,
        [v.numero_unidad],
      );

      if (existente.rows.length === 0) {
        await POOL_PG.query(
          `INSERT INTO v2_patrullas (numero_unidad, placas, descripcion, activo, sincronizado_en)
           VALUES ($1, $2, $3, true, NOW())`,
          [v.numero_unidad, v.placas ?? null, v.descripcion ?? null],
        );
      } else {
        await POOL_PG.query(
          `UPDATE v2_patrullas SET placas = $1, descripcion = $2, sincronizado_en = NOW()
           WHERE numero_unidad = $3`,
          [v.placas ?? null, v.descripcion ?? null, v.numero_unidad],
        );
      }
    }

    const result = await POOL_PG.query(`
      SELECT id, numero_unidad, placas
      FROM v2_patrullas
      WHERE activo = true
      ORDER BY numero_unidad
    `);

    return result.rows.map((r) => ({
      id: r.id,
      numero_unidad: r.numero_unidad,
      placas: r.placas || "—",
    }));
  }
}
