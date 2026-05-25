import { NextRequest, NextResponse } from "next/server";
import { InfraccionesService } from "@/features/infracciones/service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  console.log("entro");

  const { id } = await params;

  console.log("ID:", id);

  try {
    const infraccion = await InfraccionesService.obtenerPorId(id);
    console.log("Infracción obtenida:", infraccion);
    return NextResponse.json({
      ok: true,
      data: infraccion,
    });
  } catch (error) {
    console.error("[API][INFRACCIONES][GET]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al obtener infracción",
      },
      { status: 500 },
    );
  }
}
