import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/service";
import { FlotaService } from "@/features/flota/service";
import { OficialesRepository } from "@/features/oficiales/repository";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user.roles.includes("oficial")) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    let patrullas = await FlotaService.listarPatrullasParaAsignacion();

    if (patrullas.length === 0) {
      const fallback = await OficialesRepository.listarPatrullasActivas();
      patrullas = fallback.map((r) => ({
        id: r.id,
        numero_unidad: r.numero_unidad,
        placas: r.placas || "—",
      }));
    }

    return NextResponse.json({ ok: true, data: patrullas });
  } catch (error: any) {
    console.error("[API][OFICIALES][PATRULLAS][GET]", error);

    try {
      const fallback = await OficialesRepository.listarPatrullasActivas();
      return NextResponse.json({
        ok: true,
        data: fallback.map((r) => ({
          id: r.id,
          numero_unidad: r.numero_unidad,
          placas: r.placas || "—",
        })),
      });
    } catch {
      return NextResponse.json(
        { ok: false, message: "Error al listar patrullas" },
        { status: 500 },
      );
    }
  }
}
