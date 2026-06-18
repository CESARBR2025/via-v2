import { NextRequest, NextResponse } from "next/server";
import { requirePermiso } from "@/lib/auth/guard";
import { PERM } from "@/features/auth/permissions";
import { OficialesRepository } from "@/features/oficiales/repository";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermiso(PERM.OFICIALES.GESTIONAR);
    if (auth) return auth;

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
