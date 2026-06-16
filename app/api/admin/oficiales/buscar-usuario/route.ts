import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/features/auth/service";
import { OficialesRepository } from "@/features/oficiales/repository";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user.roles.includes("admin")) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const curp = searchParams.get("curp");

    if (!curp || curp.trim().length === 0) {
      return NextResponse.json(
        { ok: false, message: "CURP es requerida" },
        { status: 400 },
      );
    }

    const usuario = await OficialesRepository.buscarUsuarioPorCurp(curp.trim().toUpperCase());

    if (!usuario) {
      return NextResponse.json(
        { ok: false, message: "El usuario no existe en el sistema. Debe iniciar sesión al menos una vez." },
        { status: 404 },
      );
    }

    const yaEsOficial = await OficialesRepository.obtenerPorUsuarioId(usuario.id);

    return NextResponse.json({
      ok: true,
      data: {
        id: usuario.id,
        nombreCompleto: `${usuario.nombres} ${usuario.apellido_p} ${usuario.apellido_m}`.trim(),
        correo: usuario.correo,
        curp: usuario.curp,
      },
      yaEsOficial: !!yaEsOficial,
    });
  } catch (error: any) {
    console.error("[API][ADMIN][OFICIALES][BUSCAR-USUARIO][GET]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al buscar usuario" },
      { status: 500 },
    );
  }
}
