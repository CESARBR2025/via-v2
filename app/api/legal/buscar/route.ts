import { NextRequest, NextResponse } from "next/server";

import { POOL_PG } from "@/lib/db";
import { generateEmbedding } from "@/lib/embeddings/embeddings";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  console.log("entro");

  try {
    const body = await req.json();

    const texto = body?.texto?.trim();

    if (!texto) {
      return NextResponse.json(
        {
          ok: false,
          message: "El texto es requerido",
        },
        {
          status: 400,
        },
      );
    }
    console.log(texto);

    const embedding = await generateEmbedding(texto);
    console.log(embedding);

    const vector = `[${embedding.join(",")}]`;

    const result = await POOL_PG.query(
      `
      SELECT
          f.id,
          a.numero as articulo_numero,
          a.descripcion as articulo_descripcion,
          f.numero as fraccion_numero,
          f.descripcion as fraccion_descripcion,
          f.clasificacion,
          f.monto_umas,
          ROUND(
            CAST(
              (
                1 - (f.embedding <=> $1::vector)
              ) * 100
              AS numeric
            ),
            2
          ) as similitud
      FROM v2_fracciones_ley f
      INNER JOIN v2_articulos_ley a
        ON a.id = f.articulo_id
      WHERE
          f.activo = true
          AND f.embedding IS NOT NULL
      ORDER BY f.embedding <=> $1::vector
      LIMIT 5
      `,
      [vector],
    );

    return NextResponse.json({
      ok: true,
      texto,
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error buscando infracciones:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error interno del servidor",
      },
      {
        status: 500,
      },
    );
  }
}
