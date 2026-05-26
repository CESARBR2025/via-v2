import { NextRequest, NextResponse } from "next/server";

import {
  InfraccionesService,
  sanitizeCrearInfraccionPayload,
} from "@/features/infracciones/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body);

    // obtener desde auth/session/jwt
    const oficialId = "901eecf4-8e8d-489c-8595-deec458b16bf";

    const payload = sanitizeCrearInfraccionPayload(body, oficialId);
    console.log(payload);

    const infraccion = await InfraccionesService.crear(payload);
    console.log(infraccion);
    return NextResponse.json(
      {
        ok: true,
        data: infraccion,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("[API][INFRACCIONES][POST]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Ocurrió un error al registrar la infracción",
      },
      {
        status: 500,
      },
    );
  }
}
