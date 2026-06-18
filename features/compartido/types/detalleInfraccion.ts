export type DetalleHeader = {
  id_infraccion: string
  folio_de_infraccion: string
  fecha_de_registro_de_infraccion: string
  estatus_de_infraccion: string
  url_ine: string
  url_tarjeta_circulacion: string
  url_inapam: string
  url_evidencias: string[]
  no_oficio_fiscalia?: string
  url_oficio_fiscalia?: string
  estatus_dependencia: string
  no_carpeta_investigacion: string
  appaterno_infractor: string
  url_oficio_pago_corralon?: string
  url_orden_salida_liberaciones?: string
  estatus_orden_pago?: string
  estatus: string
}

export type DetalleInfraccion = {
  articulo_descripcion: string
  fraccion_descripcion: string
  total_umas: string | number
  total_pesos: string | number
}

export type DetalleInfractor = {
  nombre_infractor: string
  correo_infractor: string
  curp_infractor: string
  es_titular: boolean
  apmaterno_infractor: string
  appaterno_infractor: string
  nombre_titular_liberacion: string
}

export type DetalleVehiculo = {
  placa: string
  tipo: string
  marca: string
  modelo: string
  anio: string
  color: string
}

export type DetalleGarantia = {
  garantia_retenida: string
}

export type DetalleUbicacion = {
  latitud: string
  longitud: string
  calle: string
  cod_postal: string
  numero: string
  municipio: string
  estado: string
}

export type DetalleCompleto = {
  Header: DetalleHeader
  Infraccion: DetalleInfraccion
  datos_infractor: DetalleInfractor
  vehiculo: DetalleVehiculo
  garantia: DetalleGarantia
  ubicacion: DetalleUbicacion
}
