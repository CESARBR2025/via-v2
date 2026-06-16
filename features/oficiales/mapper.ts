import { OficialListaDTO, OficialDetalleDTO } from "./types";

interface OficialRow {
  id: string;
  usuario_id: string;
  numero_empleado: string;
  nombres: string;
  apellido_p: string;
  apellido_m: string;
  curp: string;
  correo: string;
  telefono: string | null;
  departamento_id: string | null;
  departamento_nombre: string | null;
  rango_id: string | null;
  rango_nombre: string | null;
  patrulla_id: string | null;
  patrulla_unidad: string | null;
  patrulla_placas: string | null;
  sector_id: string | null;
  sector_nombre: string | null;
  fecha_ingreso: string | null;
  activo: boolean;
  created_at: string;
  updated_at?: string;
}

export function mapRowToListaDTO(row: OficialRow): OficialListaDTO {
  return {
    id: row.id,
    usuarioId: row.usuario_id,
    numeroEmpleado: row.numero_empleado,
    nombres: row.nombres,
    apellidoP: row.apellido_p,
    apellidoM: row.apellido_m,
    curp: row.curp,
    correo: row.correo,
    telefono: row.telefono,
    departamentoId: row.departamento_id,
    departamentoNombre: row.departamento_nombre,
    rangoId: row.rango_id,
    rangoNombre: row.rango_nombre,
    patrullaId: row.patrulla_id,
    patrullaUnidad: row.patrulla_unidad,
    patrullaPlacas: row.patrulla_placas,
    sectorId: row.sector_id,
    sectorNombre: row.sector_nombre,
    fechaIngreso: row.fecha_ingreso,
    activo: row.activo,
    created_at: row.created_at,
  };
}

export function mapRowToDetalleDTO(row: OficialRow): OficialDetalleDTO {
  return {
    id: row.id,
    usuarioId: row.usuario_id,
    numeroEmpleado: row.numero_empleado,
    nombres: row.nombres,
    apellidoP: row.apellido_p,
    apellidoM: row.apellido_m,
    curp: row.curp,
    correo: row.correo,
    telefono: row.telefono,
    departamentoId: row.departamento_id,
    departamentoNombre: row.departamento_nombre,
    rangoId: row.rango_id,
    rangoNombre: row.rango_nombre,
    patrullaId: row.patrulla_id,
    patrullaUnidad: row.patrulla_unidad,
    patrullaPlacas: row.patrulla_placas,
    sectorId: row.sector_id,
    sectorNombre: row.sector_nombre,
    fechaIngreso: row.fecha_ingreso,
    activo: row.activo,
    created_at: row.created_at,
    updated_at: row.updated_at ?? row.created_at,
  };
}
