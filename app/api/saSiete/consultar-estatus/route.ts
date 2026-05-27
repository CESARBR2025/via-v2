import { NextRequest, NextResponse } from "next/server";

const SOAP_URL =
  "http://dcsazurehost.eastus.cloudapp.azure.com:8085/IngresoWebService.asmx";

export async function POST(req: NextRequest) {
  try {
    console.log("entro a consultar estatus sa7");
    const body = await req.json();

    const { ordenPagoId } = body;
    console.log(ordenPagoId);

    if (!ordenPagoId) {
      return NextResponse.json(
        {
          ok: false,
          message: "ordenPagoId es requerido",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // JSON INTERNO
    // =====================================================

    const datosOrden = JSON.stringify({
      OrdenPagoID: ordenPagoId,
      UsuarioID: process.env.KEY_USER_VALIDATE_STATUS,
      PWD: process.env.KEY_PD_VALIDATE_STATUS,
    });

    // =====================================================
    // SOAP XML
    // =====================================================

    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                 xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <estatus_pago xmlns="http://dcsis.com.mx/">
      <usuarioID>SUPERVISOR</usuarioID>
      <password>SUPERVISOR</password>
      <datosOrden>${datosOrden}</datosOrden>
    </estatus_pago>
  </soap12:Body>
</soap12:Envelope>`;

    // =====================================================
    // REQUEST SOAP
    // =====================================================

    const response = await fetch(SOAP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/soap+xml; charset=utf-8",
      },
      body: soapBody,
      cache: "no-store",
    });

    const rawXml = await response.text();

    // =====================================================
    // EXTRAER JSON DEL XML
    // =====================================================

    const match = rawXml.match(
      /<estatus_pagoResult>(.*?)<\/estatus_pagoResult>/,
    );

    if (!match) {
      return NextResponse.json(
        {
          ok: false,
          message: "No se pudo obtener estatus_pagoResult",
        },
        {
          status: 500,
        },
      );
    }

    const jsonString = match[1];

    // =====================================================
    // PARSEAR JSON
    // =====================================================

    const resultado = JSON.parse(jsonString);

    const estatus = resultado.Estatus;
    console.log("ESTATUS SA7:", estatus);

    // =====================================================
    // NORMALIZAR RESPUESTA
    // =====================================================

    return NextResponse.json({
      ok: true,

      ordenPagoId,

      estatus,

      pagado: estatus === "P",

      pendiente: estatus === "I",

      mensaje: resultado.MensajeError,

      pdfCobro: resultado.PDFCobro || null,
    });
  } catch (error) {
    console.error("ERROR CONSULTANDO ESTATUS SA7:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error consultando estatus",
      },
      {
        status: 500,
      },
    );
  }
}
