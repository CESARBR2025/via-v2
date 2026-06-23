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
    // OBTENER DATOS PARA ORDEN DE PAGO
    // ─────────────────────────────────────────────────────────────
    let folio: string | null = null;
    let concepto_id: number | null = null;
    let descuento_aplicado: number | null = null;

    let nombre_usuario = "";
    let apellidos_usuario = "";
    let correo_infractor = "";

    if (nuevoEstatus === "PENDIENTE_PAGO") {
      const infraRes = await db.query(
        `
        SELECT
          i.folio,
          i.descuento_aplicado,
          i.fraccion_id,
          i.nombre_infractor,
          i.apellido_paterno_infractor,
          i.apellido_materno_infractor,
          i.nombre_titular_liberacion,
          i.appaterno_titular_liberacion,
          i.apmaterno_titular_liberacion,
          i.correo_titular_liberacion,
          i.correo_infractor
        FROM v2_infracciones i
        WHERE i.id = $1
        `,
        [infraccionId],
      );

      if (infraRes.rows.length > 0) {
        const row = infraRes.rows[0];
        folio = row.folio;
        descuento_aplicado = row.descuento_aplicado;

        nombre_usuario = (row.nombre_titular_liberacion || row.nombre_infractor || "").trim();
        apellidos_usuario = [
          row.appaterno_titular_liberacion || row.apellido_paterno_infractor || "",
          row.apmaterno_titular_liberacion || row.apellido_materno_infractor || "",
        ].filter(Boolean).join(" ").trim() || "SIN APELLIDO";
        correo_infractor = row.correo_titular_liberacion || row.correo_infractor || "";

        const conceptoRes = await db.query(
          `
          SELECT ccs.concept_id
          FROM v2_fracciones_ley fl
          JOIN v2_catalogo_conceptos_sa7 ccs ON ccs.clasificacion_type = fl.clasificacion
          WHERE fl.id = $1
          `,
          [row.fraccion_id],
        );
        concepto_id = conceptoRes.rows[0]?.concept_id || null;
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
      folio,
      concepto_id,
      descuento_aplicado,
      nombre_usuario,
      apellidos_usuario,
      correo_infractor,
    });
  } catch (error) {
    console.error("[LIBERACIONES][FINALIZAR REVISIÓN] Error interno:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
