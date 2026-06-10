import { NextResponse } from "next/server";
import { POOL_PG as db } from "@/lib/db";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { documentoId, accion, observaciones } = body;

    if (!documentoId) {
      return NextResponse.json(
        { error: "documentoId es requerido" },
        { status: 400 },
      );
    }

    if (accion !== "ACEPTADO" && accion !== "RECHAZADO") {
      return NextResponse.json(
        { error: 'accion debe ser "ACEPTADO" o "RECHAZADO"' },
        { status: 400 },
      );
    }

    if (accion === "RECHAZADO" && !observaciones?.trim()) {
      return NextResponse.json(
        { error: "Se requieren observaciones para rechazar un documento" },
        { status: 400 },
      );
    }

    const result = await db.query(
      `
      UPDATE v2_documentos_liberacion
      SET
        estatus_revision = $1,
        observaciones = $2,
        fecha_revision = NOW()
      WHERE id = $3
      RETURNING id, estatus_revision, observaciones
      `,
      [accion, observaciones?.trim() || null, documentoId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "No se encontró el documento" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: `Documento ${accion === "ACEPTADO" ? "aceptado" : "rechazado"} correctamente`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("[LIBERACIONES][REVISAR DOCUMENTO] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
