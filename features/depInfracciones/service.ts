// service/infraccion.service.ts

import { DepInfraccionesRepository } from "./repository";

import { mapInfraccionDetail, mapInfraccionListItem } from "./mappers";

import { getHoyYAyerRange } from "@/lib/utils/dataRange";
export class DepInfraccionesService {
  static async listarInfraccionesService() {
    try {
      // 2. Rango de fechas (hoy + ayer)
      const { from, to } = getHoyYAyerRange();

      console.log("[SERVICE][INFRACCIONES][LISTAR] Rango fechas:", {
        from,
        to,
      });

      // 3. Queries en paralelo
      const [listResult, total] = await Promise.all([
        DepInfraccionesRepository.getInfraccionesFiltradasRepository({
          from,
          to,
        }),

        DepInfraccionesRepository.contarRegistrosInfracciones({
          from,
          to,
        }),
      ]);

      console.log("[SERVICE][INFRACCIONES][LISTAR] Resultado:", {
        rows: listResult.rows?.length ?? 0,
        total,
      });

      // 4. Mapear
      const data = listResult.rows.map(mapInfraccionListItem);
      console.log(data);

      // 5. Response
      return {
        data,
        total,
      };
    } catch (error) {
      console.error("[SERVICE][INFRACCIONES][LISTAR] ERROR:", error);

      if (error && typeof error === "object") {
        console.error("DETAIL:", (error as any).detail);
        console.error("MESSAGE:", (error as any).message);
        console.error("CODE:", (error as any).code);
        console.error("TABLE:", (error as any).table);
        console.error("COLUMN:", (error as any).column);
        console.error("CONSTRAINT:", (error as any).constraint);
      }

      throw error;
    }
  }

  static async listarInfraccionesRealizadasService(userId: string) {
    console.log(userId);
    console.log("entro");
    try {
      // 2. Rango de fechas (hoy + ayer)
      const { from, to } = getHoyYAyerRange();

      console.log("[SERVICE][INFRACCIONES][LISTAR] Rango fechas:", {
        from,
        to,
      });

      console.log(userId);
      // 3. Queries en paralelo
      const [listResult, total] = await Promise.all([
        DepInfraccionesRepository.getInfraccionesRealizadasOficialRP({
          from,
          to,
          userId,
        }),

        DepInfraccionesRepository.contarRegistrosInfracciones({
          from,
          to,
        }),
      ]);

      console.log("[SERVICE][INFRACCIONES][LISTAR] Resultado:", {
        rows: listResult.rows?.length ?? 0,
        total,
      });

      // 4. Mapear
      const data = listResult.rows.map(mapInfraccionListItem);
      console.log(data);

      // 5. Response
      return {
        data,
        total,
      };
    } catch (error) {
      console.error("[SERVICE][INFRACCIONES][LISTAR] ERROR:", error);

      if (error && typeof error === "object") {
        console.error("DETAIL:", (error as any).detail);
        console.error("MESSAGE:", (error as any).message);
        console.error("CODE:", (error as any).code);
        console.error("TABLE:", (error as any).table);
        console.error("COLUMN:", (error as any).column);
        console.error("CONSTRAINT:", (error as any).constraint);
      }

      throw error;
    }
  }

  //Listar infracciones de fiscalia
  static async listarInfraccionesFiscaliaService() {
    try {
      // 2. Rango de fechas (hoy + ayer)
      const { from, to } = getHoyYAyerRange();

      console.log("[SERVICE][INFRACCIONES][LISTAR] Rango fechas:", {
        from,
        to,
      });

      // 3. Queries en paralelo
      const [listResult, total] = await Promise.all([
        DepInfraccionesRepository.getInfraccionesFiscaliaFiltradasRepository({
          from,
          to,
        }),

        DepInfraccionesRepository.contarRegistrosFiscaliaInfracciones({
          from,
          to,
        }),
      ]);

      console.log("[SERVICE][INFRACCIONES][LISTAR] Resultado:", {
        rows: listResult.rows?.length ?? 0,
        total,
      });

      // 4. Mapear
      const data = listResult.rows.map(mapInfraccionListItem);
      console.log(data);

      // 5. Response
      return {
        data,
        total,
      };
    } catch (error) {
      console.error("[SERVICE][INFRACCIONES][LISTAR] ERROR:", error);

      if (error && typeof error === "object") {
        console.error("DETAIL:", (error as any).detail);
        console.error("MESSAGE:", (error as any).message);
        console.error("CODE:", (error as any).code);
        console.error("TABLE:", (error as any).table);
        console.error("COLUMN:", (error as any).column);
        console.error("CONSTRAINT:", (error as any).constraint);
      }

      throw error;
    }
  }

  // Detalles de infra
  static async obtenerDetalleInfraccionSV(id: string) {
    try {
      console.log(id);

      const data = await DepInfraccionesRepository.detalleInfraccionRP(id);

      console.log(data);

      if (!data) return null;

      const mappedData = mapInfraccionDetail(data);
      console.log(mappedData);

      return mappedData;
    } catch (error) {
      console.error("[SERVICE][DETALLE]", error);
      throw error;
    }
  }
}
