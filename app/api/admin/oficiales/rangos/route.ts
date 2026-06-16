import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/service";
import { OficialesService } from "@/features/oficiales/service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user.roles.includes("admin")) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

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
