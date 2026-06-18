import { AppError } from "@/lib/errors/errors";
import { OficialesRepository } from "./repository";
import { mapRowToListaDTO, mapRowToDetalleDTO } from "./mapper";
import {
  CrearOficialDTO,
  ActualizarOficialDTO,
  ListarOficialesParams,
} from "./types";

export class OficialesService {
  static async listar(params: ListarOficialesParams) {
    const { data, total } = await OficialesRepository.listar(params);

    return {
      data: data.map(mapRowToListaDTO),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  static async obtenerPorId(id: string) {
    const row = await OficialesRepository.obtenerPorId(id);
    if (!row) {
      throw new AppError("Oficial no encontrado", 404, "OFICIAL_NOT_FOUND");
    }
    return mapRowToDetalleDTO(row);
  }

  static async crear(data: CrearOficialDTO) {
    const existeEmpleado = await OficialesRepository.obtenerPorNumeroEmpleado(
      data.numeroEmpleado,
    );
    if (existeEmpleado) {
      throw new AppError(
        "El número de empleado ya está registrado",
        409,
        "DUPLICATE_EMPLEADO",
      );
    }

    const usuario = await OficialesRepository.buscarUsuarioPorCurp(data.curp);
    if (!usuario) {
      throw new AppError(
        "No existe un usuario con esa CURP en el sistema. El usuario debe haber iniciado sesión al menos una vez.",
        404,
        "USER_NOT_FOUND",
      );
    }

    const yaEsOficial = await OficialesRepository.obtenerPorUsuarioId(
      usuario.id,
    );
    if (yaEsOficial) {
      throw new AppError(
        "Este usuario ya está registrado como oficial",
        409,
        "ALREADY_OFFICER",
      );
    }

    await OficialesRepository.asignarRolOficial(usuario.id);

    const oficialId = await OficialesRepository.crear({
      ...data,
      usuario_id: usuario.id,
    });

    return this.obtenerPorId(oficialId);
  }

  static async actualizar(id: string, data: ActualizarOficialDTO) {
    const existe = await OficialesRepository.obtenerPorId(id);
    if (!existe) {
      throw new AppError("Oficial no encontrado", 404, "OFICIAL_NOT_FOUND");
    }

    if (data.numeroEmpleado) {
      const duplicado = await OficialesRepository.obtenerPorNumeroEmpleado(
        data.numeroEmpleado,
      );
      if (duplicado && duplicado.id !== id) {
        throw new AppError(
          "El número de empleado ya está registrado",
          409,
          "DUPLICATE_EMPLEADO",
        );
      }
    }

    await OficialesRepository.actualizar(id, data);

    return this.obtenerPorId(id);
  }

  static async desactivar(id: string) {
    const existe = await OficialesRepository.obtenerPorId(id);
    if (!existe) {
      throw new AppError("Oficial no encontrado", 404, "OFICIAL_NOT_FOUND");
    }

    await OficialesRepository.actualizar(id, { activo: false });

    return { ok: true };
  }

  static async activar(id: string) {
    const existe = await OficialesRepository.obtenerPorId(id);
    if (!existe) {
      throw new AppError("Oficial no encontrado", 404, "OFICIAL_NOT_FOUND");
    }

    await OficialesRepository.actualizar(id, { activo: true });

    return { ok: true };
  }

  static async listarDepartamentos() {
    return OficialesRepository.listarDepartamentos();
  }

  static async listarPatrullas() {
    return OficialesRepository.listarPatrullasActivas();
  }

  static async obtenerMiPerfil(usuarioId: string) {
    const [row, infraccionesCount] = await Promise.all([
      OficialesRepository.obtenerPorUsuarioIdCompleto(usuarioId),
      OficialesRepository.contarInfraccionesOficial(usuarioId),
    ]);
    if (!row) {
      throw new AppError("Oficial no encontrado", 404, "OFICIAL_NOT_FOUND");
    }
    return { ...mapRowToDetalleDTO(row), infraccionesCount };
  }

  static async actualizarPatrulla(id: string, patrullaId: string | null) {
    const existe = await OficialesRepository.obtenerPorId(id);
    if (!existe) {
      throw new AppError("Oficial no encontrado", 404, "OFICIAL_NOT_FOUND");
    }

    await OficialesRepository.actualizar(id, { patrullaId });

    return this.obtenerPorId(id);
  }

  static async listarSectores() {
    return OficialesRepository.listarSectoresActivos();
  }

  static async listarRangos() {
    return OficialesRepository.listarRangosActivos();
  }
}
