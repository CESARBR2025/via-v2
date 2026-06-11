// app/api/pagos/verificar/[ordenPagoId]/route.ts

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
    console.log("ENTRO A VERIFICAR PAGO");
    const { ordenPagoId, infraccionId } = await context.params;
    const url = new URL(req.url);
    const finalizar = url.searchParams.get("finalizar") === "true";
    console.log("ORDEN PAGO ID:", ordenPagoId);
    console.log("INFRACCION ID:", infraccionId);
    console.log("FINALIZAR:", finalizar);

    if (!ordenPagoId) {
      return NextResponse.json(
        {
          ok: false,
          message: "ordenPagoId requerido",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // CONSULTAR ENDPOINT INTERNO SA7
    // =====================================================
    console.log("entro");
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://via-v2.vercel.app"
        : "http://localhost:3000";

    console.log(`${baseUrl}/api/saSiete/consultar-estatus`);
    const sa7Response = await fetch(
      `${baseUrl}/api/saSiete/consultar-estatus`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ordenPagoId,
        }),
        cache: "no-store",
      },
    );

    const sa7Data = await sa7Response.json();

    console.log("RESPUESTA SA7:", sa7Data);

    if (!sa7Data.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: "No fue posible consultar SA7",
        },
        {
          status: 500,
        },
      );
    }

    // =====================================================
    // SI SIGUE PENDIENTE
    // =====================================================

    if (sa7Data.estatus === "I") {
      return NextResponse.json({
        ok: true,
        pagado: false,
        estatus: "I",
        message: "Pago pendiente",
      });
    }

    // =====================================================
    // SI PAGADO
    // =====================================================

    if (sa7Data.estatus === "P") {
      try {
        console.log("PAGO CONFIRMADO, ACTUALIZANDO BD...");
        console.log(ordenPagoId);
        console.log(infraccionId);
        await client.query("BEGIN");

        // =============================================
        // ACTUALIZAR TABLA PAGOS
        // =============================================

        await client.query(
          `
                    UPDATE v2_ordenes_pago_sa7
                    SET estatus = 'P'
                    WHERE infraccion_id = $1
                    `,
          [infraccionId],
        );

        // =============================================
        // ACTUALIZAR INFRACCIÓN
        // =============================================

        await client.query(
          `
                    UPDATE v2_infracciones
                    SET estatus = $2,
                        estatus_dependencia = $3
                    WHERE id = $1
                    `,
          [infraccionId, finalizar ? 'CERRADA' : 'PAGADA', finalizar ? 'LIBERADA_INFRACCIONES_INSTANTE' : 'PAGADA_PENDIENTE_VERIFICACION'],
        );

        await client.query("COMMIT");

        return NextResponse.json({
          ok: true,
          pagado: true,
          finalizado: finalizar,
          estatus: "P",
          message: finalizar ? "Pago confirmado e infracción finalizada" : "Pago confirmado",
        });
      } catch (dbError) {
        await client.query("ROLLBACK");

        console.error("ERROR ACTUALIZANDO BD:", dbError);

        return NextResponse.json(
          {
            ok: false,
            message: "Error actualizando base de datos",
          },
          {
            status: 500,
          },
        );
      }
    }

    // =====================================================
    // ESTATUS DESCONOCIDO
    // =====================================================

    return NextResponse.json({
      ok: false,
      message: "Estatus desconocido",
      estatus: sa7Data.estatus,
    });
  } catch (error) {
    console.error("ERROR VERIFICANDO PAGO:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error interno",
      },
      {
        status: 500,
      },
    );
  } finally {
    client.release();
  }
}
