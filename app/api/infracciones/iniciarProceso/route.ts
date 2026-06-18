import { NextResponse } from "next/server";
import { POOL_PG as db } from "@/lib/db";

const SA7_URL =
  "https://sanjuandelrio.sytes.net:3044/api/sasiete/qas/generar-orden-completa";
const CONCEPTO_PRUEBA = "31378";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      es_titular,
      nombre_titular,
      appaterno_titular,
      apmaterno_titular,
      curp_titular,
      correo_titular,
      nombre_infractor,
      appaterno_infractor,
      apmaterno_infractor,
      curp_infractor,
      correo_infractor,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'El campo "id" es requerido.' },
        { status: 400 },
      );
    }

    // 1. Save titular/infractor data
    const updateQuery = `
      UPDATE public.v2_infracciones
      SET es_titular = $2,
          nombre_titular_liberacion = $3,
          appaterno_titular_liberacion = $4,
          apmaterno_titular_liberacion = $5,
          curp_titular_liberacion = $6,
          correo_titular_liberacion = $7,
          nombre_infractor = COALESCE(NULLIF($8, ''), nombre_infractor),
          apellido_paterno_infractor = COALESCE(NULLIF($9, ''), apellido_paterno_infractor),
          apellido_materno_infractor = COALESCE(NULLIF($10, ''), apellido_materno_infractor),
          curp_infractor = COALESCE(NULLIF($11, ''), curp_infractor),
          correo_infractor = COALESCE(NULLIF($12, ''), correo_infractor),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, folio, descuento_aplicado, monto_total, nombre_infractor,
                apellido_paterno_infractor, apellido_materno_infractor, correo_infractor,
                fecha_limite_descuento;
    `;

    const updateResult = await db.query(updateQuery, [
      id,
      es_titular ?? null,
      nombre_titular || null,
      appaterno_titular || null,
      apmaterno_titular || null,
      curp_titular || null,
      correo_titular || null,
      nombre_infractor || null,
      appaterno_infractor || null,
      apmaterno_infractor || null,
      curp_infractor || null,
      correo_infractor || null,
    ]);

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: "No se encontró la infracción con el ID proporcionado." },
        { status: 404 },
      );
    }

    const infraccion = updateResult.rows[0];

    // 2. Query concepto_id from fraccion clasificacion
    const conceptoResult = await db.query(
      `
      SELECT ccs.concept_id
      FROM v2_infracciones i
      JOIN v2_fracciones_ley fl ON i.fraccion_id = fl.id
      JOIN v2_catalogo_conceptos_sa7 ccs ON ccs.clasificacion_type = fl.clasificacion
      WHERE i.id = $1
    `,
      [id],
    );

    const concepto_id = conceptoResult.rows[0]?.concept_id;

    // 3. Generate SA7 order
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

    if (!tokenRes.ok) {
      return NextResponse.json(
        { error: "No se pudo obtener token guest para generar orden" },
        { status: 500 },
      );
    }

    const tokenData = await tokenRes.json();
    const tokenGuest = tokenData.data?.token;

    if (!tokenGuest) {
      return NextResponse.json(
        { error: "Token guest inválido" },
        { status: 500 },
      );
    }

    const nombreUsuario = (
      infraccion.nombre_infractor ||
      nombre_titular ||
      ""
    ).trim();
    const apellidosUsuario =
      [
        infraccion.apellido_paterno_infractor || appaterno_titular || "",
        infraccion.apellido_materno_infractor || apmaterno_titular || "",
      ]
        .filter(Boolean)
        .join(" ")
        .trim() || "SIN APELLIDO";

    const descuentoAplicado = Number(infraccion.descuento_aplicado) || 0;
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
      conceptosIds: [concepto_id],
      cantidades: { [concepto_id]: descuento },
      referencias: {
        [concepto_id]: [`${nombreUsuario} ${apellidosUsuario}`, ""],
      },
      id_usuario_general: "17336",
      tipo_tramite: "via_v2_cobro_infracciones_online",
      folio: infraccion.folio,
    };

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

    // 4. Insert order into DB
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
        id,
        infraccion.folio,
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

    // 5. Send email notification
    const { enviarCorreoInfraccion } = await import("@/features/emails/server");
    const correoDestino = infraccion.correo_infractor || correo_titular || "";
    if (correoDestino) {
      await enviarCorreoInfraccion({
        idInfraccion: id,
        correoInfractor: correoDestino,
        nombreInfractor: nombreUsuario,
        folio: infraccion.folio,
      }).catch((e) => console.error("Error enviando correo:", e));
    }

    // 6. Update estatus and estatus_dependencia
    await db.query(
      `
      UPDATE public.v2_infracciones
      SET estatus = 'PENDIENTE_PAGO',
          estatus_dependencia = 'PENDIENTE_PAGO_INFRACCION',
          updated_at = NOW()
      WHERE id = $1
    `,
      [id],
    );

    return NextResponse.json(
      {
        message:
          "Orden generada y estatus actualizado a PENDIENTE_PAGO_INFRACCION.",
        data: {
          orden_pago_id,
          estatus,
          url_pago,
          url_guardado,
          folio_orden,
          fecha_vencimiento,
          total_pesos,
          total_umas,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al procesar infracción:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
