import { NextResponse } from "next/server";

import { AuthErrors } from "@/lib/errors/errors";
import { getSession } from "@/features/auth/service";

export async function requirePermiso(permiso: string): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Sesión expirada", code: "AUTH_SESSION_EXPIRED" },
      { status: 401 },
    );
  }
  if (!session.user.permisos.includes(permiso)) {
    return NextResponse.json(
      { ok: false, error: "No tienes permisos para realizar esta acción", code: "AUTH_FORBIDDEN" },
      { status: 403 },
    );
  }
  return null;
}

export async function assertPermiso(permiso: string): Promise<void> {
  const session = await getSession();
  if (!session) throw AuthErrors.SESSION_EXPIRED;
  if (!session.user.permisos.includes(permiso)) throw AuthErrors.FORBIDDEN;
}
