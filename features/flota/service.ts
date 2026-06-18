import { POOL_PG } from "@/lib/db";

const FLOTA_API_URL = "http://proyecto-flota.vercel.app/api/publica?placa";
const CACHE_TTL = 120_000; // 2 minutos

interface FlotaVehiculoRaw {
  placa_vehiculo: string;
  num_serie: string;
  marca: string;
  modelo: string;
  color: string;
  tipo_vehiculo: string;
  secretaria: string;
  id_vehiculo: number;
}

type FlotaApiResponse =
  | FlotaVehiculoRaw[]
  | { data: FlotaVehiculoRaw[] }
  | { vehicles?: FlotaVehiculoRaw[] }
  | { results?: FlotaVehiculoRaw[] }
  | { patrullas?: FlotaVehiculoRaw[] };

function extraerVehiculos(raw: FlotaApiResponse): FlotaVehiculoRaw[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    if (Array.isArray((raw as any).data)) return (raw as any).data;
    if (Array.isArray((raw as any).vehicles)) return (raw as any).vehicles;
    if (Array.isArray((raw as any).results)) return (raw as any).results;
    if (Array.isArray((raw as any).patrullas)) return (raw as any).patrullas;
  }
  return [];
}

export interface PatrullaAsignacion {
  id: string;
  numero_unidad: string;
  placas: string;
  num_serie?: string;
  marca?: string;
  modelo?: string;
  color?: string;
  tipo_vehiculo?: string;
  secretaria?: string;
}

let cacheFlota: { datos: FlotaVehiculoRaw[]; timestamp: number } | null = null;

export class FlotaService {
  static async obtenerFlota(): Promise<{
    datos: FlotaVehiculoRaw[];
    desdeCache: boolean;
  }> {
    const ahora = Date.now();

    if (cacheFlota && ahora - cacheFlota.timestamp < CACHE_TTL) {
      return { datos: cacheFlota.datos, desdeCache: true };
    }

    const apiKey = process.env.NEXT_PUBLIC_FLOTA_API_KEY;

    if (!apiKey) {
      console.warn("[FLOTA] API key no configurada");
      return { datos: [], desdeCache: false };
    }

    const res = await fetch(FLOTA_API_URL, {
      headers: { "x-api-key": apiKey },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[FLOTA] Error HTTP ${res.status}`);
      if (cacheFlota) return { datos: cacheFlota.datos, desdeCache: true };
      return { datos: [], desdeCache: false };
    }

    const raw: FlotaApiResponse = await res.json();
    const datos = extraerVehiculos(raw);

    cacheFlota = { datos, timestamp: ahora };

    return { datos, desdeCache: false };
  }

  static invalidarCache() {
    cacheFlota = null;
  }

  static async listarPatrullasParaAsignacion(): Promise<PatrullaAsignacion[]> {
    const { datos: flota, desdeCache } = await this.obtenerFlota();

    // Cache hit: skip sync, solo leer BD
    if (desdeCache && flota.length > 0) {
      const result = await POOL_PG.query(`
        SELECT id, numero_unidad, placas
        FROM v2_patrullas
        WHERE activo = true
        ORDER BY numero_unidad
      `);

      return result.rows.map((r) => {
        const fleetData = flota.find(
          (f) => f.placa_vehiculo === r.numero_unidad,
        );
        return {
          id: r.id,
          numero_unidad: r.numero_unidad,
          placas: fleetData?.placa_vehiculo || r.placas || "—",
          num_serie: fleetData?.num_serie,
          marca: fleetData?.marca,
          modelo: fleetData?.modelo,
          color: fleetData?.color,
          tipo_vehiculo: fleetData?.tipo_vehiculo,
          secretaria: fleetData?.secretaria,
        };
      });
    }

    // Sin datos del API
    if (flota.length === 0) {
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

    // Datos frescos → upsert en batch (1 solo query)
    await POOL_PG.query(
      `
      INSERT INTO v2_patrullas (numero_unidad, placas, descripcion, activo, sincronizado_en)
      SELECT
        unnest($1::text[]),
        unnest($2::text[]),
        unnest($3::text[]),
        true,
        NOW()
      ON CONFLICT (numero_unidad)
      DO UPDATE SET
        placas          = EXCLUDED.placas,
        descripcion     = EXCLUDED.descripcion,
        sincronizado_en = NOW()
      `,
      [
        flota.map((v) => v.placa_vehiculo),
        flota.map((v) => v.placa_vehiculo),
        flota.map((v) => `${v.marca} ${v.modelo} ${v.tipo_vehiculo}`.trim()),
      ],
    );

    const result = await POOL_PG.query(`
      SELECT id, numero_unidad, placas
      FROM v2_patrullas
      WHERE activo = true
      ORDER BY numero_unidad
    `);

    return result.rows.map((r) => {
      const fleetData = flota.find((f) => f.placa_vehiculo === r.numero_unidad);
      return {
        id: r.id,
        numero_unidad: r.numero_unidad,
        placas: fleetData?.placa_vehiculo || r.placas || "—",
        num_serie: fleetData?.num_serie,
        marca: fleetData?.marca,
        modelo: fleetData?.modelo,
        color: fleetData?.color,
        tipo_vehiculo: fleetData?.tipo_vehiculo,
        secretaria: fleetData?.secretaria,
      };
    });
  }
}
