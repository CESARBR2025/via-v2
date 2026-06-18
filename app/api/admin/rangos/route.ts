import { NextRequest, NextResponse } from "next/server";
import { requirePermiso } from "@/lib/auth/guard";
import { PERM } from "@/features/auth/permissions";
import { RangosService } from "@/features/rangos/service";

export async function GET() {
  try {
    const auth = await requirePermiso(PERM.RANGOS.GESTIONAR);
    if (auth) return auth;

    const rangos = await RangosService.listar();

    return NextResponse.json({ ok: true, data: rangos });
  } catch (error: any) {
    console.error("[API][ADMIN][RANGOS][GET]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al listar rangos" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermiso(PERM.RANGOS.GESTIONAR);
    if (auth) return auth;

    const body = await req.json();
    if (!body.nombre?.trim()) {
      return NextResponse.json(
        { ok: false, message: "El nombre del rango es obligatorio" },
        { status: 400 },
      );
    }

    const rango = await RangosService.crear(body.nombre);

    return NextResponse.json({ ok: true, data: rango }, { status: 201 });
  } catch (error: any) {
    console.error("[API][ADMIN][RANGOS][POST]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al crear rango" },
      { status: error.status || 500 },
    );
  }
}
