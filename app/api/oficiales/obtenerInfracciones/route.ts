import { NextResponse, NextRequest } from "next/server";
import { DepInfraccionesService } from "@/features/depInfracciones/service";

export async function GET(request: NextRequest) {
  try {
    // 1. Extraer los searchParams de la URL de la petición
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");

    // 2. Validar que el parámetro realmente venga en la consulta
    if (!userId) {
      return NextResponse.json(
        { error: "El parámetro userId es requerido" },
        { status: 400 },
      );
    }
    console.log(userId);

    console.log("entro");
    const result =
      await DepInfraccionesService.listarInfraccionesRealizadasService(userId);
    console.log(result);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
