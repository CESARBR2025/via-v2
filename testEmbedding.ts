// testEmbedding.ts

import { generateEmbedding } from "./lib/embeddings/embeddings";

async function main() {
  const embedding = await generateEmbedding(
    "vehiculo estacionado tapando cochera",
  );

  console.log("OK");
  console.log("LONGITUD:", embedding.length);
}

main().catch(console.error);
