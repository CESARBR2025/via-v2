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

    const nuevoEstatusDep = tieneRechazados
      ? "MESA_DE_CONTROL_RECHAZADA"
      : "PENDIENTE_PAGO_LIBERACION";

    const nuevoEstatus = tieneRechazados
      ? "REGISTRADA"
      : "PENDIENTE_PAGO";

    // ─────────────────────────────────────────────────────────────
    // GENERAR ORDEN DE PAGO SA7 (solo si todos aprobados)
    // ─────────────────────────────────────────────────────────────
    if (nuevoEstatus === "PENDIENTE_PAGO") {
      try {
        const datosSA7Res = await db.query(
          `
            SELECT
              i.folio,
              i.nombre_infractor,
              i.apellido_paterno_infractor,
              i.apellido_materno_infractor,
              i.nombre_titular_liberacion,
              i.appaterno_titular_liberacion,
              i.apmaterno_titular_liberacion,
              i.correo_titular_liberacion,
              i.descuento_aplicado,
              i.fraccion_id
            FROM v2_infracciones i
            WHERE i.id = $1
          `,
          [infraccionId],
        );

        if (datosSA7Res.rows.length > 0) {
          const dbData = datosSA7Res.rows[0];

          const nombreUsuario = (dbData.nombre_titular_liberacion || dbData.nombre_infractor || "").trim();
          const apellidosUsuario = [
            dbData.appaterno_titular_liberacion || dbData.apellido_paterno_infractor || "",
            dbData.apmaterno_titular_liberacion || dbData.apellido_materno_infractor || "",
          ].filter(Boolean).join(" ").trim() || "SIN APELLIDO";

          const baseUrl = process.env.NODE_ENV === "production"
            ? "https://via-v2.vercel.app"
            : "http://localhost:3000";

          const tokenRes = await fetch(`${baseUrl}/api/auth/token-guest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              codigo_invitacion: `INV-${new Date().getTime()}`,
              nombre_invitado: "SA7_SYSTEM",
            }),
          });

          if (tokenRes.ok) {
            const tokenData = await tokenRes.json();
            const tokenGuest = tokenData.data?.token;

            if (tokenGuest) {
              const CONCEPTO_PRUEBA = "31378";
              const descuentoAplicado = Number(dbData.descuento_aplicado) || 0;
              let descuento = 0;
              if (descuentoAplicado === 70) {
                descuento = 0.3;
              } else if (descuentoAplicado === 50) {
                descuento = 0.5;
              } else {
                descuento = 1;
              }

              const payloadSA7 = {
                nombreUsuario,
                apellidosUsuario,
                rfc: "",
                conceptosIds: [CONCEPTO_PRUEBA],
                cantidades: { [CONCEPTO_PRUEBA]: descuento },
                referencias: { [CONCEPTO_PRUEBA]: [`${nombreUsuario} ${apellidosUsuario}`, ""] },
                id_usuario_general: "17336",
                tipo_tramite: "via_v2_cobro_infracciones_online",
                folio: dbData.folio,
              };

              const SA7_URL = "https://sanjuandelrio.sytes.net:3044/api/sasiete/qas/generar-orden-completa";

              const sa7Res = await fetch(SA7_URL, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${tokenGuest}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payloadSA7),
              });

              const orden_pago_id = sa7Res.headers.get("x-orden-pago-id");
              const estatus = sa7Res.headers.get("x-estatus");
              const url_pago = sa7Res.headers.get("x-url-pago");
              const url_guardado = sa7Res.headers.get("x-url-guardado");
              const folio_orden = sa7Res.headers.get("x-folio-orden");
              const fecha_vencimiento = sa7Res.headers.get("x-fecha-vencimiento");
              const total_pesos = sa7Res.headers.get("x-total-pesos");
              const total_umas = sa7Res.headers.get("x-total-umas");

              await db.query(
                `
                INSERT INTO v2_ordenes_pago_sa7 (
                  infraccion_id, folio_infraccion, nombre_usuario, apellidos_usuario, concepto_id,
                  orden_pago_id, estatus, url_pago, url_guardado, folio_orden,
                  fecha_vencimiento, total_pesos, total_umas, request_payload
                ) VALUES (
                  $1,$2,$3,$4,$5,
                  $6,$7,$8,$9,$10,
                  $11,$12,$13,$14
                )
                `,
                [
                  infraccionId, dbData.folio, nombreUsuario, apellidosUsuario, CONCEPTO_PRUEBA,
                  orden_pago_id, estatus, url_pago, url_guardado, folio_orden,
                  fecha_vencimiento || null, total_pesos || 0, total_umas || 0,
                  JSON.stringify(payloadSA7),
                ],
              );
            }
          }
        }
      } catch (orderError) {
        console.error("[SA7][ERROR] No se pudo generar la orden de pago:", orderError);
      }
    }

    // Actualizar estatus en la infracción
    await db.query(
      `
            UPDATE v2_infracciones
            SET estatus = $1, estatus_dependencia = $2, updated_at = NOW()
            WHERE id = $3
            `,
      [nuevoEstatus, nuevoEstatusDep, infraccionId],
    );

    // También actualizar estatus de la solicitud
    await db.query(
      `
            UPDATE v2_solicitudes_liberacion
            SET estatus = $1, updated_at = NOW()
            WHERE id = $2
            `,
      [nuevoEstatusDep, solicitudId],
    );

    // ─────────────────────────────────────────────────────────────
    // LÓGICA PARA EMITIR ORDEN DE SALIDA Y ENVIAR POR CORREO
    // ─────────────────────────────────────────────────────────────
    if (nuevoEstatus === "PENDIENTE_PAGO") {
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
        s.es_empresa,
        s.nombre_empresa,
        s.rfc_empresa,
        s.nombre_resp_fiscal,
        s.appaterno_resp_fiscal,
        s.apmaterno_resp_fiscal,
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

          // Prioriza el titular de la liberación; si no existe, usa los datos del infractor original
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
          ("");

          console.log(nombreRecibe);

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
            empresaFiscal: dbData.nombre_empresa,
            nombreTitular: nombreRecibe,
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
        nuevoEstatus === "PENDIENTE_PAGO"
          ? "Documentos aprobados, pendiente de pago"
          : "Documentos rechazados, se notificará al ciudadano",
      estatus: nuevoEstatus,
      estatusDependencia: nuevoEstatusDep,
    });
  } catch (error) {
    console.error("[LIBERACIONES][FINALIZAR REVISIÓN] Error interno:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
