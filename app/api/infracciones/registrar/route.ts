import { NextRequest, NextResponse } from "next/server";

import {
  InfraccionesService,
  sanitizeCrearInfraccionPayload,
} from "@/features/infracciones/service";

export async function POST(req: NextRequest) {
  try {
    console.log("========== NUEVA INFRACCION ==========");

    let body;

    try {
      body = await req.json();
      console.log("[BODY RECIBIDO]");
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

    const oficialId = "901eecf4-8e8d-489c-8595-deec458b16bf";

    console.log("[SANITIZANDO PAYLOAD]");

    const payload = sanitizeCrearInfraccionPayload(body, oficialId);

    console.log("[PAYLOAD GENERADO]");
    console.dir(payload, { depth: null });

    console.log("[LLAMANDO SERVICE]");

    const infraccion =
      await InfraccionesService.registrarNuevaInfraccionSV(payload);

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
