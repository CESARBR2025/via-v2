import { NextResponse } from "next/server";
import { DepInfraccionesService } from "@/features/depInfracciones/service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 50);

  try {
    const result = await DepInfraccionesService.listar({ page, limit });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
