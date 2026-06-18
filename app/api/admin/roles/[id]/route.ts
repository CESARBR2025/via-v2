import { NextRequest, NextResponse } from "next/server";
import { requirePermiso } from "@/lib/auth/guard";
import { PERM } from "@/features/auth/permissions";
import { POOL_PG } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requirePermiso(PERM.ROLES_PERMISOS.GESTIONAR);
    if (auth) return auth;

    const { id } = await params;

    const roleResult = await POOL_PG.query(
      `SELECT id, nombre, descripcion, activo, creado_en
       FROM v2_roles WHERE id = $1`,
      [id],
    );

    if (roleResult.rows.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Rol no encontrado" },
        { status: 404 },
      );
    }

    const permisosResult = await POOL_PG.query(
      `SELECT p.id, p.modulo, p.accion
       FROM v2_roles_permisos rp
       INNER JOIN v2_permisos p ON rp.permiso_id = p.id
       WHERE rp.rol_id = $1`,
      [id],
    );

    return NextResponse.json({
      ok: true,
      data: {
        ...roleResult.rows[0],
        permisos: permisosResult.rows.map((r) => r.id),
      },
    });
  } catch (error: any) {
    console.error("[API][ADMIN][ROLES][DETALLE][GET]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al obtener rol" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requirePermiso(PERM.ROLES_PERMISOS.GESTIONAR);
    if (auth) return auth;

    const { id } = await params;
    const body = await req.json();
    const { activo } = body;

    if (typeof activo !== "boolean") {
      return NextResponse.json(
        { ok: false, message: "El campo activo debe ser booleano" },
        { status: 400 },
      );
    }

    const result = await POOL_PG.query(
      `UPDATE v2_roles SET activo = $1 WHERE id = $2 RETURNING id, nombre, activo`,
      [activo, id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Rol no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: result.rows[0],
      message: activo
        ? "Rol activado correctamente"
        : "Rol desactivado correctamente. Los usuarios con este rol perderán los accesos asociados.",
    });
  } catch (error: any) {
    console.error("[API][ADMIN][ROLES][PATCH]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al actualizar rol" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requirePermiso(PERM.ROLES_PERMISOS.GESTIONAR);
    if (auth) return auth;

    const { id } = await params;

    const role = await POOL_PG.query(
      `SELECT id, nombre, activo FROM v2_roles WHERE id = $1`,
      [id],
    );

    if (role.rows.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Rol no encontrado" },
        { status: 404 },
      );
    }

    if (role.rows[0].activo) {
      return NextResponse.json(
        { ok: false, message: "No se puede eliminar un rol activo. Desactívalo primero." },
        { status: 400 },
      );
    }

    const usuariosConRol = await POOL_PG.query(
      `SELECT COUNT(*) as count FROM v2_usuarios_roles WHERE rol_id = $1`,
      [id],
    );

    if (parseInt(usuariosConRol.rows[0].count, 10) > 0) {
      return NextResponse.json(
        { ok: false, message: `No se puede eliminar el rol "${role.rows[0].nombre}". Tiene ${usuariosConRol.rows[0].count} usuario(s) asignado(s).` },
        { status: 400 },
      );
    }

    const client = await POOL_PG.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `DELETE FROM v2_roles_permisos WHERE rol_id = $1`,
        [id],
      );

      await client.query(
        `DELETE FROM v2_roles WHERE id = $1`,
        [id],
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    return NextResponse.json({
      ok: true,
      message: `Rol "${role.rows[0].nombre}" eliminado correctamente`,
    });
  } catch (error: any) {
    console.error("[API][ADMIN][ROLES][DELETE]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al eliminar rol" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requirePermiso(PERM.ROLES_PERMISOS.GESTIONAR);
    if (auth) return auth;

    const { id } = await params;
    const body = await req.json();
    const { permisos: nuevosPermisos } = body;

    if (!Array.isArray(nuevosPermisos)) {
      return NextResponse.json(
        { ok: false, message: "El campo permisos debe ser un array de IDs" },
        { status: 400 },
      );
    }

    const roleExists = await POOL_PG.query(
      `SELECT id FROM v2_roles WHERE id = $1`,
      [id],
    );
    if (roleExists.rows.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Rol no encontrado" },
        { status: 404 },
      );
    }

    if (nuevosPermisos.length > 0) {
      const validPermisos = await POOL_PG.query(
        `SELECT id FROM v2_permisos WHERE id = ANY($1)`,
        [nuevosPermisos],
      );
      if (validPermisos.rows.length !== nuevosPermisos.length) {
        return NextResponse.json(
          { ok: false, message: "Algunos permisos no existen" },
          { status: 400 },
        );
      }
    }

    const client = await POOL_PG.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `DELETE FROM v2_roles_permisos WHERE rol_id = $1`,
        [id],
      );

      for (const permisoId of nuevosPermisos) {
        await client.query(
          `INSERT INTO v2_roles_permisos (rol_id, permiso_id) VALUES ($1, $2)`,
          [id, permisoId],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    return NextResponse.json({
      ok: true,
      message: "Permisos actualizados correctamente",
    });
  } catch (error: any) {
    console.error("[API][ADMIN][ROLES][PERMISOS][PUT]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al actualizar permisos" },
      { status: 500 },
    );
  }
}
