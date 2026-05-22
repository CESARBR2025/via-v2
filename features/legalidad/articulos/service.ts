// ============================================================
// SERVICE
// features/legalidad/services/articulos.service.ts
// ============================================================

import { unstable_cache } from "next/cache";

import { ArticulosMapper } from "./mapper";
import { ArticulosRepository } from "./repository";

export class ArticulosService {
  static obtenerArticulos = unstable_cache(
    async () => {
      const rows = await ArticulosRepository.obtenerArticulos();

      return ArticulosMapper.toDomain(rows);
    },

    ["legalidad-articulos"],

    {
      revalidate: 60 * 60 * 24, // 24 horas
      tags: ["legalidad", "articulos"],
    },
  );
}
