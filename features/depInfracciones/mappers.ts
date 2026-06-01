// mapper/infraccion.mapper.ts

import { safeRowMapper } from "./components/TablaDevInfracciones/utils/safeRow";
import { InfraccionDetail, InfraccionListItem } from "./types";

export const mapInfraccionListItem = (row: any): InfraccionListItem => ({
  nombre_infractor: row.nombre_infractor,
  correo_infractor: row.correo_infractor,
  id: row.id,
  folio: row.folio,
  estatus: row.estatus,
  placa: row.placa,
  created_at: row.created_at,
});

// MaperS
export const mapInfraccionDetail = (row: any): InfraccionDetail => ({
  Header: {
    id_infraccion: safeRowMapper(row.id),
    folio_de_infraccion: safeRowMapper(row.folio),
    fecha_de_registro_de_infraccion: safeRowMapper(row.created_at),
    estatus_de_infraccion: safeRowMapper(row.estatus),
    url_inapam: safeRowMapper(row.url_inapam),
    url_tarjeta_circulacion: safeRowMapper(row.url_tarjeta_circulacion),
    url_ine: safeRowMapper(row.url_ine),
  },

  Infraccion: {
    articulo_descripcion: safeRowMapper(
      row.articulo_descripcion ?? row.articulo_id,
    ),
    fraccion_descripcion: safeRowMapper(
      row.fraccion_descripcion ?? row.fraccion_id,
    ),
    total_umas: safeRowMapper(row.total_umas),
    total_pesos: safeRowMapper(row.total_pesos ?? row.monto_final),
  },

  datos_infractor: {
    nombre_infractor: safeRowMapper(
      `${row.nombre_infractor ?? ""} ${row.apellido_paterno_infractor ?? ""} ${row.apellido_materno_infractor ?? ""}`.trim(),
    ),
    correo_infractor: safeRowMapper(row.correo_infractor),
  },

  vehiculo: {
    placa: safeRowMapper(row.placa),
    tipo: safeRowMapper(row.tipo),
    marca: safeRowMapper(row.marca),
    modelo: safeRowMapper(row.modelo),
    anio: safeRowMapper(row.anio),
    color: safeRowMapper(row.color),
  },

  garantia: {
    garantia_retenida: safeRowMapper(
      row.tipo_garantia ?? row.garantia_entregada,
    ),
  },

  ubicacion: {
    latitud: safeRowMapper(row.latitud),
    longitud: safeRowMapper(row.longitud),
    calle: safeRowMapper(row.calle),
    cod_postal: safeRowMapper(row.codigo_postal),
    numero: safeRowMapper(row.numero),
    municipio: safeRowMapper(row.municipio),
    estado: safeRowMapper(row.estado),
  },
});
