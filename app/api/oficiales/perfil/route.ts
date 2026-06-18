import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/service";
import { OficialesService } from "@/features/oficiales/service";
import { FlotaService } from "@/features/flota/service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user.roles.includes("oficial")) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    const perfil = await OficialesService.obtenerMiPerfil(session.user.id);

    return NextResponse.json({ ok: true, data: perfil });
  } catch (error: any) {
    console.error("[API][OFICIALES][PERFIL][GET]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al obtener perfil" },
      { status: error.status || 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user.roles.includes("oficial")) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { patrullaId } = body;

    const perfil = await OficialesService.obtenerMiPerfil(session.user.id);

    const actualizado = await OficialesService.actualizarPatrulla(perfil.id, patrullaId || null);

    return NextResponse.json({ ok: true, data: actualizado });
  } catch (error: any) {
    console.error("[API][OFICIALES][PERFIL][PATCH]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al actualizar" },
      { status: error.status || 500 },
    );
  }
}
