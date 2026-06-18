import { NextResponse } from "next/server";
import { requirePermiso } from "@/lib/auth/guard";
import { PERM } from "@/features/auth/permissions";
import { POOL_PG } from "@/lib/db";

export async function GET() {
  try {
    const auth = await requirePermiso(PERM.ROLES_PERMISOS.GESTIONAR);
    if (auth) return auth;

    const result = await POOL_PG.query(
      `SELECT id, modulo, accion, descripcion
       FROM v2_permisos
       ORDER BY modulo, accion`,
    );

    const grouped = result.rows.reduce<Record<string, any[]>>((acc, row) => {
      if (!acc[row.modulo]) acc[row.modulo] = [];
      acc[row.modulo].push({
        id: row.id,
        accion: row.accion,
        descripcion: row.descripcion,
      });
      return acc;
    }, {});

    const data = Object.entries(grouped).map(([modulo, permisos]) => ({
      modulo,
      permisos,
    }));

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error("[API][ADMIN][PERMISOS][GET]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al listar permisos" },
      { status: 500 },
    );
  }
}
