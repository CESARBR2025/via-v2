import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/features/auth/service";
import { RangosService } from "@/features/rangos/service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user.roles.includes("admin")) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

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
    const session = await getSession();
    if (!session || !session.user.roles.includes("admin")) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

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
