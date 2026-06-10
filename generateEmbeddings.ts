import "dotenv/config";
import { POOL_PG } from "@/lib/db";

import { generateEmbedding } from "./lib/embeddings/embeddings";
import { enrichText } from "./lib/embeddings/enrichText";

async function main() {
  console.log("Obteniendo fracciones...");

  const result = await POOL_PG.query(`
    SELECT
      f.id,
      a.descripcion as articulo_descripcion,
      f.descripcion as fraccion_descripcion
    FROM v2_fracciones_ley f
    INNER JOIN v2_articulos_ley a ON a.id = f.articulo_id
    WHERE f.activo = true
    ORDER BY f.id
  `);

  const rows = result.rows;

  console.log(`Se encontraron ${rows.length} fracciones`);

  for (const row of rows) {
    try {
      const textoEnriquecido = enrichText(
        row.articulo_descripcion,
        row.fraccion_descripcion,
      );

      console.log(`Procesando ID ${row.id}...`);

      const embedding = await generateEmbedding(textoEnriquecido);
      const vector = `[${embedding.join(",")}]`;

      await POOL_PG.query(
        `UPDATE v2_fracciones_ley
         SET embedding = $1::vector,
             texto_embedding = $2
         WHERE id = $3`,
        [vector, textoEnriquecido, row.id],
      );

      console.log(`✓ Embedding guardado para ID ${row.id}`);
    } catch (error) {
      console.error(`❌ Error procesando ID ${row.id}`, error);
    }
  }

  console.log("Proceso finalizado");

  await POOL_PG.end();
}

main()
  .then(() => {
    console.log("Proceso completado");
  })
  .catch(async (error) => {
    console.error("Error general:", error);
    await POOL_PG.end();
    process.exit(1);
  });
