import { NextRequest, NextResponse } from "next/server";
import { requirePermiso } from "@/lib/auth/guard";
import { PERM } from "@/features/auth/permissions";
import { POOL_PG } from "@/lib/db";

export async function GET() {
  try {
    const auth = await requirePermiso(PERM.ROLES_PERMISOS.GESTIONAR);
    if (auth) return auth;

    const result = await POOL_PG.query(
      `SELECT id, nombre, descripcion, activo, creado_en
       FROM v2_roles
       ORDER BY nombre`,
    );

    return NextResponse.json({ ok: true, data: result.rows });
  } catch (error: any) {
    console.error("[API][ADMIN][ROLES][GET]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al listar roles" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermiso(PERM.ROLES_PERMISOS.GESTIONAR);
    if (auth) return auth;

    const body = await req.json();
    const { nombre, descripcion } = body;

    if (!nombre?.trim()) {
      return NextResponse.json(
        { ok: false, message: "El nombre del rol es obligatorio" },
        { status: 400 },
      );
    }

    const existente = await POOL_PG.query(
      `SELECT id FROM v2_roles WHERE nombre = $1`,
      [nombre.trim()],
    );

    if (existente.rows.length > 0) {
      return NextResponse.json(
        { ok: false, message: `Ya existe un rol con el nombre "${nombre.trim()}"` },
        { status: 409 },
      );
    }

    const nombreNormalizado = nombre.trim().toLowerCase().replace(/\s+/g, "_");

    const result = await POOL_PG.query(
      `INSERT INTO v2_roles (nombre, descripcion)
       VALUES ($1, $2)
       RETURNING id, nombre, descripcion, activo, creado_en`,
      [nombreNormalizado, descripcion?.trim() || null],
    );

    return NextResponse.json({ ok: true, data: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error("[API][ADMIN][ROLES][POST]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al crear rol" },
      { status: 500 },
    );
  }
}
