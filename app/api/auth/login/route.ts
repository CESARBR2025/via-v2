// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";

import { AuthErrors } from "@/lib/errors/errors";

import {
  createPreSession,
  createSession,
  SessionPayload,
} from "@/features/auth/service";
import { withErrorHandling } from "@/lib/errors/wraperError";
import { cusGetUserInfo, cusLogin } from "@/lib/cus";
import { POOL_PG } from "@/lib/db";
import { enviarCorreoRegistroPendiente } from "@/features/emails/server";

export const POST = withErrorHandling(async function POST(req: Request) {
  const body = await req.json();
  const { curp, password } = body;

  if (!curp || !password) {
    throw AuthErrors.MISSING_FIELDS;
  }

  // 1. Validar credenciales de forma externa contra el CUS municipal
  const result = await cusLogin(curp, password);
  if (!result.ok) {
    if (result.status === 401) {
      throw AuthErrors.INVALID_CREDENTIALS;
    }
    throw AuthErrors.CUS_UNAVAILABLE;
  }

  const cusAuth = JSON.parse(result.text);
  const { id_usuario_general } = cusAuth;

  // 2. Buscar o registrar al usuario en la tabla local v2_usuarios
  let userQuery = await POOL_PG.query(
    `SELECT id, nombres, apellido_p, apellido_m, correo FROM v2_usuarios WHERE cus_id = $1`,
    [id_usuario_general],
  );
  let user = userQuery.rows[0];

  if (!user) {
    const cusInfo = await cusGetUserInfo(id_usuario_general).catch(() => {
      throw AuthErrors.CUS_UNAVAILABLE;
    });

    const newUserQuery = await POOL_PG.query(
      `INSERT INTO v2_usuarios (cus_id, curp, nombres, apellido_p, apellido_m, correo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nombres, apellido_p, apellido_m, correo`,
      [
        id_usuario_general,
        cusInfo.data?.curp,
        cusInfo.data?.nombre,
        cusInfo.data?.primer_apellido,
        cusInfo.data?.segundo_apellido,
        cusInfo.data?.email,
      ],
    );
    user = newUserQuery.rows[0];

    enviarCorreoRegistroPendiente({
      correo: user.correo,
      nombres: user.nombres,
    }).catch((err) =>
      console.error("[LOGIN] Error al enviar correo de pendiente:", err),
    );
  }

  // 3. Consultar la matriz RBAC unificada (Roles y sus Permisos asignados)
  const extraccionRBAC = await POOL_PG.query(
    `SELECT 
       r.nombre as rol_nombre,
       p.modulo,
       p.accion
     FROM v2_usuarios u
     INNER JOIN v2_usuarios_roles ur ON u.id = ur.usuario_id
     INNER JOIN v2_roles r ON ur.rol_id = r.id
     INNER JOIN v2_roles_permisos rp ON r.id = rp.rol_id
     INNER JOIN v2_permisos p ON rp.permiso_id = p.id
     WHERE u.id = $1 AND u.activo = true AND r.activo = true`,
    [user.id],
  );

  let rbacRows = extraccionRBAC.rows;

  // 4. Sin roles asignados → redirigir a pantalla de aprobación pendiente
  if (rbacRows.length < 1) {
    console.log(
      `Usuario ${user.id} sin roles asignados → pendiente de aprobación`,
    );

    const res = NextResponse.json({
      ok: true,
      action: "PENDING_APPROVAL",
      redirectTo: "/pending-approval",
    });

    return res;
  }

  console.log(rbacRows);

  // 5. Mapear y unificar los Roles y Permisos (Eliminando duplicados con Sets)
  // Ejemplo de formato de salida: ['oficial', 'infracciones']
  const roles = Array.from(new Set(rbacRows.map((row) => row.rol_nombre)));

  // Ejemplo de formato de salida: ['registro_infraccion:crear', 'gestion_garantias:crear']
  const permisos = Array.from(
    new Set(rbacRows.map((row) => `${row.modulo}:${row.accion}`)),
  );

  // 6. FLUJO A: Múltiples Roles activos simultáneos
  if (roles.length > 1) {
    const response = {
      ok: true,
      action: "SELECT_ROLE",
      roles, // Se envía el arreglo limpio al cliente ('oficial', 'infracciones', etc.)
    };
    console.log("FLUJO A RESPONSE:", response);

    // Creamos un empaquetado mínimo temporal para la pantalla de selección
    const preSessionData = {
      userId: user.id,
      roles: roles, // Los roles limpios extraídos de tu query ['oficial', 'admin']
    };

    const preSessionToken = await createPreSession(preSessionData);

    const res = NextResponse.json({
      ok: true,
      action: "SELECT_ROLE",
      redirectTo: "/select-role",
    });

    res.cookies.set("pre_session", preSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10,
    });

    return res;
  }

  // 7. FLUJO B: Un solo Rol asignado (Login Directo con empaquetado de JWT)
  const userData: SessionPayload["user"] = {
    id: user.id,
    nombres: user.nombres,
    apellido_p: user.apellido_p,
    correo: user.correo,
    roles: roles,
    permisos: permisos,
  };

  // Generamos el JWT firmado asíncronamente e inyectamos la cookie HTTP-Only
  await createSession(userData);

  // Mapeo dinámico de redirección basado en tu catálogo de roles real
  let redirectTo = "/dashboard";
  if (roles.includes("super_admin")) redirectTo = "/admin/dashboard";
  else if (roles.includes("admin")) redirectTo = "/admin/dashboard";
  else if (roles.includes("oficial")) redirectTo = "/oficiales/dashboard";
  else if (roles.includes("liberaciones"))
    redirectTo = "/depLiberaciones/dashboard";

  const response = {
    ok: true,
    action: "REDIRECT",
    redirectTo,
  };

  console.log("FLUJO B RESPONSE:", response);
  return NextResponse.json(response);
});
