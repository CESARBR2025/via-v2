import { NextRequest, NextResponse } from "next/server";
import { POOL_PG as pool } from "@/lib/db";

const SA7_URL =
  "https://sanjuandelrio.sytes.net:3044/api/sasiete/qas/generar-orden-completa";

export async function POST(req: NextRequest) {
  try {
    console.log("entro");
    // =====================================================
    // BODY
    // =====================================================

    const body = await req.json();

    const {
      infraccion_id,
      nombre_usuario,
      apellidos_usuario,
      concepto_id,
      folio,
    } = body;

    console.log(infraccion_id);

    // =====================================================
    // VALIDACIONES
    // =====================================================

    if (
      !infraccion_id ||
      !nombre_usuario ||
      !apellidos_usuario ||
      !folio ||
      !concepto_id
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "Faltan campos obligatorios",
        },
        { status: 400 },
      );
    }

    console.log("paso");
    // =====================================================
    // TOKEN GUEST
    // =====================================================

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const responseTokenGuest = await fetch(`${baseUrl}/api/auth/token-guest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        codigo_invitacion: `INV-${Date.now()}`,
        nombre_invitado: "SA7_SYSTEM",
      }),
    });

    if (!responseTokenGuest.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: "No se pudo obtener token",
        },
        { status: 500 },
      );
    }

    const dataTokenGuest = await responseTokenGuest.json();

    const tokenGuest = dataTokenGuest.data?.token;

    if (!tokenGuest) {
      return NextResponse.json(
        {
          ok: false,
          message: "Token inválido",
        },
        { status: 500 },
      );
    }

    // =====================================================
    // PAYLOAD SA7
    // =====================================================

    const payloadSA7 = {
      nombreUsuario: nombre_usuario,

      apellidosUsuario: apellidos_usuario,

      rfc: "",

      conceptosIds: [concepto_id],

      cantidades: {
        [concepto_id]: 1,
      },

      referencias: {
        [concepto_id]: [`${nombre_usuario} ${apellidos_usuario}`, ""],
      },

      id_usuario_general: "17336",

      tipo_tramite: "via_v2_cobro_infracciones_online",

      folio,
    };

    console.log(payloadSA7);
    // =====================================================
    // GENERAR NUEVA ORDEN SA7
    // =====================================================

    const responseSA7 = await fetch(SA7_URL, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${tokenGuest}`,

        "Content-Type": "application/json",
      },

      body: JSON.stringify(payloadSA7),
    });

    // =====================================================
    // HEADERS NUEVOS
    // =====================================================

    const orden_pago_id = responseSA7.headers.get("x-orden-pago-id");

    const estatus = responseSA7.headers.get("x-estatus");

    const url_pago = responseSA7.headers.get("x-url-pago");

    const url_guardado = responseSA7.headers.get("x-url-guardado");

    const folio_orden = responseSA7.headers.get("x-folio-orden");

    const fecha_vencimiento = responseSA7.headers.get("x-fecha-vencimiento");

    const total_pesos = responseSA7.headers.get("x-total-pesos");

    const total_umas = responseSA7.headers.get("x-total-umas");

    // =====================================================
    // UPDATE EN BD
    // =====================================================

    await pool.query(
      `
      UPDATE v2_ordenes_pago_sa7
      SET
        nombre_usuario = $1,
        apellidos_usuario = $2,
        concepto_id = $3,

        orden_pago_id = $4,
        estatus = $5,
        url_pago = $6,
        url_guardado = $7,
        folio_orden = $8,
        fecha_vencimiento = $9,
        total_pesos = $10,
        total_umas = $11,

        request_payload = $12,
        updated_at = NOW()

      WHERE infraccion_id = $13
      `,
      [
        nombre_usuario,
        apellidos_usuario,
        concepto_id,

        orden_pago_id,
        estatus,
        url_pago,
        url_guardado,
        folio_orden,

        fecha_vencimiento || null,

        total_pesos || 0,
        total_umas || 0,

        JSON.stringify(payloadSA7),

        infraccion_id,
      ],
    );

    // =====================================================
    // RESPUESTA
    // =====================================================

    return NextResponse.json({
      ok: true,

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
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error interno del servidor",
      },
      { status: 500 },
    );
  }
}
