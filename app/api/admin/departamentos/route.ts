import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/features/auth/service";
import { DepartamentosService } from "@/features/departamentos/service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user.roles.includes("admin")) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    const departamentos = await DepartamentosService.listar();

    return NextResponse.json({ ok: true, data: departamentos });
  } catch (error: any) {
    console.error("[API][ADMIN][DEPARTAMENTOS][GET]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al listar departamentos" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user.roles.includes("admin")) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.nombre?.trim()) {
      return NextResponse.json(
        { ok: false, message: "El nombre del departamento es obligatorio" },
        { status: 400 },
      );
    }

    const departamento = await DepartamentosService.crear(body.nombre);

    return NextResponse.json({ ok: true, data: departamento }, { status: 201 });
  } catch (error: any) {
    console.error("[API][ADMIN][DEPARTAMENTOS][POST]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al crear departamento" },
      { status: error.status || 500 },
    );
  }
}
