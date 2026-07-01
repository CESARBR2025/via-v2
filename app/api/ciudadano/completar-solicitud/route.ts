import { NextRequest, NextResponse } from "next/server";
import { POOL_PG } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      infraccionId,
      estatus,
      estatusDependencia,
      nombreTitular,
      appaternoTitular,
      apmaternoTitular,
      curpTitular,
      correoTitular,
    } = body;

    if (!infraccionId) {
      return NextResponse.json(
        { message: "infraccionId es requerido" },
        { status: 400 },
      );
    }

    if (!estatusDependencia) {
      return NextResponse.json(
        { message: "estatusDependencia es requerido" },
        { status: 400 },
      );
    }

    const client = await POOL_PG.connect();

    try {
      const setClauses: string[] = ["updated_at = CURRENT_TIMESTAMP"];
      const values: any[] = [infraccionId];
      let idx = 2;

      if (estatus) {
        setClauses.push(`estatus = $${idx++}`);
        values.push(estatus);
      }

      setClauses.push(`estatus_dependencia = $${idx++}`);
      values.push(estatusDependencia);

      if (nombreTitular) {
        setClauses.push(`nombre_titular_liberacion = $${idx++}`);
        values.push(nombreTitular);
      }
      if (appaternoTitular) {
        setClauses.push(`appaterno_titular_liberacion = $${idx++}`);
        values.push(appaternoTitular);
      }
      if (apmaternoTitular) {
        setClauses.push(`apmaterno_titular_liberacion = $${idx++}`);
        values.push(apmaternoTitular);
      }
      if (curpTitular) {
        setClauses.push(`curp_titular_liberacion = $${idx++}`);
        values.push(curpTitular);
      }
      if (correoTitular) {
        setClauses.push(`correo_titular_liberacion = $${idx++}`);
        values.push(correoTitular);
      }

      await client.query(
        `UPDATE v2_infracciones SET ${setClauses.join(", ")} WHERE id = $1`,
        values,
      );

      return NextResponse.json(
        { message: "Solicitud completada correctamente" },
        { status: 200 },
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("[COMPLETAR SOLICITUD]", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 },
    );
  }
}
