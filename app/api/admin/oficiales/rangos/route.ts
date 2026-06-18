import { NextResponse } from "next/server";
import { requirePermiso } from "@/lib/auth/guard";
import { PERM } from "@/features/auth/permissions";
import { OficialesService } from "@/features/oficiales/service";

export async function GET() {
  try {
    const auth = await requirePermiso(PERM.OFICIALES.GESTIONAR);
    if (auth) return auth;

    const rangos = await OficialesService.listarRangos();

    return NextResponse.json({ ok: true, data: rangos });
  } catch (error: any) {
    console.error("[API][ADMIN][OFICIALES][RANGOS][GET]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al listar rangos" },
      { status: 500 },
    );
  }
}
