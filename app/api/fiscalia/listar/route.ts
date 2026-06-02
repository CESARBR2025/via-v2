import { NextResponse } from "next/server";
import { DepInfraccionesService } from "@/features/depInfracciones/service";

export async function GET(req: Request) {
  try {
    console.log("entro");
    const result =
      await DepInfraccionesService.listarInfraccionesFiscaliaService();
    console.log(result);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
