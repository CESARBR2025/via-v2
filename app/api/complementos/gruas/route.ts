// app/api/gruas/route.ts

import { NextResponse } from "next/server";

import { GruasService } from "@/features/gruas/service";

export async function GET() {
  try {
    const gruas = await GruasService.obtenerGruasSV();

    return NextResponse.json(
      {
        ok: true,
        data: gruas,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("[API][GRUAS][GET]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al obtener las grúas",
      },
      {
        status: 500,
      },
    );
  }
}
