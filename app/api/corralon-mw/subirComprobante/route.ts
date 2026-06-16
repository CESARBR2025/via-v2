import { NextRequest, NextResponse } from "next/server";
import { POOL_PG } from "@/lib/db";
import { getExpedienteToken } from "@/lib/expediente-digital/expediente";

async function subirArchivo(
  archivo: File,
  carpeta: string,
  idInfraccion: string,
  token: string,
): Promise<string> {
  const now = new Date();
  const anio = now.getFullYear().toString();
  const mes = String(now.getMonth() + 1).padStart(2, "0");

  const form = new FormData();
  form.append("file", archivo);
  form.append("ruta_personalizada", `${anio}/${mes}/${idInfraccion}`);
  form.append("sistema", process.env.EXPEDIENTE_SISTEMA ?? "sspm");

  const response = await fetch(
    `${process.env.EXPEDIENTE_HOST}/api/upload-custom`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    },
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("[EXPEDIENTE DIGITAL] Error subiendo comprobante:", error);
    throw new Error("Error al subir el comprobante");
  }

  const { data } = await response.json();
  return data.ruta_relativa;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const infraccionId = formData.get("infraccionId") as string | null;
    const archivo = formData.get("archivo") as File | null;

    if (!infraccionId) {
      return NextResponse.json(
        { message: "infraccionId es requerido" },
        { status: 400 },
      );
    }

    if (!archivo) {
      return NextResponse.json(
        { message: "archivo es requerido" },
        { status: 400 },
      );
    }

    const esValido =
      archivo.type.startsWith("image/") || archivo.type === "application/pdf";
    if (!esValido) {
      return NextResponse.json(
        { message: "Tipo de archivo no permitido. Solo JPG, PNG o PDF" },
        { status: 400 },
      );
    }

    const token = await getExpedienteToken();
    const url = await subirArchivo(
      archivo,
      "comprobante_pago",
      infraccionId,
      token,
    );

    const client = await POOL_PG.connect();
    try {
      await client.query("BEGIN");

      const { rows } = await client.query(
        `SELECT estatus_dependencia FROM v2_infracciones WHERE id = $1`,
        [infraccionId],
      );
      const estatusActual = rows[0]?.estatus_dependencia ?? "";
      const sufijo = estatusActual.replace("LIBERADA_POR_", "");
      const estatusFinal = `FINALIZADA_${sufijo}`;
      console.log(estatusFinal);

      await client.query(
        `
        UPDATE v2_infracciones
        SET
          estatus_dependencia = $3,
          estatus = 'FINALIZADA',
          url_oficio_pago_corralon = $2,
          updated_at = NOW()
        WHERE id = $1
        `,
        [infraccionId, url, estatusFinal],
      );

      await client.query("COMMIT");

      return NextResponse.json(
        {
          message: "Comprobante guardado correctamente",
          url,
        },
        { status: 200 },
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("[CORRALON-MW][SUBIR COMPROBANTE]", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 },
    );
  }
}
