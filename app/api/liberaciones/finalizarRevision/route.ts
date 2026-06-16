import { NextResponse } from "next/server";
import { POOL_PG as db } from "@/lib/db";

// o ejecutada mediante un servicio que soporte Node.js si usa jsPDF en backend.

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

    const nuevoEstatus = tieneRechazados ? "REGISTRADA" : "PENDIENTE_PAGO";

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

          const nombreUsuario = (
            dbData.nombre_titular_liberacion ||
            dbData.nombre_infractor ||
            ""
          ).trim();
          const apellidosUsuario =
            [
              dbData.appaterno_titular_liberacion ||
                dbData.apellido_paterno_infractor ||
                "",
              dbData.apmaterno_titular_liberacion ||
                dbData.apellido_materno_infractor ||
                "",
            ]
              .filter(Boolean)
              .join(" ")
              .trim() || "SIN APELLIDO";

          const baseUrl =
            process.env.NODE_ENV === "production"
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
                referencias: {
                  [CONCEPTO_PRUEBA]: [
                    `${nombreUsuario} ${apellidosUsuario}`,
                    "",
                  ],
                },
                id_usuario_general: "17336",
                tipo_tramite: "via_v2_cobro_infracciones_online",
                folio: dbData.folio,
              };

              const SA7_URL =
                "https://sanjuandelrio.sytes.net:3044/api/sasiete/qas/generar-orden-completa";

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
              const fecha_vencimiento = sa7Res.headers.get(
                "x-fecha-vencimiento",
              );
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
                  infraccionId,
                  dbData.folio,
                  nombreUsuario,
                  apellidosUsuario,
                  CONCEPTO_PRUEBA,
                  orden_pago_id,
                  estatus,
                  url_pago,
                  url_guardado,
                  folio_orden,
                  fecha_vencimiento || null,
                  total_pesos || 0,
                  total_umas || 0,
                  JSON.stringify(payloadSA7),
                ],
              );
            }
          }
        }
      } catch (orderError) {
        console.error(
          "[SA7][ERROR] No se pudo generar la orden de pago:",
          orderError,
        );
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
