import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createSession, getSession } from "@/features/auth/service";

import { POOL_PG } from "@/lib/db";

const ROLE_DASHBOARD: Record<string, string> = {
    super_admin: "/admin/dashboard",
    admin: "/admin/dashboard",
    oficial: "/oficiales/dashboard",
    liberaciones: "/depLiberaciones/dashboard",
    infracciones: "/depInfracciones/dashboard",
    fiscalia: "/externos/fiscalia/dashboard",
    juzgado_civico: "/externos/juzgadoCivico/dashboard",
    corralon_mejia: "/externos/corralonMejia/dashboard",
    corralon_mw: "/externos/corralonMW/dashboard",
};

export async function POST(req: Request) {
    try {
        const { rol } = await req.json();

        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { ok: false, error: "Sesión inválida" },
                { status: 401 },
            );
        }

        if (!session.user.roles.includes(rol)) {
            return NextResponse.json(
                { ok: false, error: "Rol no disponible" },
                { status: 403 },
            );
        }

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
            (row: { modulo: string; accion: string }) =>
                `${row.modulo}:${row.accion}`,
        );

        await createSession({
            id: session.user.id,
            nombres: session.user.nombres,
            apellido_p: session.user.apellido_p,
            correo: session.user.correo,
            roles: session.user.roles,
            permisos,
        });

        const cookieStore = await cookies();

        cookieStore.set("last_role", rol, {
            httpOnly: false,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
        });

        const redirectTo =
            ROLE_DASHBOARD[rol] || `/${rol}/dashboard`;

        return NextResponse.json({
            ok: true,
            redirectTo,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { ok: false, error: "Error interno" },
            { status: 500 },
        );
    }
}
