import { POOL_PG } from "@/lib/db";

const FLOTA_API_URL = "http://proyecto-flota.vercel.app/api/publica";
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

// Cache en memoria compartido (se invalida cada CACHE_TTL)
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

    // Si los datos vienen del cache, saltar sync y solo leer BD
    if (desdeCache && flota.length > 0) {
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

    // Sin datos del API, regresar lo que haya en BD
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

    // Solo acá: datos frescos del API → sincronizar con BD
    for (const v of flota) {
      const existente = await POOL_PG.query(
        `SELECT id FROM v2_patrullas WHERE numero_unidad = $1`,
        [v.placa_vehiculo],
      );

      if (existente.rows.length === 0) {
        await POOL_PG.query(
          `INSERT INTO v2_patrullas (numero_unidad, placas, descripcion, activo, sincronizado_en)
           VALUES ($1, $2, $3, true, NOW())`,
          [v.placa_vehiculo, v.placa_vehiculo, `${v.marca} ${v.modelo} ${v.tipo_vehiculo}`.trim()],
        );
      } else {
        await POOL_PG.query(
          `UPDATE v2_patrullas SET placas = $1, descripcion = $2, sincronizado_en = NOW()
           WHERE numero_unidad = $3`,
          [v.placa_vehiculo, `${v.marca} ${v.modelo} ${v.tipo_vehiculo}`.trim(), v.placa_vehiculo],
        );
      }
    }

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
