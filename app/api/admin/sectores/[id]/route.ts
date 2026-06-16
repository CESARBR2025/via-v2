import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/features/auth/service";
import { SectoresService } from "@/features/sectores/service";

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
        { ok: false, message: "El nombre del sector es obligatorio" },
        { status: 400 },
      );
    }

    const sector = await SectoresService.actualizar(id, body.nombre);

    return NextResponse.json({ ok: true, data: sector });
  } catch (error: any) {
    console.error("[API][ADMIN][SECTORES][PUT]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al actualizar sector" },
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
    const sector = await SectoresService.toggleActivo(id);

    return NextResponse.json({
      ok: true,
      data: sector,
      message: sector.activo ? "Sector activado" : "Sector desactivado",
    });
  } catch (error: any) {
    console.error("[API][ADMIN][SECTORES][DELETE]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al cambiar estado del sector" },
      { status: error.status || 500 },
    );
  }
}
