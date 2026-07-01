import { NextRequest, NextResponse } from "next/server";
import { POOL_PG } from "@/lib/db";

const TIPOS_LIBERACION = ["INFRACCION", "DELITO", "ACCIDENTE"] as const;
type TipoLiberacion = (typeof TIPOS_LIBERACION)[number];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      infraccionId,
      tipoLiberacion,
      esEmpresa,
      nombreEmpresa,
      rfcEmpresa,
      nombreRespFiscal,
      appaternoRespFiscal,
      apmaternoRespFiscal,
    } = body;

    if (!infraccionId) {
      return NextResponse.json(
        { message: "infraccionId es requerido" },
        { status: 400 },
      );
    }

    if (!tipoLiberacion || !TIPOS_LIBERACION.includes(tipoLiberacion as any)) {
      return NextResponse.json(
        {
          message: `tipoLiberacion debe ser uno de: ${TIPOS_LIBERACION.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const tipo = tipoLiberacion as TipoLiberacion;
    const client = await POOL_PG.connect();

    try {
      await client.query("BEGIN");

      const existente = await client.query(
        `SELECT id FROM v2_solicitudes_liberacion WHERE infraccion_id = $1`,
        [infraccionId],
      );

      let solicitudId: string;

      if (existente.rows.length > 0) {
        solicitudId = existente.rows[0].id;

        await client.query(
          `UPDATE v2_solicitudes_liberacion
           SET tipo_liberacion = $2, es_empresa = $3,
               nombre_empresa = COALESCE($4, nombre_empresa),
               rfc_empresa = COALESCE($5, rfc_empresa),
               nombre_resp_fiscal = COALESCE($6, nombre_resp_fiscal),
               appaterno_resp_fiscal = COALESCE($7, appaterno_resp_fiscal),
               apmaterno_resp_fiscal = COALESCE($8, apmaterno_resp_fiscal),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [
            solicitudId,
            tipo,
            esEmpresa === true,
            nombreEmpresa || null,
            rfcEmpresa || null,
            nombreRespFiscal || null,
            appaternoRespFiscal || null,
            apmaternoRespFiscal || null,
          ],
        );
      } else {
        const r = await client.query(
          `INSERT INTO v2_solicitudes_liberacion
             (infraccion_id, tipo_liberacion, es_empresa,
              nombre_empresa, rfc_empresa, estatus,
              nombre_resp_fiscal, appaterno_resp_fiscal, apmaterno_resp_fiscal)
           VALUES ($1, $2, $3, $4, $5, 'PENDIENTE', $6, $7, $8)
           RETURNING id`,
          [
            infraccionId,
            tipo,
            esEmpresa === true,
            nombreEmpresa || null,
            rfcEmpresa || null,
            nombreRespFiscal || null,
            appaternoRespFiscal || null,
            apmaternoRespFiscal || null,
          ],
        );
        solicitudId = r.rows[0].id;
      }

      await client.query("COMMIT");

      return NextResponse.json({ solicitudId }, { status: 200 });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("[INICIAR SOLICITUD]", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 },
    );
  }
}
