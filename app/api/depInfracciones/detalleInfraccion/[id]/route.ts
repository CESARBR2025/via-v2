import { NextResponse } from "next/server";
import { DepInfraccionesService } from "@/features/depInfracciones/service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    console.log(id);
    console.log("entro");
    const data = await DepInfraccionesService.obtenerDetalleInfraccionSV(id);
    console.log(data);

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
