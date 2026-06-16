import { NextRequest, NextResponse } from "next/server";

import {
  InfraccionesService,
  sanitizeCrearInfraccionPayload,
} from "@/features/infracciones/service";
import { getSession } from "@/features/auth/service";
import { POOL_PG } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, message: "No autorizado" },
        { status: 401 },
      );
    }

    const oficial = await POOL_PG.query(
      `SELECT id FROM v2_oficiales WHERE usuario_id = $1 AND activo = true`,
      [session.user.id],
    );

    if (oficial.rows.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "El usuario no está registrado como oficial activo",
        },
        { status: 403 },
      );
    }

    const oficialId = oficial.rows[0].id;
    console.log(oficialId);

    console.log("========== NUEVA INFRACCION ==========");

    let body;

    try {
      body = await req.json();
      console.log("[BODY RECIBIDO]");
      console.log(body);
      console.dir(body, { depth: null });
    } catch (error) {
      console.error("[ERROR PARSEANDO JSON]", error);

      return NextResponse.json(
        {
          ok: false,
          message: "Body inválido",
        },
        { status: 400 },
      );
    }

    console.log("[SANITIZANDO PAYLOAD]");

    const payload = sanitizeCrearInfraccionPayload(body, oficialId);

    // ─── ACCIDENTE + VEHICULO + DEPENDENCIA RECEPTORA ───
    if (
      body.garantiaSeleccionada === "VEHICULO" &&
      body.motivoRetencionVehiculo === "ACCIDENTE" &&
      body.dependenciaRemisora
    ) {
      payload.estatus = "REGISTRADA";
      payload.estatusDependencia = "RETENIDO_POR_ACCIDENTE_PENDIENTE_OFICIO";
    }

    // ─── ACCIDENTE + VEHICULO + DEPENDENCIA RECEPTORA ───
    if (
      body.garantiaSeleccionada === "VEHICULO" &&
      body.motivoRetencionVehiculo === "DELITO" &&
      body.dependenciaRemisora
    ) {
      payload.estatus = "REGISTRADA";
      payload.estatusDependencia = "RETENIDO_POR_DELITO_PENDIENTE_OFICIO";
    }

    console.log("[PAYLOAD GENERADO]", payload);
    console.dir(payload, { depth: null });

    console.log("[LLAMANDO SERVICE]");

    const infraccion =
      await InfraccionesService.registrarNuevaInfraccionSV(payload);

    console.log(infraccion);
    console.log("[RESPUESTA SERVICE]");
    console.dir(infraccion, { depth: null });

    return NextResponse.json(
      {
        ok: true,
        data: infraccion,
      },
      {
        status: 201,
      },
    );
  } catch (error: any) {
    console.error("[API][INFRACCIONES][POST][ERROR COMPLETO]", error);

    console.error("[MESSAGE]", error?.message);
    console.error("[STACK]", error?.stack);
    console.error("[CAUSE]", error?.cause);

    return NextResponse.json(
      {
        ok: false,
        message:
          error?.message ?? "Ocurrió un error al registrar la infracción",
        stack:
          process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      {
        status: 500,
      },
    );
  }
}
