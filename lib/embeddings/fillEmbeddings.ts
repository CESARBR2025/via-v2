import "dotenv/config";
import { generateEmbedding } from "./embeddings";
import { POOL_PG } from "../db";

async function main() {
  console.log("Obteniendo fracciones...");

  const result = await POOL_PG.query(`
    SELECT
        f.id,
        a.numero AS articulo_numero,
        a.descripcion AS articulo_descripcion,
        f.numero AS fraccion_numero,
        f.descripcion AS fraccion_descripcion
    FROM v2_fracciones_ley f
    INNER JOIN v2_articulos_ley a
      ON a.id = f.articulo_id
    WHERE f.activo = true
  `);

  const rows = result.rows;

  console.log(`Se encontraron ${rows.length} fracciones`);

  for (const row of rows) {
    try {
      const texto = `
Artículo ${row.articulo_numero}

${row.articulo_descripcion}

Fracción ${row.fraccion_numero}

${row.fraccion_descripcion}
      `.trim();

      console.log(`Procesando ID ${row.id}...`);

      const embedding = await generateEmbedding(texto);

      const vector = `[${embedding.join(",")}]`;

      await POOL_PG.query(
        `
        UPDATE v2_fracciones_ley
        SET embedding = $1
        WHERE id = $2
        `,
        [vector, row.id],
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
