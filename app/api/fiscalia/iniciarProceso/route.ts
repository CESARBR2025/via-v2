import { NextResponse } from "next/server";
// Imagina que aquí importas tu cliente de base de datos (pg, prisma, Kysely, etc.)
import { POOL_PG as db } from "@/lib/db";

export async function PATCH(request: Request) {
  try {
    // 1. Extraemos el id que mandas desde el cliente
    const body = await request.json();
    const { id } = body;

    // Validación rápida por si acaso
    if (!id) {
      return NextResponse.json(
        { error: 'El campo "id" es requerido.' },
        { status: 400 },
      );
    }

    // 2. Ejecutamos la actualización directa en la tabla
    // Nota: El estatus se pasa como string 'EN_REVISION' directamente
    const query = `
      UPDATE public.v2_infracciones
      SET estatus_dependencia = 'EN_REVISION',
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, folio, estatus_dependencia;
    `;

    // Dependiendo de tu librería de DB, se vería algo así:
    const resultado = await db.query(query, [id]);

    // Validamos si la infracción realmente existía
    if (resultado.rows.length === 0) {
      return NextResponse.json(
        { error: "No se encontró la infracción con el ID proporcionado." },
        { status: 404 },
      );
    }

    // 3. Respondemos que todo salió bien con el registro modificado
    return NextResponse.json(
      {
        message: "Estatus actualizado a EN_REVISION correctamente.",
        infraccion: resultado.rows[0],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al actualizar la infracción:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
