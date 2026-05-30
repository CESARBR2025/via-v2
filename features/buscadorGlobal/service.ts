// modules/public/infracciones/service.ts

import { mapInfraccionDetail } from "../depInfracciones/mappers";
import { BuscadorGlobalRepository } from "./repository";

export class BuscadorGlobalService {
  // Buscar infracciones por placa
  static async buscarPorPlaca(placa: string) {
    try {
      const placaNormalizada = placa.trim().toUpperCase();

      console.log("[SERVICE][BUSCAR_PLACA]", placaNormalizada);

      const infracciones =
        await BuscadorGlobalRepository.listarInfraccionesPlaca(placa);

      return {
        infracciones,
      };
    } catch (error) {
      console.error("[SERVICE][BUSCAR_PLACA]", error);

      throw error;
    }
  }

  // Buscar infracciones por placa
  static async buscarInfraccionCompletaService(idInfraccion: string) {
    try {
      const infracciones =
        await BuscadorGlobalRepository.buscarInfraccionCompletaRepository(
          idInfraccion,
        );
      console.log(infracciones);

      const mappedData = mapInfraccionDetail(infracciones);

      return mappedData;
    } catch (error) {
      console.error("[SERVICE][BUSCAR_PLACA]", error);

      throw error;
    }
  }
}
