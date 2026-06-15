import { NextResponse } from "next/server";

import { POOL_PG as pool } from "@/lib/db";
import { generarOrdenSalidaVehiculo } from "@/lib/ordenSalida/generarOrdenSalida";
import { enviarOrdenLiberacionCorreo } from "@/features/emails/server";

export async function GET(
  req: Request,
  context: {
    params: Promise<{
      ordenPagoId: string;
      infraccionId: string;
    }>;
  },
) {
  const client = await pool.connect();

  try {
    const { ordenPagoId, infraccionId } = await context.params;

    if (!ordenPagoId) {
      return NextResponse.json(
        { ok: false, message: "ordenPagoId requerido" },
        { status: 400 },
      );
    }

    console.log(ordenPagoId);

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://via-v2.vercel.app"
        : "http://localhost:3000";

    const sa7Response = await fetch(
      `${baseUrl}/api/saSiete/consultar-estatus`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordenPagoId }),
        cache: "no-store",
      },
    );

    const sa7Data = await sa7Response.json();

    if (!sa7Data.ok) {
      return NextResponse.json(
        { ok: false, message: "No fue posible consultar SA7" },
        { status: 500 },
      );
    }

    console.log(sa7Data);
    console.log(sa7Data.estatus);

    if (sa7Data.estatus === "I") {
      return NextResponse.json({
        ok: true,
        pagado: false,
        estatus: "I",
        message: "Pago pendiente",
      });
    }

    if (sa7Data.estatus === "P") {
      try {
        await client.query("BEGIN");

        await client.query(
          `UPDATE v2_ordenes_pago_sa7 SET estatus = 'P' WHERE infraccion_id = $1`,
          [infraccionId],
        );

        await client.query(
          `UPDATE v2_infracciones SET estatus = 'PAGADA', estatus_dependencia = 'PENDIENTE_ORDEN_SALIDA' WHERE id = $1`,
          [infraccionId],
        );

        await client.query("COMMIT");
      } catch (dbError) {
        await client.query("ROLLBACK");
        console.error("ERROR ACTUALIZANDO BD:", dbError);
        return NextResponse.json(
          { ok: false, message: "Error actualizando base de datos" },
          { status: 500 },
        );
      }

      // ─────────────────────────────────────────────────────────────
      // GENERAR ORDEN DE SALIDA Y ENVIAR POR CORREO
      // ─────────────────────────────────────────────────────────────
      try {
        const datosOrdenRes = await client.query(
          `
            SELECT
              i.id,
              i.folio,
              i.motivo_retencion,
              i.tipo_garantia,
              i.no_oficio_fiscalia,
              i.no_carpeta_investigacion,
              i.marca,
              i.modelo,
              i.color,
              i.placa,
              i.anio_vehiculo,
              i.tipo_vehiculo,
              i.estado,
              i.nombre_infractor,
              i.apellido_paterno_infractor,
              i.apellido_materno_infractor,
              i.nombre_titular_liberacion,
              i.appaterno_titular_liberacion,
              i.apmaterno_titular_liberacion,
              i.correo_titular_liberacion,
              s.es_empresa,
              s.nombre_empresa,
              s.rfc_empresa,
              s.nombre_resp_fiscal,
              s.appaterno_resp_fiscal,
              s.apmaterno_resp_fiscal,
              g.nombre as nombre_grua,
              i.no_serie_vehiculo
            FROM v2_infracciones i
            LEFT JOIN v2_solicitudes_liberacion s ON s.infraccion_id = i.id
            LEFT JOIN v2_gruas g ON g.id = i.grua_id
            WHERE i.id = $1
            ORDER BY s.created_at DESC
            LIMIT 1
          `,
          [infraccionId],
        );

        if (datosOrdenRes.rows.length > 0) {
          const dbData = datosOrdenRes.rows[0];

          const esEmpresa = dbData.es_persona_moral || dbData.es_empresa;

          const tNombre = !dbData.es_empresa
            ? dbData.nombre_titular_liberacion
            : dbData.nombre_resp_fiscal;
          const tPaterno = !dbData.es_empresa
            ? dbData.appaterno_titular_liberacion
            : dbData.appaterno_resp_fiscal;
          const tMaterno = !dbData.es_empresa
            ? dbData.apmaterno_titular_liberacion
            : dbData.apmaterno_resp_fiscal;

          const nombreRecibe = `${tNombre} ${tPaterno} ${tMaterno}`;
          console.log(dbData.no_serie_vehicu1o);

          let noExternoDinamico;
          if (
            dbData.motivo_retencion === "ACCIDENTE" ||
            dbData.motivo_retencion === "DELITO"
          ) {
            noExternoDinamico = dbData.no_carpeta_investigacion;
          } else if (dbData.motivo_retencion === "INFRACCION") {
            noExternoDinamico = dbData.folio;
          }

          console.log(noExternoDinamico);
          const dataParaPDF = {
            id: dbData.id,
            motivoRetencion:
              dbData.motivo_retencion || "SIN MOTIVO ESPECIFICADO",
            estadoOrigen: dbData.estado || "QUERÉTARO",
            noSerie: dbData.no_serie_vehiculo || "—",
            garantiaRetenida: dbData.tipo_garantia || "VEHICULO",
            grua: dbData.nombre_grua,
            noOficio: dbData.folio || "0000",
            rfc: esEmpresa,
            empresaFiscal: dbData.nombre_empresa,
            nombreTitular: nombreRecibe,
            marca: dbData.marca,
            tipoVehiculo: dbData.tipo_vehiculo,
            modelo: dbData.anio_vehiculo,
            color: dbData.color,
            placa: dbData.placa,
            noExterno: noExternoDinamico,
          };

          console.log(dataParaPDF);

          const correoDestino =
            dbData.correo_titular_liberacion || "sin_correo@dominio.com";
          const nombreNotificacion = esEmpresa
            ? nombreRecibe
            : `${dbData.nombre_infractor} ${dbData.apellido_paterno_infractor}`.trim();

          console.log("EP: confirmarPagoLiberacion");
          const pdfBuffer = await generarOrdenSalidaVehiculo({
            data: dataParaPDF,
          });

          await enviarOrdenLiberacionCorreo({
            idInfraccion: dataParaPDF.id,
            correoInfractor: correoDestino,
            nombreInfractor: nombreNotificacion || "Ciudadano",
            folio: dbData.folio || "SIN FOLIO",
            pdfBuffer,
          });
        }
      } catch (orderError) {
        console.error(
          "[ORDEN SALIDA][ERROR] No se pudo generar o enviar la orden:",
          orderError,
        );
      }

      // ─────────────────────────────────────────────────────────────
      // ACTUALIZAR A CERRADA / LIBERADA_POR_INFRACCION
      // ─────────────────────────────────────────────────────────────
      try {
        await client.query(
          `UPDATE v2_infracciones SET estatus = 'CERRADA', estatus_dependencia = 'LIBERADA_POR_INFRACCION', updated_at = NOW() WHERE id = $1`,
          [infraccionId],
        );
      } catch (finalError) {
        console.error(
          "[FINAL][ERROR] No se pudo actualizar el estatus final:",
          finalError,
        );
      }

      return NextResponse.json({
        ok: true,
        pagado: true,
        estatus: "P",
        message: "Pago confirmado",
      });
    }

    return NextResponse.json({
      ok: false,
      message: "Estatus desconocido",
      estatus: sa7Data.estatus,
    });
  } catch (error) {
    console.error("ERROR VERIFICANDO PAGO:", error);
    return NextResponse.json(
      { ok: false, message: "Error interno" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
