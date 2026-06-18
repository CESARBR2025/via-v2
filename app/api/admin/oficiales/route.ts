import { NextRequest, NextResponse } from "next/server";
import { requirePermiso } from "@/lib/auth/guard";
import { PERM } from "@/features/auth/permissions";
import { OficialesService } from "@/features/oficiales/service";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermiso(PERM.OFICIALES.GESTIONAR);
    if (auth) return auth;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const activo = searchParams.get("activo");
    const departamentoId = searchParams.get("departamentoId") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const result = await OficialesService.listar({
      search,
      activo: activo === "true" ? true : activo === "false" ? false : undefined,
      departamentoId,
      page,
      limit,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error: any) {
    console.error("[API][ADMIN][OFICIALES][GET]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al listar oficiales" },
      { status: error.status || 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermiso(PERM.OFICIALES.GESTIONAR);
    if (auth) return auth;

    const body = await req.json();

    if (!body.curp || !body.numeroEmpleado) {
      return NextResponse.json(
        { ok: false, message: "CURP y número de empleado son obligatorios" },
        { status: 400 },
      );
    }

    const oficial = await OficialesService.crear({
      curp: body.curp,
      numeroEmpleado: body.numeroEmpleado,
      telefono: body.telefono,
      departamentoId: body.departamentoId,
      rangoId: body.rangoId,
      patrullaId: body.patrullaId,
      sectorId: body.sectorId,
      fechaIngreso: body.fechaIngreso,
    });

    return NextResponse.json({ ok: true, data: oficial }, { status: 201 });
  } catch (error: any) {
    console.error("[API][ADMIN][OFICIALES][POST]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al crear oficial" },
      { status: error.status || 500 },
    );
  }
}
