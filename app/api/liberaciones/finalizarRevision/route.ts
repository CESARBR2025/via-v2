import { NextResponse } from "next/server";
import { POOL_PG as db } from "@/lib/db";

export async function PATCH(request: Request) {
    try {
        const { infraccionId } = await request.json();

        if (!infraccionId) {
            return NextResponse.json(
                { error: "infraccionId es requerido" },
                { status: 400 },
            );
        }

        // Obtener solicitud activa
        const solicitudRes = await db.query(
            `
            SELECT id FROM v2_solicitudes_liberacion
            WHERE infraccion_id = $1
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [infraccionId],
        );

        if (solicitudRes.rows.length === 0) {
            return NextResponse.json(
                { error: "No se encontró solicitud de liberación" },
                { status: 404 },
            );
        }

        const solicitudId = solicitudRes.rows[0].id;

        // Obtener estatus de los documentos
        const docsRes = await db.query(
            `
            SELECT estatus_revision
            FROM v2_documentos_liberacion
            WHERE solicitud_id = $1
            `,
            [solicitudId],
        );

        if (docsRes.rows.length === 0) {
            return NextResponse.json(
                { error: "No hay documentos asociados a la solicitud" },
                { status: 400 },
            );
        }

        const tienePendientes = docsRes.rows.some(
            (d) => !d.estatus_revision || d.estatus_revision === "PENDIENTE",
        );

        if (tienePendientes) {
            return NextResponse.json(
                { error: "No se puede finalizar: hay documentos pendientes de revisión" },
                { status: 400 },
            );
        }

        const tieneRechazados = docsRes.rows.some(
            (d) => d.estatus_revision === "RECHAZADO",
        );

        const nuevoEstatus = tieneRechazados
            ? "PENDIENTE_REVISION"
            : "LIBERADO_POR_LIBERACIONES";

        // Actualizar estatus_dependencia en la infracción
        await db.query(
            `
            UPDATE v2_infracciones
            SET estatus_dependencia = $1, updated_at = NOW()
            WHERE id = $2
            `,
            [nuevoEstatus, infraccionId],
        );

        // También actualizar estatus de la solicitud
        await db.query(
            `
            UPDATE v2_solicitudes_liberacion
            SET estatus = $1, updated_at = NOW()
            WHERE id = $2
            `,
            [nuevoEstatus, solicitudId],
        );

        return NextResponse.json({
            message:
                nuevoEstatus === "LIBERADO_POR_LIBERACIONES"
                    ? "Infracción liberada correctamente"
                    : "Documentos rechazados, se notificará al ciudadano",
            estatus: nuevoEstatus,
        });
    } catch (error) {
        console.error("[LIBERACIONES][FINALIZAR REVISIÓN] Error:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 },
        );
    }
}
