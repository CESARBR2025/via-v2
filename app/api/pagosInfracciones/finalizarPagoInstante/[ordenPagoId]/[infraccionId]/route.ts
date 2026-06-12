import { NextResponse } from "next/server";

import { POOL_PG as pool } from "@/lib/db";

export async function GET(
  req: Request,
  context: {
    params: Promise<{
      ordenPagoId: string;
      infraccionId: string;
    }>;
  },
) {
  const client = await pool.connect();

  try {
    const { ordenPagoId, infraccionId } = await context.params;

    if (!ordenPagoId) {
      return NextResponse.json(
        { ok: false, message: "ordenPagoId requerido" },
        { status: 400 },
      );
    }

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://via-v2.vercel.app"
        : "http://localhost:3000";

    const sa7Response = await fetch(
      `${baseUrl}/api/saSiete/consultar-estatus`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordenPagoId }),
        cache: "no-store",
      },
    );

    const sa7Data = await sa7Response.json();

    if (!sa7Data.ok) {
      return NextResponse.json(
        { ok: false, message: "No fue posible consultar SA7" },
        { status: 500 },
      );
    }

    if (sa7Data.estatus === "I") {
      return NextResponse.json({
        ok: true,
        pagado: false,
        estatus: "I",
        message: "Pago pendiente",
      });
    }

    if (sa7Data.estatus === "P") {
      try {
        await client.query("BEGIN");

        await client.query(
          `UPDATE v2_ordenes_pago_sa7 SET estatus = 'P' WHERE infraccion_id = $1`,
          [infraccionId],
        );

        await client.query(
          `UPDATE v2_infracciones SET estatus = 'CERRADA', estatus_dependencia = 'LIBERADO_INFRACCIONES_INSTANTE' WHERE id = $1`,
          [infraccionId],
        );

        await client.query("COMMIT");

        return NextResponse.json({
          ok: true,
          pagado: true,
          estatus: "P",
          message: "Pago confirmado e infracción finalizada",
        });
      } catch (dbError) {
        await client.query("ROLLBACK");
        console.error("ERROR ACTUALIZANDO BD:", dbError);
        return NextResponse.json(
          { ok: false, message: "Error actualizando base de datos" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      ok: false,
      message: "Estatus desconocido",
      estatus: sa7Data.estatus,
    });
  } catch (error) {
    console.error("ERROR VERIFICANDO PAGO:", error);
    return NextResponse.json(
      { ok: false, message: "Error interno" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
