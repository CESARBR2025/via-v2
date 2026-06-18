// src/app/api/auth/select-role/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createSession, verifyPreSession } from "@/features/auth/service";

import { POOL_PG } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { rol } = await req.json();

    const cookieStore = await cookies();

    // 1. Leer sesión temporal
    const preSessionToken = cookieStore.get("pre_session")?.value;

    if (!preSessionToken) {
      return NextResponse.json(
        { ok: false, error: "Sesión inválida" },
        { status: 401 },
      );
    }

    // 2. Verificar JWT temporal
    const preSession = await verifyPreSession(preSessionToken);

    // 3. Validar que el rol exista realmente
    if (!preSession.roles.includes(rol)) {
      return NextResponse.json(
        { ok: false, error: "Rol inválido" },
        { status: 403 },
      );
    }

    // 4. Obtener usuario real
    const userQuery = await POOL_PG.query(
      `
      SELECT 
        id,
        nombres,
        apellido_p,
        correo
      FROM v2_usuarios
      WHERE id = $1
      `,
      [preSession.userId],
    );

    const user = userQuery.rows[0];

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // 5. Obtener permisos SOLO del rol seleccionado
    const permisosQuery = await POOL_PG.query(
      `
      SELECT
        p.modulo,
        p.accion
      FROM v2_roles r
      INNER JOIN v2_roles_permisos rp
        ON r.id = rp.rol_id
      INNER JOIN v2_permisos p
        ON rp.permiso_id = p.id
      WHERE r.nombre = $1
      `,
      [rol],
    );

    const permisos = permisosQuery.rows.map(
      (row) => `${row.modulo}:${row.accion}`,
    );

    // 6. Crear sesión FINAL
    await createSession({
      id: user.id,
      nombres: user.nombres,
      apellido_p: user.apellido_p,
      correo: user.correo,
      roles: [rol],
      permisos,
    });

    // 7. Redirect dinámico
    let redirectTo = "/dashboard";

    if (rol === "admin") {
      redirectTo = "/admin/dashboard";
    } else if (rol === "oficial") {
      redirectTo = "/oficiales/dashboard";
    } else if (rol === "liberaciones") {
      redirectTo = "/depLiberaciones/dashboard";
    } else if (rol === "infracciones") {
      redirectTo = "/depInfracciones/dashboard";
    } else if (rol === "fiscalia") {
      redirectTo = "/externos/fiscalia/dashboard";
    } else if (rol === "juzgado_civico") {
      redirectTo = "/externos/juzgadoCivico/dashboard";
    } else if (rol === "corralon_mejia") {
      redirectTo = "/externos/corralonMejia/dashboard";
    } else if (rol === "corralon_mw") {
      redirectTo = "/externos/corralonMW/dashboard";
    }
    // 8. Crear respuesta
    const res = NextResponse.json({
      ok: true,
      redirectTo,
    });

    // 9. Limpiar pre-session
    res.cookies.delete("pre_session");

    // 10. Guardar último rol usado
    res.cookies.set("last_role", rol, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { ok: false, error: "Error interno" },
      { status: 500 },
    );
  }
}
