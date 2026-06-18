import { NextRequest, NextResponse } from "next/server";
import { requirePermiso } from "@/lib/auth/guard";
import { PERM } from "@/features/auth/permissions";
import { SectoresService } from "@/features/sectores/service";

export async function GET() {
  try {
    const auth = await requirePermiso(PERM.SECTORES.GESTIONAR);
    if (auth) return auth;

    const sectores = await SectoresService.listar();

    return NextResponse.json({ ok: true, data: sectores });
  } catch (error: any) {
    console.error("[API][ADMIN][SECTORES][GET]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al listar sectores" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermiso(PERM.SECTORES.GESTIONAR);
    if (auth) return auth;

    const body = await req.json();
    if (!body.nombre?.trim()) {
      return NextResponse.json(
        { ok: false, message: "El nombre del sector es obligatorio" },
        { status: 400 },
      );
    }

    const sector = await SectoresService.crear(body.nombre);

    return NextResponse.json({ ok: true, data: sector }, { status: 201 });
  } catch (error: any) {
    console.error("[API][ADMIN][SECTORES][POST]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al crear sector" },
      { status: error.status || 500 },
    );
  }
}
