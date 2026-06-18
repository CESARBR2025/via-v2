import { AppError } from "@/lib/errors/errors";
import { RangosRepository } from "./repository";
import { RangoDTO } from "./types";

export class RangosService {
  static async listar(activo?: boolean): Promise<RangoDTO[]> {
    const rows = await RangosRepository.listar(activo);
    return rows.map((r) => ({ id: r.id, nombre: r.nombre, activo: r.activo }));
  }

  static async obtenerPorId(id: string): Promise<RangoDTO> {
    const row = await RangosRepository.obtenerPorId(id);
    if (!row) throw new AppError("Rango no encontrado", 404, "RANGO_NOT_FOUND");
    return { id: row.id, nombre: row.nombre, activo: row.activo };
  }

  static async crear(nombre: string): Promise<RangoDTO> {
    const nombreUpper = nombre.toUpperCase().trim();
    if (!nombreUpper) {
      throw new AppError("El nombre del rango es obligatorio", 400, "INVALID_NAME");
    }

    const existente = await RangosRepository.obtenerPorNombre(nombreUpper);
    if (existente) {
      throw new AppError("Ya existe un rango con ese nombre", 409, "DUPLICATE_RANGO");
    }

    const id = await RangosRepository.crear(nombreUpper);
    return this.obtenerPorId(id);
  }

  static async actualizar(id: string, nombre: string): Promise<RangoDTO> {
    const nombreUpper = nombre.toUpperCase().trim();
    if (!nombreUpper) {
      throw new AppError("El nombre del rango es obligatorio", 400, "INVALID_NAME");
    }

    const existente = await RangosRepository.obtenerPorNombre(nombreUpper);
    if (existente && existente.id !== id) {
      throw new AppError("Ya existe un rango con ese nombre", 409, "DUPLICATE_RANGO");
    }

    const ok = await RangosRepository.actualizar(id, nombreUpper);
    if (!ok) throw new AppError("Rango no encontrado", 404, "RANGO_NOT_FOUND");

    return this.obtenerPorId(id);
  }

  static async toggleActivo(id: string): Promise<RangoDTO> {
    const rango = await RangosRepository.obtenerPorId(id);
    if (!rango) throw new AppError("Rango no encontrado", 404, "RANGO_NOT_FOUND");

    await RangosRepository.toggleActivo(id, !rango.activo);
    return this.obtenerPorId(id);
  }
}
