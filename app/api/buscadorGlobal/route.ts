// app/api/public/infracciones/route.ts

import { NextRequest, NextResponse } from "next/server";

import { BuscadorGlobalService } from "@/features/buscadorGlobal/service";

export async function GET(req: NextRequest) {
  console.log("entro");
  try {
    const placa = req.nextUrl.searchParams.get("placa");
    console.log(placa);

    if (!placa) {
      return NextResponse.json(
        {
          error: "La placa es requerida",
        },
        {
          status: 400,
        },
      );
    }

    const data = await BuscadorGlobalService.buscarPorPlaca(placa);

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Error interno del servidor",
      },
      {
        status: 500,
      },
    );
  }
}
