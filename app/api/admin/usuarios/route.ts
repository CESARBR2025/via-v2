import { NextRequest, NextResponse } from "next/server";
import { requirePermiso } from "@/lib/auth/guard";
import { PERM } from "@/features/auth/permissions";
import { POOL_PG } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermiso(PERM.USUARIOS.GESTIONAR);
    if (auth) return auth;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const activo = searchParams.get("activo");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (
        u.nombres ILIKE $${paramIndex} OR
        u.apellido_p ILIKE $${paramIndex} OR
        u.apellido_m ILIKE $${paramIndex} OR
        u.curp ILIKE $${paramIndex} OR
        u.correo ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (activo === "true" || activo === "false") {
      whereClause += ` AND u.activo = $${paramIndex}`;
      params.push(activo === "true");
      paramIndex++;
    }

    const countResult = await POOL_PG.query(
      `SELECT COUNT(*) FROM v2_usuarios u ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    params.push(limit);
    params.push(offset);

    const result = await POOL_PG.query(
      `SELECT
         u.id,
         u.cus_id,
         u.curp,
         u.nombres,
         u.apellido_p,
         u.apellido_m,
         u.correo,
         u.correo_sec,
         u.activo,
         u.creado_en,
         COALESCE(
           json_agg(
             json_build_object('id', r.id, 'nombre', r.nombre, 'descripcion', r.descripcion)
           ) FILTER (WHERE r.id IS NOT NULL),
           '[]'::json
         ) as roles
       FROM v2_usuarios u
       LEFT JOIN v2_usuarios_roles ur ON u.id = ur.usuario_id
       LEFT JOIN v2_roles r ON ur.rol_id = r.id
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.creado_en DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params,
    );

    return NextResponse.json({
      ok: true,
      data: result.rows,
      total,
      page,
      limit,
    });
  } catch (error: any) {
    console.error("[API][ADMIN][USUARIOS][GET]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al listar usuarios" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requirePermiso(PERM.USUARIOS.GESTIONAR);
    if (auth) return auth;

    const body = await req.json();
    const { id, activo } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, message: "ID de usuario requerido" },
        { status: 400 },
      );
    }

    if (typeof activo !== "boolean") {
      return NextResponse.json(
        { ok: false, message: "El campo activo debe ser booleano" },
        { status: 400 },
      );
    }

    await POOL_PG.query(
      `UPDATE v2_usuarios SET activo = $1, actualizado_en = NOW() WHERE id = $2`,
      [activo, id],
    );

    return NextResponse.json({
      ok: true,
      message: activo ? "Usuario activado" : "Usuario desactivado",
    });
  } catch (error: any) {
    console.error("[API][ADMIN][USUARIOS][PATCH]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al actualizar usuario" },
      { status: 500 },
    );
  }
}
