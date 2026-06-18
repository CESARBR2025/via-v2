import { AppError } from "@/lib/errors/errors";
import { SectoresRepository } from "./repository";
import { SectorDTO } from "./types";

export class SectoresService {
  static async listar(activo?: boolean): Promise<SectorDTO[]> {
    const rows = await SectoresRepository.listar(activo);
    return rows.map((r) => ({ id: r.id, nombre: r.nombre, activo: r.activo }));
  }

  static async obtenerPorId(id: string): Promise<SectorDTO> {
    const row = await SectoresRepository.obtenerPorId(id);
    if (!row) throw new AppError("Sector no encontrado", 404, "SECTOR_NOT_FOUND");
    return { id: row.id, nombre: row.nombre, activo: row.activo };
  }

  static async crear(nombre: string): Promise<SectorDTO> {
    const nombreUpper = nombre.toUpperCase().trim();
    if (!nombreUpper) {
      throw new AppError("El nombre del sector es obligatorio", 400, "INVALID_NAME");
    }

    const existente = await SectoresRepository.obtenerPorNombre(nombreUpper);
    if (existente) {
      throw new AppError("Ya existe un sector con ese nombre", 409, "DUPLICATE_SECTOR");
    }

    const id = await SectoresRepository.crear(nombreUpper);
    return this.obtenerPorId(id);
  }

  static async actualizar(id: string, nombre: string): Promise<SectorDTO> {
    const nombreUpper = nombre.toUpperCase().trim();
    if (!nombreUpper) {
      throw new AppError("El nombre del sector es obligatorio", 400, "INVALID_NAME");
    }

    const existente = await SectoresRepository.obtenerPorNombre(nombreUpper);
    if (existente && existente.id !== id) {
      throw new AppError("Ya existe un sector con ese nombre", 409, "DUPLICATE_SECTOR");
    }

    const ok = await SectoresRepository.actualizar(id, nombreUpper);
    if (!ok) throw new AppError("Sector no encontrado", 404, "SECTOR_NOT_FOUND");

    return this.obtenerPorId(id);
  }

  static async toggleActivo(id: string): Promise<SectorDTO> {
    const sector = await SectoresRepository.obtenerPorId(id);
    if (!sector) throw new AppError("Sector no encontrado", 404, "SECTOR_NOT_FOUND");

    await SectoresRepository.toggleActivo(id, !sector.activo);
    return this.obtenerPorId(id);
  }
}
