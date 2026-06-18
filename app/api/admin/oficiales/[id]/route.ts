import { NextRequest, NextResponse } from "next/server";
import { requirePermiso } from "@/lib/auth/guard";
import { PERM } from "@/features/auth/permissions";
import { OficialesService } from "@/features/oficiales/service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requirePermiso(PERM.OFICIALES.GESTIONAR);
    if (auth) return auth;

    const { id } = await params;
    const oficial = await OficialesService.obtenerPorId(id);

    return NextResponse.json({ ok: true, data: oficial });
  } catch (error: any) {
    console.error("[API][ADMIN][OFICIALES][GET]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al obtener oficial" },
      { status: error.status || 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requirePermiso(PERM.OFICIALES.GESTIONAR);
    if (auth) return auth;

    const { id } = await params;
    const body = await req.json();

    const oficial = await OficialesService.actualizar(id, {
      numeroEmpleado: body.numeroEmpleado,
      telefono: body.telefono,
      departamentoId: body.departamentoId,
      rangoId: body.rangoId,
      patrullaId: body.patrullaId,
      sectorId: body.sectorId,
      fechaIngreso: body.fechaIngreso,
      activo: body.activo,
    });

    return NextResponse.json({ ok: true, data: oficial });
  } catch (error: any) {
    console.error("[API][ADMIN][OFICIALES][PUT]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al actualizar oficial" },
      { status: error.status || 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requirePermiso(PERM.OFICIALES.GESTIONAR);
    if (auth) return auth;

    const { id } = await params;
    await OficialesService.desactivar(id);

    return NextResponse.json({ ok: true, message: "Oficial desactivado correctamente" });
  } catch (error: any) {
    console.error("[API][ADMIN][OFICIALES][DELETE]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al desactivar oficial" },
      { status: error.status || 500 },
    );
  }
}
