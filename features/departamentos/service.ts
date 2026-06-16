import { AppError } from "@/lib/errors/errors";
import { DepartamentosRepository } from "./repository";
import { DepartamentoDTO } from "./types";

export class DepartamentosService {
  static async listar(activo?: boolean): Promise<DepartamentoDTO[]> {
    const rows = await DepartamentosRepository.listar(activo);
    return rows.map((r) => ({ id: r.id, nombre: r.nombre, activo: r.activo }));
  }

  static async obtenerPorId(id: string): Promise<DepartamentoDTO> {
    const row = await DepartamentosRepository.obtenerPorId(id);
    if (!row) throw new AppError("Departamento no encontrado", 404, "DEPARTAMENTO_NOT_FOUND");
    return { id: row.id, nombre: row.nombre, activo: row.activo };
  }

  static async crear(nombre: string): Promise<DepartamentoDTO> {
    const nombreUpper = nombre.toUpperCase().trim();
    if (!nombreUpper) {
      throw new AppError("El nombre del departamento es obligatorio", 400, "INVALID_NAME");
    }

    const existente = await DepartamentosRepository.obtenerPorNombre(nombreUpper);
    if (existente) {
      throw new AppError("Ya existe un departamento con ese nombre", 409, "DUPLICATE_DEPARTAMENTO");
    }

    const id = await DepartamentosRepository.crear(nombreUpper);
    return this.obtenerPorId(id);
  }

  static async actualizar(id: string, nombre: string): Promise<DepartamentoDTO> {
    const nombreUpper = nombre.toUpperCase().trim();
    if (!nombreUpper) {
      throw new AppError("El nombre del departamento es obligatorio", 400, "INVALID_NAME");
    }

    const existente = await DepartamentosRepository.obtenerPorNombre(nombreUpper);
    if (existente && existente.id !== id) {
      throw new AppError("Ya existe un departamento con ese nombre", 409, "DUPLICATE_DEPARTAMENTO");
    }

    const ok = await DepartamentosRepository.actualizar(id, nombreUpper);
    if (!ok) throw new AppError("Departamento no encontrado", 404, "DEPARTAMENTO_NOT_FOUND");

    return this.obtenerPorId(id);
  }

  static async toggleActivo(id: string): Promise<DepartamentoDTO> {
    const departamento = await DepartamentosRepository.obtenerPorId(id);
    if (!departamento) throw new AppError("Departamento no encontrado", 404, "DEPARTAMENTO_NOT_FOUND");

    await DepartamentosRepository.toggleActivo(id, !departamento.activo);
    return this.obtenerPorId(id);
  }
}
