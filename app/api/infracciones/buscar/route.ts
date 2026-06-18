import { NextResponse } from "next/server";
import { POOL_PG as pool } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ data: [] });
    }

    const searchTerm = `%${q}%`;
    const query = `
      SELECT id, folio, placa, nombre_infractor
      FROM v2_infracciones
      WHERE folio ILIKE $1 OR placa ILIKE $1
      ORDER BY created_at DESC
      LIMIT 8
    `;

    const result = await pool.query(query, [searchTerm]);

    return NextResponse.json({ data: result.rows });
  } catch (error: any) {
    console.error("Error en búsqueda global:", error);
    return NextResponse.json({ data: [], error: error.message }, { status: 500 });
  }
}
