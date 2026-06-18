import { NextRequest, NextResponse } from "next/server";
import { requirePermiso } from "@/lib/auth/guard";
import { PERM } from "@/features/auth/permissions";
import { POOL_PG } from "@/lib/db";
import { getSession } from "@/features/auth/service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requirePermiso(PERM.USUARIOS.GESTIONAR);
    if (auth) return auth;

    const { id } = await params;

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
       WHERE u.id = $1
       GROUP BY u.id`,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("[API][ADMIN][USUARIOS][GET]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al obtener usuario" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requirePermiso(PERM.USUARIOS.GESTIONAR);
    if (auth) return auth;

    const session = await getSession();
    const { id } = await params;
    const body = await req.json();
    const { roles: nuevosRoles } = body;

    if (!Array.isArray(nuevosRoles)) {
      return NextResponse.json(
        { ok: false, message: "El campo roles debe ser un array de IDs de roles" },
        { status: 400 },
      );
    }

    const usuarioExists = await POOL_PG.query(
      `SELECT id FROM v2_usuarios WHERE id = $1`,
      [id],
    );
    if (usuarioExists.rows.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    const rolesValidos = await POOL_PG.query(
      `SELECT id FROM v2_roles WHERE id = ANY($1) AND activo = true`,
      [nuevosRoles],
    );
    const rolesValidosIds = rolesValidos.rows.map((r) => r.id);

    const client = await POOL_PG.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `DELETE FROM v2_usuarios_roles WHERE usuario_id = $1`,
        [id],
      );

      for (const rolId of rolesValidosIds) {
        await client.query(
          `INSERT INTO v2_usuarios_roles (usuario_id, rol_id, asignado_por)
           VALUES ($1, $2, $3)`,
          [id, rolId, session?.user.id || null],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    const result = await POOL_PG.query(
      `SELECT
         u.id,
         u.nombres,
         u.apellido_p,
         u.apellido_m,
         u.correo,
         COALESCE(
           json_agg(
             json_build_object('id', r.id, 'nombre', r.nombre, 'descripcion', r.descripcion)
           ) FILTER (WHERE r.id IS NOT NULL),
           '[]'::json
         ) as roles
       FROM v2_usuarios u
       LEFT JOIN v2_usuarios_roles ur ON u.id = ur.usuario_id
       LEFT JOIN v2_roles r ON ur.rol_id = r.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id],
    );

    return NextResponse.json({
      ok: true,
      data: result.rows[0],
      message: "Roles actualizados correctamente",
    });
  } catch (error: any) {
    console.error("[API][ADMIN][USUARIOS][PUT]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al actualizar roles" },
      { status: 500 },
    );
  }
}
