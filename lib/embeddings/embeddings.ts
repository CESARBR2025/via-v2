import { pipeline } from "@xenova/transformers";

let extractor: any = null;

export async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/paraphrase-multilingual-MiniLM-L12-v2",
    );
  }

  return extractor;
}

export async function generateEmbedding(text: string) {
  const model = await getExtractor();

  const output = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  console.log("TIPO OUTPUT:", typeof output);
  console.log("OUTPUT:", output);

  return Array.from(output.data);
}
