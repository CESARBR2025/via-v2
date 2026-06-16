import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/features/auth/service";
import { RangosService } from "@/features/rangos/service";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || !session.user.roles.includes("admin")) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    if (!body.nombre?.trim()) {
      return NextResponse.json(
        { ok: false, message: "El nombre del rango es obligatorio" },
        { status: 400 },
      );
    }

    const rango = await RangosService.actualizar(id, body.nombre);

    return NextResponse.json({ ok: true, data: rango });
  } catch (error: any) {
    console.error("[API][ADMIN][RANGOS][PUT]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al actualizar rango" },
      { status: error.status || 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || !session.user.roles.includes("admin")) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const rango = await RangosService.toggleActivo(id);

    return NextResponse.json({
      ok: true,
      data: rango,
      message: rango.activo ? "Rango activado" : "Rango desactivado",
    });
  } catch (error: any) {
    console.error("[API][ADMIN][RANGOS][DELETE]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al cambiar estado del rango" },
      { status: error.status || 500 },
    );
  }
}
