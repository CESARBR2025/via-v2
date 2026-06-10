import { NextResponse } from "next/server";
import { POOL_PG as db } from "@/lib/db";
// Nota: Recuerda que generarOrdenSalidaVehiculo requerirá ser adaptada
// o ejecutada mediante un servicio que soporte Node.js si usa jsPDF en backend.
import { generarOrdenSalidaVehiculo } from "@/lib/ordenSalida/generarOrdenSalida";
import { enviarOrdenLiberacionCorreo } from "@/features/emails/server";

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
        {
          error: "No se puede finalizar: hay documentos pendientes de revisión",
        },
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

    // ─────────────────────────────────────────────────────────────
    // LÓGICA PARA EMITIR ORDEN Y ENVIAR POR CORREO
    // ─────────────────────────────────────────────────────────────
    if (nuevoEstatus === "LIBERADO_POR_LIBERACIONES") {
      try {
        // Consultamos todos los campos reales de tus tablas unificados
        const datosOrdenRes = await db.query(
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
        i.es_persona_moral,
        i.razon_social_empresa,
        s.es_empresa,
        s.nombre_empresa,
        s.rfc_empresa,
        g.nombre as nombre_grua
      FROM v2_infracciones i
      LEFT JOIN v2_solicitudes_liberacion s ON s.infraccion_id = i.id
      left join v2_gruas g on g.id = i.grua_id 
      WHERE i.id = $1
      ORDER BY s.created_at DESC
      LIMIT 1
                    `,
          [infraccionId],
        );

        if (datosOrdenRes.rows.length > 0) {
          const dbData = datosOrdenRes.rows[0];

          // Determinar si es empresa (combinando ambas banderas por seguridad)
          const esEmpresa = dbData.es_persona_moral || dbData.es_empresa;

          // Regla de negocio: Nombre de la Empresa vs Nombre del Titular
          let nombreRecibe = "";
          if (esEmpresa) {
            nombreRecibe =
              dbData.razon_social_empresa ||
              dbData.nombre_empresa ||
              "EMPRESA NO REGISTRADA";
          } else {
            // Prioriza el titular de la liberación; si no existe, usa los datos del infractor original
            const tNombre =
              dbData.nombre_titular_liberacion || dbData.nombre_infractor || "";
            const tPaterno =
              dbData.appaterno_titular_liberacion ||
              dbData.apellido_paterno_infractor ||
              "";
            const tMaterno =
              dbData.apmaterno_titular_liberacion ||
              dbData.apellido_materno_infractor ||
              "";
            nombreRecibe = `${tNombre} ${tPaterno} ${tMaterno}`
              .trim()
              .replace(/\s+/g, " ");
          }

          // Construir el objeto estructurado para el generador de PDF
          const dataParaPDF = {
            id: dbData.id,
            motivoRetencion:
              dbData.motivo_retencion || "SIN MOTIVO ESPECIFICADO",
            estadoOrigen: dbData.estado || "QUERÉTARO",
            noSerie: dbData.no_carpeta_investigacion || "—",
            garantiaRetenida: dbData.tipo_garantia || "VEHICULO",
            grua: dbData.nombre_grua,
            noOficio: dbData.folio || "0000",
            rfc: esEmpresa,
            responsableFiscal: nombreRecibe,
            nombreTitularCompleto: nombreRecibe,
            empresaFiscal: esEmpresa ? nombreRecibe : "Infractor",
            marca: dbData.marca,
            tipoVehiculo: dbData.tipo_vehiculo,
            modelo: dbData.anio_vehiculo,
            color: dbData.color,
            placa: dbData.placa,
            noExterno: dbData.folio,
          };

          // Enviar notificación por correo electrónico
          try {
            const correoDestino =
              dbData.correo_titular_liberacion || "sin_correo@dominio.com";
            const nombreNotificacion = esEmpresa
              ? nombreRecibe
              : `${dbData.nombre_infractor} ${dbData.apellido_paterno_infractor}`.trim();

            console.log(correoDestino);
            console.log(nombreNotificacion);
            console.log(dataParaPDF);
            const pdfBuffer = await generarOrdenSalidaVehiculo({
              data: dataParaPDF,
            });

            console.log("Es buffer:", Buffer.isBuffer(pdfBuffer));
            console.log("Tamaño:", pdfBuffer.length);
            console.log(
              "Primeros bytes:",
              pdfBuffer.subarray(0, 20).toString(),
            );

            await enviarOrdenLiberacionCorreo({
              idInfraccion: dataParaPDF.id,
              correoInfractor: correoDestino,
              nombreInfractor: nombreNotificacion || "Ciudadano",
              folio: dbData.folio || "SIN FOLIO",
              pdfBuffer,
            });
            console.log("[MAIL][OK] Correo enviado exitosamente.");
          } catch (mailError) {
            console.error(
              "[MAIL][ERROR] No se pudo enviar el correo:",
              mailError,
            );
            // No bloqueamos el flujo principal si el servidor de correo falla
          }
        }
      } catch (pdfError) {
        console.error(
          "[ORDEN SALIDA][ERROR] Error en el proceso de generación de orden:",
          pdfError,
        );
      }
    }

    return NextResponse.json({
      message:
        nuevoEstatus === "LIBERADO_POR_LIBERACIONES"
          ? "Infracción liberada correctamente"
          : "Documentos rechazados, se notificará al ciudadano",
      estatus: nuevoEstatus,
    });
  } catch (error) {
    console.error("[LIBERACIONES][FINALIZAR REVISIÓN] Error interno:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
