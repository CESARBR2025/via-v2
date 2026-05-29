// app/api/buscadorGlobal/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

import { BuscadorGlobalService } from "@/features/buscadorGlobal/service";

type Params = Promise<{
  id: string;
}>;

/**
 * GET
 * Buscar infracción completa
 */
export async function GET(req: NextRequest, props: { params: Params }) {
  try {
    /**
     * Params
     */
    const params = await props.params;

    const idInfraccion = params.id;

    console.log("[API][BUSCAR_INFRACCION_COMPLETA]", idInfraccion);

    /**
     * Service
     */
    const response =
      await BuscadorGlobalService.buscarInfraccionCompletaService(idInfraccion);

    /**
     * Success
     */
    return NextResponse.json(response, {
      status: 200,
    });
  } catch (error) {
    console.error("[API][BUSCAR_INFRACCION_COMPLETA]", error);

    return NextResponse.json(
      {
        message: "Error obteniendo información de la infracción",
      },
      {
        status: 500,
      },
    );
  }
}
