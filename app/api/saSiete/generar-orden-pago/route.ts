import { NextRequest, NextResponse } from "next/server";
import { POOL_PG as pool } from "@/lib/db";
import { enviarCorreoInfraccion } from "@/features/emails/server";
import { Beaker } from "lucide-react";

const SA7_URL =
  "https://sanjuandelrio.sytes.net:3044/api/sasiete/qas/generar-orden-completa";

export async function POST(req: NextRequest) {
  try {
    console.log("entro");
    // =========================================
    // BODY QUE RECIBE TU ENDPOINT
    // =========================================

    const body = await req.json();
    console.log(body);
    const {
      infraccion_id,
      nombre_usuario,
      apellidos_usuario,
      concepto_id,
      folio,
      correoInfractor,
      descuentoAplicado,
      cantidad,
    } = body;

    console.log(body);
    // =========================================
    // VALIDACIONES
    // =========================================

    if (
      !infraccion_id ||
      !nombre_usuario ||
      !folio ||
      !apellidos_usuario ||
      !concepto_id ||
      !correoInfractor ||
      !descuentoAplicado
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "Faltan campos obligatorios",
        },
        { status: 400 },
      );
    }

    // =========================================
    // OBTENER TOKEN GUEST
    // =========================================

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://via-v2.vercel.app"
        : "http://localhost:3000";

    console.log(baseUrl);
    const responseTokenGuest = await fetch(`${baseUrl}/api/auth/token-guest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        codigo_invitacion: `INV-${new Date().getTime()}`,
        nombre_invitado: "SA7_SYSTEM",
      }),
    });
    console.log(responseTokenGuest);

    console.log("paso");

    if (!responseTokenGuest.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: "No se pudo obtener token guest",
        },
        { status: 500 },
      );
    }

    const dataTokenGuest = await responseTokenGuest.json();

    const tokenGuest = dataTokenGuest.data?.token;
    console.log(tokenGuest);

    if (!tokenGuest) {
      return NextResponse.json(
        {
          ok: false,
          message: "Token inválido",
        },
        { status: 500 },
      );
    }

    // =========================================
    // CONSTRUIR BODY PARA SA7
    // =========================================
    const CONCEPTO_PRUEBA = "31378";

    let descuento = 0;
    if (descuentoAplicado) {
      if (descuentoAplicado === "70") {
        descuento = 0.3;
      } else if (descuentoAplicado === "50") {
        descuento = 0.5;
      }

      if (cantidad) {
        descuento = cantidad;
      }

      console.log(descuento);
    }
    const payloadSA7 = {
      nombreUsuario: nombre_usuario,
      apellidosUsuario: apellidos_usuario,
      rfc: "",
      conceptosIds: [CONCEPTO_PRUEBA],

      cantidades: {
        [CONCEPTO_PRUEBA]: descuento,
      },

      referencias: {
        [CONCEPTO_PRUEBA]: [`${nombre_usuario} ${apellidos_usuario}`, ""],
      },

      id_usuario_general: "17336",
      tipo_tramite: "via_v2_cobro_infracciones_online",
      folio: folio,
    };

    console.log("Payload para SA7:", payloadSA7);

    // =========================================
    // GENERAR ORDEN EN SA7
    // =========================================

    const responseSA7 = await fetch(SA7_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenGuest}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payloadSA7),
    });

    console.log(responseSA7);
    // =========================================
    // LEER HEADERS IMPORTANTES
    // =========================================

    const orden_pago_id = responseSA7.headers.get("x-orden-pago-id");

    const estatus = responseSA7.headers.get("x-estatus");

    const url_pago = responseSA7.headers.get("x-url-pago");

    const url_guardado = responseSA7.headers.get("x-url-guardado");

    const folio_orden = responseSA7.headers.get("x-folio-orden");

    const fecha_vencimiento = responseSA7.headers.get("x-fecha-vencimiento");

    const total_pesos = responseSA7.headers.get("x-total-pesos");

    const total_umas = responseSA7.headers.get("x-total-umas");

    console.log(fecha_vencimiento);
    console.log(concepto_id);

    // =========================================
    // GUARDAR EN POSTGRESQL
    // =========================================

    await pool.query(
      `
      INSERT INTO v2_ordenes_pago_sa7 (
        infraccion_id,
        folio_infraccion,
        nombre_usuario,
        apellidos_usuario,
        concepto_id,

        orden_pago_id,
        estatus,
        url_pago,
        url_guardado,
        folio_orden,
        fecha_vencimiento,
        total_pesos,
        total_umas,

        request_payload
      )
      VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10,
        $11,$12,$13,$14
      )
      `,
      [
        infraccion_id,
        folio,
        nombre_usuario,
        apellidos_usuario,
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

    // =========================================
    // ENVIO DE CORREO
    // =========================================
    console.log(correoInfractor);

    if (infraccion_id) {
      await enviarCorreoInfraccion({
        idInfraccion: infraccion_id,
        correoInfractor: correoInfractor,
        nombreInfractor: nombre_usuario,
        folio: folio,
      });
    }
    // =========================================
    // RESPUESTA
    // =========================================

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
