import dictionary from "./json/sinonimos.json";

type Dictionary = Record<string, string[]>;

export function enrichText(
  descripcionArticulo: string,
  descripcionFraccion: string,
): string {
  const dict = dictionary as Dictionary;
  const textoBase =
    `${descripcionArticulo}. ${descripcionFraccion}`.toLowerCase();

  const sinonimosEncontrados: string[] = [];

  for (const [palabraClave, sinonimos] of Object.entries(dict)) {
    if (textoBase.includes(palabraClave.toLowerCase())) {
      sinonimosEncontrados.push(...sinonimos);
    }
  }

  const textoOriginal = `${descripcionArticulo}. ${descripcionFraccion}`.trim();

  if (sinonimosEncontrados.length === 0) {
    return textoOriginal;
  }

  return `${textoOriginal}. ${sinonimosEncontrados.join(", ")}.`;
}
