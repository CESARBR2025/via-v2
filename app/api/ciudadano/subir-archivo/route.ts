import { NextRequest, NextResponse } from "next/server";
import { POOL_PG } from "@/lib/db";
import { getExpedienteToken } from "@/lib/expediente-digital/expediente";
import { subirArchivo, validarArchivo } from "@/features/ciudadano/services/subirDocumentos";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const solicitudId = formData.get("solicitudId") as string | null;
    const tipoDocumento = formData.get("tipoDocumento") as string | null;
    const file = formData.get("file") as File | null;

    if (!solicitudId) {
      return NextResponse.json(
        { message: "solicitudId es requerido" },
        { status: 400 },
      );
    }

    if (!tipoDocumento) {
      return NextResponse.json(
        { message: "tipoDocumento es requerido" },
        { status: 400 },
      );
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        { message: "file es requerido" },
        { status: 400 },
      );
    }

    validarArchivo(file, tipoDocumento);

    const token = await getExpedienteToken();

    const url = await subirArchivo(file, tipoDocumento, solicitudId, token);

    const client = await POOL_PG.connect();

    try {
      await client.query("BEGIN");

      const existente = await client.query(
        `SELECT id FROM v2_documentos_liberacion
         WHERE solicitud_id = $1 AND tipo_documento = $2`,
        [solicitudId, tipoDocumento],
      );

      if (existente.rows.length > 0) {
        await client.query(
          `UPDATE v2_documentos_liberacion
           SET url_documento = $1, estatus_revision = NULL, observaciones = NULL, created_at = NOW()
           WHERE id = $2`,
          [url, existente.rows[0].id],
        );
      } else {
        await client.query(
          `INSERT INTO v2_documentos_liberacion (solicitud_id, tipo_documento, url_documento)
           VALUES ($1, $2, $3)`,
          [solicitudId, tipoDocumento, url],
        );
      }

      await client.query("COMMIT");

      return NextResponse.json({ url }, { status: 200 });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("[SUBIR ARCHIVO]", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 },
    );
  }
}
