import { NextRequest, NextResponse } from "next/server";

import { POOL_PG } from "@/lib/db";
import { getExpedienteToken } from "@/lib/expediente-digital/expediente";

export async function POST(req: NextRequest) {
  const client = await POOL_PG.connect();

  try {
    const formData = await req.formData();

    const idInfraccion = formData.get("idInfraccion") as string;

    const evidencias = formData.getAll("evidencias") as File[];

    console.log("=======================================");
    console.log("[EVIDENCIAS] Inicio carga");
    console.log("[EVIDENCIAS] idInfraccion:", idInfraccion);
    console.log("[EVIDENCIAS] total archivos:", evidencias.length);
    console.log("=======================================");

    if (!idInfraccion) {
      return NextResponse.json(
        {
          message: "idInfraccion es requerido",
        },
        {
          status: 400,
        },
      );
    }

    if (!evidencias.length) {
      return NextResponse.json(
        {
          message: "Debe enviarse al menos una evidencia",
        },
        {
          status: 400,
        },
      );
    }

    const token = await getExpedienteToken();

    const now = new Date();

    const anio = now.getFullYear().toString();

    const mes = String(now.getMonth() + 1).padStart(2, "0");

    const rutas: string[] = [];

    for (const [index, evidencia] of evidencias.entries()) {
      console.log("---------------------------------------");
      console.log(`[EVIDENCIA ${index + 1}]`);
      console.log("Nombre:", evidencia.name);
      console.log("Tipo:", evidencia.type);
      console.log("Tamaño:", evidencia.size);
      console.log("---------------------------------------");

      const esValido =
        evidencia.type.startsWith("image/") ||
        evidencia.type === "application/pdf";

      if (!esValido) {
        return NextResponse.json(
          {
            message: "Tipo de archivo no permitido",
            archivo: evidencia.name,
            mimeType: evidencia.type,
          },
          {
            status: 400,
          },
        );
      }

      const extension = evidencia.name.split(".").pop() ?? "jpg";

      const archivoRenombrado = new File(
        [evidencia],
        `EVIDENCIA_${Date.now()}_${index}.${extension}`,
        {
          type: evidencia.type,
        },
      );

      console.log("[UPLOAD]", archivoRenombrado.name, archivoRenombrado.type);

      const expedienteForm = new FormData();

      expedienteForm.append("file", archivoRenombrado);

      expedienteForm.append(
        "ruta_personalizada",
        `${anio}/${mes}/${idInfraccion}`,
      );

      expedienteForm.append(
        "sistema",
        process.env.EXPEDIENTE_SISTEMA ?? "sspm",
      );

      const expedienteRes = await fetch(
        `${process.env.EXPEDIENTE_HOST}/api/upload-custom`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: expedienteForm,
        },
      );

      if (!expedienteRes.ok) {
        const errorBody = await expedienteRes.text();

        console.error("[EXPEDIENTE DIGITAL ERROR]", {
          archivoOriginal: evidencia.name,
          archivoRenombrado: archivoRenombrado.name,
          mimeType: evidencia.type,
          status: expedienteRes.status,
          statusText: expedienteRes.statusText,
          response: errorBody,
        });

        return NextResponse.json(
          {
            message: "Error al subir evidencia",
            debug: {
              archivoOriginal: evidencia.name,
              archivoRenombrado: archivoRenombrado.name,
              mimeType: evidencia.type,
              status: expedienteRes.status,
              statusText: expedienteRes.statusText,
              expedienteResponse: errorBody,
            },
          },
          {
            status: 500,
          },
        );
      }

      const responseJson = await expedienteRes.json();

      console.log("[UPLOAD EXITOSO]", responseJson);

      rutas.push(responseJson.data.ruta_relativa);
    }

    console.log("[EVIDENCIAS] Proceso completado");

    // ============================
    // GUARDAR JSONB EN BD
    // ============================

    await client.query("BEGIN");

    await client.query(
      `
      UPDATE v2_infracciones
      SET
        evidencias = $1::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [JSON.stringify(rutas), idInfraccion],
    );

    await client.query("COMMIT");

    console.log("[BD] Evidencias guardadas correctamente");

    return NextResponse.json(
      {
        message: "Evidencias guardadas correctamente",
        data: rutas,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    console.error("[GUARDAR EVIDENCIAS - ERROR FATAL]", error);

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Error interno",
        debug:
          error instanceof Error
            ? {
                name: error.name,
                stack: error.stack,
              }
            : null,
      },
      {
        status: 500,
      },
    );
  } finally {
    client.release();
  }
}
