// src/features/auth/service.ts
import { cookies } from "next/headers";
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { env } from "@/config/env";

export interface PreSessionPayload extends JWTPayload {
  userId: string;
  roles: string[];
}

const SECRET_KEY_COOKIE = new TextEncoder().encode(env.JWT_SECRET_COOKIE);
const SESSION_COOKIE_NAME = "session_token";
const secret = new TextEncoder().encode(process.env.JWT_SECRET_COOKIE);

export interface UserPermission {
  modulo: string;
  accion: string;
}

export interface SessionPayload {
  user: {
    id: string;
    nombres: string;
    apellido_p: string;
    correo: string;
    // Ahora soportamos los roles reales del catálogo v2_roles
    roles: string[];
    // Almacenamos los strings en formato "modulo:accion" para buscar rápido (ej: "infracciones:crear")
    permisos: string[];
  };
  expiresAt: string;
}

/**
 * Obtiene y valida la sesión actual desde las cookies del servidor
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    // Verificar y desencriptar el token JWT
    const { payload } = await jwtVerify(token, SECRET_KEY_COOKIE, {
      algorithms: ["HS256"],
    });

    // Validar que el payload tenga la estructura correcta
    return payload as unknown as SessionPayload;
  } catch (error) {
    // Si el token expiró, fue manipulado o es inválido, fallará silenciosamente regresando null
    console.error("Error al verificar la sesión:", error);
    return null;
  }
}

/**
 * Utilidad opcional para cuando crees tu login (actions.ts)
 * Permite guardar la sesión en una cookie HTTP-only deshabilitando el acceso JS.
 */
export async function createSession(userPayload: SessionPayload["user"]) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8); // 8 horas de duración

  const token = await new SignJWT({
    user: userPayload,
    expiresAt: expiresAt.toISOString(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET_KEY_COOKIE);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true, // Crucial para seguridad XSS
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/**
 * Elimina la cookie de sesión para cerrar la sesión del usuario
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Verifica si el usuario actual tiene un permiso específico
 * @param modulo El módulo a consultar (ej: 'infracciones')
 * @param accion La acción a ejecutar (ej: 'crear', 'validar')
 */
export async function hasPermission(
  modulo: string,
  accion: string,
): Promise<boolean> {
  const session = await getSession();
  if (!session || !session.user.permisos) return false;

  // Formateamos la llave de búsqueda
  const permisoBuscado = `${modulo}:${accion}`;

  // Si el usuario tiene el permiso explícito o un rol de super administrador (opcional)
  return session.user.permisos.includes(permisoBuscado);
}

export async function createPreSession(data: PreSessionPayload) {
  const token = await new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret);

  return token;
}

export async function verifyPreSession(token: string) {
  const { payload } = await jwtVerify(token, secret);

  return payload as unknown as PreSessionPayload;
}
