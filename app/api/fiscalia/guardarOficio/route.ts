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

    console.error(`[EXPEDIENTE DIGITAL] Error subiendo ${carpeta}:`, error);

    throw new Error(`Error al subir ${carpeta}`);
  }

  const { data } = await response.json();

  return data.ruta_relativa;
}

function validarArchivo(file: File | null) {
  if (!file) return;

  const esValido =
    file.type.startsWith("image/") || file.type === "application/pdf";

  if (!esValido) {
    throw new Error(`Tipo de archivo no permitido: ${file.name}`);
  }
}

export async function POST(req: NextRequest) {
  const client = await POOL_PG.connect();

  try {
    const formData = await req.formData();

    const folio = formData.get("folio") as string;
    const numero_oficio = formData.get("numero_oficio") as string;
    const no_carpeta_investigacion = formData.get("no_carpeta_investigacion") as string;
    const archivo_oficio = formData.get("archivoIne") as File | null;

    // Datos del titular para liberación
    const nombre_titular_liberacion = formData.get("nombre_titular_liberacion") as string;
    const appaterno_titular_liberacion = formData.get("appaterno_titular_liberacion") as string;
    const apmaterno_titular_liberacion = formData.get("apmaterno_titular_liberacion") as string;
    const correo_titular_liberacion = formData.get("correo_titular_liberacion") as string;
    const curp_titular_liberacion = formData.get("curp_titular_liberacion") as string;

    if (!folio) {
      return NextResponse.json(
        {
          message: "Folio de infracción es requerido",
        },
        { status: 400 },
      );
    }

    const tieneDocumentos = numero_oficio || archivo_oficio;

    if (!tieneDocumentos) {
      return NextResponse.json(
        {
          message: "No se enviaron documentos",
        },
        { status: 400 },
      );
    }

    validarArchivo(archivo_oficio);

    const token = await getExpedienteToken();

    let url_oficio_fiscalia: string | null = null;

    if (archivo_oficio) {
      url_oficio_fiscalia = await subirArchivo(
        archivo_oficio,
        "oficio_fiscalia_liberacion",
        folio,
        token,
      );
    }

    await client.query("BEGIN");

    await client.query(
      `
      UPDATE public.v2_infracciones
      SET
        no_oficio_fiscalia = $2,
        url_oficio_fiscalia = COALESCE($3, url_oficio_fiscalia),
        no_carpeta_investigacion = COALESCE($4, no_carpeta_investigacion),
        estatus_dependencia = 'LIBERADO_POR_FISCALIA',
        nombre_titular_liberacion = COALESCE($5, nombre_titular_liberacion),
        appaterno_titular_liberacion = COALESCE($6, appaterno_titular_liberacion),
        apmaterno_titular_liberacion = COALESCE($7, apmaterno_titular_liberacion),
        correo_titular_liberacion = COALESCE($8, correo_titular_liberacion),
        curp_titular_liberacion = COALESCE($9, curp_titular_liberacion),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [
        folio,
        numero_oficio,
        url_oficio_fiscalia,
        no_carpeta_investigacion || null,
        nombre_titular_liberacion || null,
        appaterno_titular_liberacion || null,
        apmaterno_titular_liberacion || null,
        correo_titular_liberacion || null,
        curp_titular_liberacion || null,
      ],
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        message: "Documentos guardados correctamente",
        data: {
          url_oficio_fiscalia,
          numero_oficio,
          no_carpeta_investigacion,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("[GUARDADO DOCUMENTOS]", error);

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
