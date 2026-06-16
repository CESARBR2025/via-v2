export interface OficialDB {
  id: string;
  usuario_id: string;
  numero_empleado: string;
  telefono: string | null;
  departamento_id: string | null;
  rango_id: string | null;
  patrulla_id: string | null;
  sector_id: string | null;
  fecha_ingreso: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface OficialListaDTO {
  id: string;
  usuarioId: string;
  numeroEmpleado: string;
  nombres: string;
  apellidoP: string;
  apellidoM: string;
  curp: string;
  correo: string;
  telefono: string | null;
  departamentoId: string | null;
  departamentoNombre: string | null;
  rangoId: string | null;
  rangoNombre: string | null;
  patrullaId: string | null;
  patrullaUnidad: string | null;
  sectorId: string | null;
  sectorNombre: string | null;
  fechaIngreso: string | null;
  activo: boolean;
  created_at: string;
}

export interface OficialDetalleDTO {
  id: string;
  usuarioId: string;
  numeroEmpleado: string;
  nombres: string;
  apellidoP: string;
  apellidoM: string;
  curp: string;
  correo: string;
  telefono: string | null;
  departamentoId: string | null;
  departamentoNombre: string | null;
  rangoId: string | null;
  rangoNombre: string | null;
  patrullaId: string | null;
  patrullaUnidad: string | null;
  sectorId: string | null;
  sectorNombre: string | null;
  fechaIngreso: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrearOficialDTO {
  curp: string;
  numeroEmpleado: string;
  telefono?: string;
  departamentoId?: string;
  rangoId?: string;
  patrullaId?: string;
  sectorId?: string;
  fechaIngreso?: string;
}

export interface ActualizarOficialDTO {
  numeroEmpleado?: string;
  telefono?: string;
  departamentoId?: string | null;
  rangoId?: string | null;
  patrullaId?: string | null;
  sectorId?: string | null;
  fechaIngreso?: string;
  activo?: boolean;
}

export interface ListarOficialesParams {
  search?: string;
  activo?: boolean;
  departamentoId?: string;
  page: number;
  limit: number;
}

export interface ListarOficialesResponse {
  data: OficialListaDTO[];
  total: number;
  page: number;
  limit: number;
}
