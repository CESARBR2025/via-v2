import { NextResponse } from "next/server";
import { POOL_PG as db } from "@/lib/db";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'El campo "id" es requerido.' },
        { status: 400 },
      );
    }

    const query = `
      UPDATE public.v2_infracciones
      SET estatus_dependencia = 'EN_PROCESO_LIBERACIONES',
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, folio, estatus_dependencia;
    `;

    const resultado = await db.query(query, [id]);

    if (resultado.rows.length === 0) {
      return NextResponse.json(
        { error: "No se encontró la infracción con el ID proporcionado." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Estatus actualizado a EN_PROCESO_LIBERACIONES correctamente.",
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
