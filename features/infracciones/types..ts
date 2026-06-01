export interface CrearInfraccionDTO {
  //  descuentoAplicado: 70,
  // fechaLimiteDescuento: '2026-06-08T20:01:40.187Z',
  // esCiudadanoAdultoMayor: true,

  correoInfractor: string;
  oficialId: string;

  patrullaId?: string | null;
  placaPatrulla?: string | null;

  articuloId: string;
  fraccionId: string;

  ciudadanoPresente: boolean;
  esTitular?: boolean | null;
  presentaIne?: boolean | null;

  curpInfractor?: string | null;

  nombreInfractor?: string | null;
  apellidoPaternoInfractor?: string | null;
  apellidoMaternoInfractor?: string | null;

  marca?: string | null;
  modelo?: string | null;
  color?: string | null;

  placa: string;

  latitud?: number | null;
  longitud?: number | null;

  codigoPostal?: string | null;
  colonia?: string | null;
  calle?: string | null;
  numero?: string | null;
  municipio?: string | null;
  estado?: string | null;

  tipoGarantia?: string | null;
  garantiaEntregada?: boolean;

  motivoRetencion?: string | null;

  montoTotal: number;

  aplicaDescuentoInapam?: boolean;

  descuentoAplicado?: number;

  pagoAlMomento?: boolean;

  fechaLimiteDescuento?: string | null;

  montoFinal: number;

  gruaId?: string | null;
}

export interface InfraccionDB {
  correoInfractor: string;
  clasificacion: string;

  id: string;

  folio: string;

  seq_valor: number;

  estatus: string;

  oficial_id: string;

  patrulla_id: string | null;

  placa_patrulla: string | null;

  articulo_id: string;

  fraccion_id: string;

  ciudadano_presente: boolean;

  es_titular: boolean | null;

  presenta_ine: boolean | null;

  curp_infractor: string | null;

  nombre_infractor: string | null;

  apellido_paterno_infractor: string | null;

  apellido_materno_infractor: string | null;

  marca: string | null;

  modelo: string | null;

  color: string | null;

  placa: string;

  latitud: number | null;

  longitud: number | null;

  codigo_postal: string | null;

  colonia: string | null;

  calle: string | null;

  numero: string | null;

  municipio: string | null;

  estado: string | null;

  tipo_garantia: string | null;

  garantia_entregada: boolean;

  motivo_retencion: string | null;

  monto_total: number;

  aplica_descuento_inapam: boolean;

  descuento_aplicado: number;

  pago_al_momento: boolean;

  fecha_limite_descuento: string | null;

  monto_final: number;

  grua_id: string | null;

  created_at: string;

  updated_at: string;
}

// Datos de infracción que se enviarán a la vista ciudadana

export interface InfraccionDetalleDTO {
  descuento_aplicado: string;
  fecha_limite_descuento: string;
  concepto_id: string;
  orden_pago_local_id: string | null;
  orden_pago_id: string | null;
  estatus_orden_pago: string | null;
  url_pago: string | null;
  url_guardado: string | null;
  folio_orden: string | null;
  fecha_vencimiento: string | null;
  total_pesos: number | null;
  total_umas: number | null;
  created_at: string | null;

  clasificacion: string;

  id: string;
  folio: string;

  estatus: string;

  fechaInfraccion: string;

  montoTotal: number;
  montoFinal: number;

  ciudadanoPresente: boolean;
  esTitular: boolean | null;
  presentaIne: boolean | null;

  placa: string;
  marca: string | null;
  modelo: string | null;
  color: string | null;

  tipoVehiculo: string;

  tipoGarantia: string | null;
  garantiaEntregada: boolean;

  motivoRetencion: string | null;

  latitud: number | null;
  longitud: number | null;
  calle: string | null;
  numero: string | null;
  colonia: string | null;
  municipio: string | null;
  estado: string | null;

  articuloId: string;
  fraccionId: string;
  nombreInfractor: string | null;
  apellidoPaternoInfractor: string | null;
  apellidoMaternoInfractor: string | null;
}

// Interfaz a usar en el store
export interface DatosInfraccion {
  //Archivos a subir
  archivoINE: File | null;
  archivoInapam: File | null;
  archivoTarjetaCirculacion: File | null;

  //Fase de descuentos
  esCiudadanoAdultoMayor: boolean;
  presentaInapam: boolean;
  fechaLimiteDescuento: string;
  descuentoAplicado: number;

  //======== FASE 1 ========
  estaCiudadanoPresente: boolean | null;
  esCiudadanoTitular: boolean | null;

  //======== FASE 2 ========
  latitud: number | null;
  longitud: number | null;

  calle: string;
  numero: string;
  colonia: string;
  codigoPostal: string;
  municipio: string;
  estado: string;

  //======== FASE 3 ========
  presentaIne: boolean | null;

  correoInfractor: string;
  curpInfractor: string;

  nombreInfractor: string;
  apMaternoInfractor: string;
  apPaternoInfractor: string;

  //======== FASE 4 ========
  marca: string;
  modelo: string;
  anio: string;
  color: string;
  placa: string;
  noSerie: string;
  estadoOrigen: string;

  tipoVehiculo: string;

  servicio: string;
  otroServicio: string;

  //======== FASE 5 ========
  articuloId: string;
  articuloDescripcion: string;
  articuloNumero: string;

  fraccionId: string;
  fraccionDescripcion: string;
  fraccionNumero: string;
  fraccionMonto: string;
  fraccionClasificacion: string;

  garantiaSeleccionada: string;

  motivoRetencionVehiculo: string;

  gruaInvolucrada: string;

  //======== FASE 6 ========
  agregarEvidencia: boolean;
}

// Formulario de infraccion types

export type ProcesoEstado =
  | "inicio"
  | "creando"
  | "documentos"
  | "orden"
  | "completado"
  | "error";

export interface ViewFraccionLista {
  id: string;
  articulo_id: string;
  numero: string;
  descripcion: string;
  monto_umas: string;
  clasificacion: string;
  activo: boolean;
}

export interface ViewArticulosLista {
  id: string;
  numero: string;
  descripcion: string;
  activo: boolean;
  fracciones?: ViewFraccionLista[];
}

export interface ViewBuscarIDArticulo {
  id: number;
  descripcion: string;
}

export type ArticulosInterfaceProps = {
  success: boolean;
  data: ViewArticulosLista[];
};
