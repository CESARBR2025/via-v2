import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/service";
import { OficialesService } from "@/features/oficiales/service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user.roles.includes("admin")) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

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
