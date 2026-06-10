import { NextResponse } from "next/server";
import { POOL_PG as db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ infraccionId: string }> },
) {
  const { infraccionId } = await params;

  try {
    // Obtener solicitud
    const solicitudRes = await db.query(
      `
      SELECT id, tipo_liberacion, es_empresa, nombre_empresa, rfc_empresa, estatus
      FROM v2_solicitudes_liberacion
      WHERE infraccion_id = $1
      `,
      [infraccionId],
    );

    if (solicitudRes.rows.length === 0) {
      return NextResponse.json(
        { error: "No se encontró solicitud de liberación para esta infracción" },
        { status: 404 },
      );
    }

    const solicitud = solicitudRes.rows[0];

    // Obtener documentos
    const docsRes = await db.query(
      `
      SELECT id, tipo_documento, url_documento, estatus_revision, observaciones, created_at
      FROM v2_documentos_liberacion
      WHERE solicitud_id = $1
      ORDER BY created_at
      `,
      [solicitud.id],
    );

    return NextResponse.json({
      solicitud: {
        id: solicitud.id,
        tipoLiberacion: solicitud.tipo_liberacion,
        esEmpresa: solicitud.es_empresa,
        nombreEmpresa: solicitud.nombre_empresa,
        rfcEmpresa: solicitud.rfc_empresa,
        estatus: solicitud.estatus,
      },
      documentos: docsRes.rows.map((d) => ({
        id: d.id,
        tipo: d.tipo_documento,
        url: d.url_documento,
        estatusRevision: d.estatus_revision,
        observaciones: d.observaciones,
      })),
    });
  } catch (error) {
    console.error("[LIBERACIONES][DOCUMENTOS] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
