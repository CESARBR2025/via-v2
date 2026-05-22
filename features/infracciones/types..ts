export interface CrearInfraccionDTO {
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
}
