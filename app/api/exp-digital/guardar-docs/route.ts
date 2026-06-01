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

  form.append(
    "ruta_personalizada",
    `${carpeta}/${anio}/${mes}/${idInfraccion}`,
  );

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

    const idInfraccion = formData.get("idInfraccion") as string;

    const archivoInapam = formData.get("archivoInapam") as File | null;

    const archivoIne = formData.get("archivoIne") as File | null;

    const archivoTarjetaCirculacion = formData.get(
      "archivoTarjetaCirculacion",
    ) as File | null;

    if (!idInfraccion) {
      return NextResponse.json(
        {
          message: "idInfraccion es requerido",
        },
        {
          status: 400,
        },
      );
    }

    const tieneDocumentos =
      archivoIne || archivoInapam || archivoTarjetaCirculacion;

    if (!tieneDocumentos) {
      return NextResponse.json(
        {
          message: "No se enviaron documentos",
        },
        {
          status: 400,
        },
      );
    }

    validarArchivo(archivoInapam);
    validarArchivo(archivoIne);
    validarArchivo(archivoTarjetaCirculacion);

    const token = await getExpedienteToken();

    let urlInapam: string | null = null;
    let urlIne: string | null = null;
    let urlTarjetaCirculacion: string | null = null;

    if (archivoInapam) {
      urlInapam = await subirArchivo(
        archivoInapam,
        "inapam",
        idInfraccion,
        token,
      );
    }

    if (archivoIne) {
      urlIne = await subirArchivo(archivoIne, "ine", idInfraccion, token);
    }

    if (archivoTarjetaCirculacion) {
      urlTarjetaCirculacion = await subirArchivo(
        archivoTarjetaCirculacion,
        "tarjeta_circulacion",
        idInfraccion,
        token,
      );
    }

    await client.query("BEGIN");

    await client.query(
      `
      UPDATE public.v2_infracciones
      SET
        url_inapam = COALESCE($2, url_inapam),
        url_ine = COALESCE($3, url_ine),
        url_tarjeta_circulacion = COALESCE($4, url_tarjeta_circulacion),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [idInfraccion, urlInapam, urlIne, urlTarjetaCirculacion],
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        message: "Documentos guardados correctamente",
        data: {
          urlInapam,
          urlIne,
          urlTarjetaCirculacion,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("[GUARDADO DOCUMENTOS]", error);

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Error interno",
      },
      {
        status: 500,
      },
    );
  } finally {
    client.release();
  }
}
