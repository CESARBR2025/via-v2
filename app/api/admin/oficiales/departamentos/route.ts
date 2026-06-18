import { NextResponse } from "next/server";
import { requirePermiso } from "@/lib/auth/guard";
import { PERM } from "@/features/auth/permissions";
import { OficialesService } from "@/features/oficiales/service";

export async function GET() {
  try {
    const auth = await requirePermiso(PERM.OFICIALES.GESTIONAR);
    if (auth) return auth;

    const departamentos = await OficialesService.listarDepartamentos();

    return NextResponse.json({ ok: true, data: departamentos });
  } catch (error: any) {
    console.error("[API][ADMIN][OFICIALES][DEPARTAMENTOS][GET]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al listar departamentos" },
      { status: 500 },
    );
  }
}
