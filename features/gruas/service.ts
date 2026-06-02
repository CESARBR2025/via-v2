// features/gruas/service.ts

import { GruasRepository } from "./repository";

export class GruasService {
  static async obtenerGruasSV() {
    return await GruasRepository.obtenerGruasRP();
  }
}
