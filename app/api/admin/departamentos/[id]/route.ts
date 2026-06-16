import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/features/auth/service";
import { DepartamentosService } from "@/features/departamentos/service";

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
        { ok: false, message: "El nombre del departamento es obligatorio" },
        { status: 400 },
      );
    }

    const departamento = await DepartamentosService.actualizar(id, body.nombre);

    return NextResponse.json({ ok: true, data: departamento });
  } catch (error: any) {
    console.error("[API][ADMIN][DEPARTAMENTOS][PUT]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al actualizar departamento" },
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
    const departamento = await DepartamentosService.toggleActivo(id);

    return NextResponse.json({
      ok: true,
      data: departamento,
      message: departamento.activo ? "Departamento activado" : "Departamento desactivado",
    });
  } catch (error: any) {
    console.error("[API][ADMIN][DEPARTAMENTOS][DELETE]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al cambiar estado del departamento" },
      { status: error.status || 500 },
    );
  }
}
