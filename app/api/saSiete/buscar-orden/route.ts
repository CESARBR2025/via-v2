// app/api/saSiete/buscar-orden/route.ts

import { NextRequest, NextResponse } from "next/server";
import { POOL_PG as pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Ejemplo:
    // /api/saSiete/buscar-orden?infraccion_id=123
    const infraccionId = searchParams.get("infraccion_id");

    if (!infraccionId) {
      return NextResponse.json(
        {
          ok: false,
          message: "infraccion_id es requerido",
        },
        { status: 400 },
      );
    }

    const query = `
      SELECT
        orden_pago_id
      FROM v2_ordenes_pago_sa7
      WHERE infraccion_id = $1
      LIMIT 1
    `;

    const result = await pool.query(query, [infraccionId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "No se encontró la orden",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        orden_pago_id: result.rows[0].orden_pago_id,
      },
    });
  } catch (error) {
    console.error("Error buscar-orden:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error interno del servidor",
      },
      { status: 500 },
    );
  }
}
