import { NextResponse } from "next/server";
import { POOL_PG as db } from "@/lib/db";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      nombre_infractor,
      apellido_paterno_infractor,
      apellido_materno_infractor,
      correo_infractor,
      es_titular,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'El campo "id" es requerido.' },
        { status: 400 },
      );
    }

    const query = `
      UPDATE public.v2_infracciones
      SET nombre_infractor = COALESCE($2, nombre_infractor),
          apellido_paterno_infractor = COALESCE($3, apellido_paterno_infractor),
          apellido_materno_infractor = COALESCE($4, apellido_materno_infractor),
          correo_infractor = COALESCE($5, correo_infractor),
          es_titular = $6,
          nombre_titular_liberacion = CASE WHEN $6 = true THEN $2 ELSE 'NO_DATA' END,
          appaterno_titular_liberacion = CASE WHEN $6 = true THEN $3 ELSE 'NO_DATA' END,
          apmaterno_titular_liberacion = CASE WHEN $6 = true THEN $4 ELSE 'NO_DATA' END,
          correo_titular_liberacion = CASE WHEN $6 = true THEN $5 ELSE 'NO_DATA' END,
          estatus = 'REGISTRADA',
          estatus_dependencia = 'MESA_DE_CONTROL_PENDIENTE_DOCS',
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, folio;
    `;

    const resultado = await db.query(query, [
      id,
      nombre_infractor || null,
      apellido_paterno_infractor || null,
      apellido_materno_infractor || null,
      correo_infractor || null,
      es_titular,
    ]);

    if (resultado.rows.length === 0) {
      return NextResponse.json(
        { error: "No se encontró la infracción." },
        { status: 404 },
      );
    }

    const infraccion = resultado.rows[0];
    const nombreUsuario =
      `${nombre_infractor || ""} ${apellido_paterno_infractor || ""}`.trim();
    const correoDestino = correo_infractor || "";

    if (correoDestino) {
      const { enviarCorreoCapturaInfractor } =
        await import("@/features/emails/server");
      enviarCorreoCapturaInfractor({
        idInfraccion: infraccion.id,
        correoInfractor: correoDestino,
        nombreInfractor: nombreUsuario,
        folio: infraccion.folio,
      }).catch((e) =>
        console.error("Error enviando correo captura infractor:", e),
      );
    }

    return NextResponse.json(
      { message: "Datos del infractor guardados.", infraccion },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al guardar datos del infractor:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
