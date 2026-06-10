import { NextResponse } from "next/server";
import { POOL_PG as db } from "@/lib/db";
import { generarOrdenSalidaVehiculo } from "@/lib/ordenSalida/generarOrdenSalida";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ infraccionId: string }> },
) {
  try {
    const { infraccionId } = await params;
    console.log(infraccionId);

    if (!infraccionId) {
      return NextResponse.json(
        { error: "infraccionId es requerido" },
        { status: 400 },
      );
    }

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

        s.es_empresa,
        s.nombre_empresa,
        s.rfc_empresa,
        g.nombre as nombre_grua,

        s.nombre_resp_fiscal,
        s.appaterno_resp_fiscal,
        s.apmaterno_resp_fiscal
      FROM v2_infracciones i
      LEFT JOIN v2_solicitudes_liberacion s ON s.infraccion_id = i.id
      left join v2_gruas g on g.id = i.grua_id 
      WHERE i.id = $1
      ORDER BY s.created_at DESC
      LIMIT 1

      `,
      [infraccionId],
    );

    if (datosOrdenRes.rows.length === 0) {
      return NextResponse.json(
        { error: "No se encontró la infracción" },
        { status: 404 },
      );
    }

    const dbData = datosOrdenRes.rows[0];
    const esEmpresa = dbData.es_persona_moral || dbData.es_empresa;

    let nombreRecibe = "";

    const tNombre = !dbData.rfc
      ? dbData.nombre_titular_liberacion
      : dbData.nombre_resp_fiscal;

    console.log(tNombre);
    const tPaterno = !dbData.rfc
      ? dbData.appaterno_titular_liberacion
      : dbData.appaterno_resp_fiscal;

    console.log(tPaterno);
    const tMaterno = !dbData.rfc
      ? dbData.apmaterno_titular_liberacion
      : dbData.apmaterno_resp_fiscal;

    console.log(tMaterno);
    nombreRecibe = `${tNombre} ${tPaterno} ${tMaterno}`
      .trim()
      .replace(/\s+/g, " ");

    console.log(nombreRecibe);

    const dataParaPDF = {
      id: dbData.id,
      motivoRetencion: dbData.motivo_retencion || "SIN MOTIVO ESPECIFICADO",
      estadoOrigen: dbData.estado || "QUERÉTARO",
      noSerie: dbData.no_carpeta_investigacion || "—",
      garantiaRetenida: dbData.tipo_garantia || "VEHICULO",
      grua: dbData.nombre_grua,
      noOficio: dbData.folio || "0000",
      rfc: esEmpresa,
      responsableFiscal: nombreRecibe,
      nombreTitularCompleto: nombreRecibe,
      empresaFiscal: esEmpresa ? dbData.nombre_empresa : "Infractor",
      marca: dbData.marca,
      tipoVehiculo: dbData.tipo_vehiculo,
      modelo: dbData.anio_vehiculo,
      color: dbData.color,
      placa: dbData.placa,
      noExterno: dbData.folio,
    };
    console.log(dataParaPDF);

    const pdfBuffer = await generarOrdenSalidaVehiculo({
      data: dataParaPDF,
    });

    const folio = dbData.folio?.replace(/[^a-zA-Z0-9_-]/g, "_") || infraccionId;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="orden_salida_${folio}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[DESCARGAR ORDEN] Error interno:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
