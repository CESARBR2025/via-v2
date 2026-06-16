import { NextResponse } from "next/server";
import { POOL_PG } from "@/lib/db";
import { getExpedienteToken } from "@/lib/expediente-digital/expediente";

async function subirArchivo(
    archivo: File,
    tipo: string,
    idInfraccion: string,
    token: string,
): Promise<string> {
    const now = new Date();
    const anio = now.getFullYear().toString();
    const mes = String(now.getMonth() + 1).padStart(2, "0");

    const form = new FormData();
    form.append("file", archivo);
    form.append("ruta_personalizada", `${anio}/${mes}/${idInfraccion}`);
    form.append("sistema", process.env.EXPEDIENTE_SISTEMA ?? "sspm");

    const response = await fetch(
        `${process.env.EXPEDIENTE_HOST}/api/upload-custom`,
        {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: form,
        },
    );

    if (!response.ok) {
        const error = await response.json();
        console.error(`[EXPEDIENTE DIGITAL] Error subiendo ${tipo}:`, error);
        throw new Error(`Error al subir ${tipo}`);
    }

    const { data } = await response.json();
    return data.ruta_relativa;
}

export async function PATCH(request: Request) {
    const client = await POOL_PG.connect();

    try {
        const formData = await request.formData();
        const infraccionId = formData.get("infraccionId") as string;

        if (!infraccionId) {
            return NextResponse.json(
                { message: "infraccionId es requerido" },
                { status: 400 },
            );
        }

        // Obtener solicitud activa
        const solicitudRes = await client.query(
            `
            SELECT id, estatus
            FROM v2_solicitudes_liberacion
            WHERE infraccion_id = $1
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [infraccionId],
        );

        if (solicitudRes.rows.length === 0) {
            return NextResponse.json(
                { message: "No se encontró solicitud de liberación" },
                { status: 404 },
            );
        }

        const solicitudId = solicitudRes.rows[0].id;

        // Colectar archivos del form
        const TIPOS_VALIDOS = [
            "factura",
            "ine_titular",
            "ine_representante_legal",
            "comprobante_domicilio",
            "tarjeta_circulacion",
            "oficio_liberacion_fiscalia",
            "oficio_liberacion_juzgado",
            "poder_notarial",
            "constancia_situacion_fiscal",
        ];

        const archivos: { tipo: string; file: File }[] = [];
        for (const tipo of TIPOS_VALIDOS) {
            const file = formData.get(tipo) as File | null;
            if (file) {
                archivos.push({ tipo, file });
            }
        }

        if (archivos.length === 0) {
            return NextResponse.json(
                { message: "No se enviaron archivos para reenviar" },
                { status: 400 },
            );
        }

        // Subir a Expediente Digital
        const token = await getExpedienteToken();

        await client.query("BEGIN");

        for (const a of archivos) {
            const url = await subirArchivo(a.file, a.tipo, infraccionId, token);

            // Verificar si ya existe el documento
            const existente = await client.query(
                `
                SELECT id FROM v2_documentos_liberacion
                WHERE solicitud_id = $1 AND tipo_documento = $2
                `,
                [solicitudId, a.tipo],
            );

            if (existente.rows.length > 0) {
                // Actualizar existente
                await client.query(
                    `
                    UPDATE v2_documentos_liberacion
                    SET url_documento = $1, estatus_revision = NULL, observaciones = NULL, created_at = NOW()
                    WHERE id = $2
                    `,
                    [url, existente.rows[0].id],
                );
            } else {
                // Insertar nuevo
                await client.query(
                    `
                    INSERT INTO v2_documentos_liberacion (solicitud_id, tipo_documento, url_documento)
                    VALUES ($1, $2, $3)
                    `,
                    [solicitudId, a.tipo, url],
                );
            }
        }

        // Resetear estatus de la solicitud
        await client.query(
            `
            UPDATE v2_solicitudes_liberacion
            SET estatus = 'EN_PROCESO_LIBERACIONES', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            `,
            [solicitudId],
        );

        // Actualizar estatus en infracción
        await client.query(
            `
            UPDATE v2_infracciones
            SET estatus = 'REGISTRADA', estatus_dependencia = 'MESA_DE_CONTROL_REVISION', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            `,
            [infraccionId],
        );

        await client.query("COMMIT");

        return NextResponse.json({
            message: "Documentos reenviados correctamente",
            data: archivos.map((a) => ({ tipo: a.tipo })),
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("[CIUDADANO][REINTENTAR DOCUMENTOS] Error:", error);

        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Error interno del servidor",
            },
            { status: 500 },
        );
    } finally {
        client.release();
    }
}
