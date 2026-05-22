import { CrearInfraccionDTO } from "./types.";
import { InfraccionDetalleDTO } from "./types.";

export const mapCrearInfraccionToDB = (
  data: CrearInfraccionDTO,
  folio: string,
  seqValor: number,
) => {
  return {
    folio,
    seq_valor: seqValor,

    oficial_id: data.oficialId,

    patrulla_id: data.patrullaId ?? null,
    placa_patrulla: data.placaPatrulla ?? null,

    articulo_id: data.articuloId,
    fraccion_id: data.fraccionId,

    ciudadano_presente: data.ciudadanoPresente,

    es_titular: data.esTitular ?? null,

    presenta_ine: data.presentaIne ?? null,

    curp_infractor: data.curpInfractor ?? null,

    nombre_infractor: data.nombreInfractor ?? null,

    apellido_paterno_infractor: data.apellidoPaternoInfractor ?? null,

    apellido_materno_infractor: data.apellidoMaternoInfractor ?? null,

    marca: data.marca ?? null,

    modelo: data.modelo ?? null,

    color: data.color ?? null,

    placa: data.placa,

    latitud: data.latitud ?? null,
    longitud: data.longitud ?? null,

    codigo_postal: data.codigoPostal ?? null,

    colonia: data.colonia ?? null,

    calle: data.calle ?? null,

    numero: data.numero ?? null,

    municipio: data.municipio ?? null,

    estado: data.estado ?? null,

    tipo_garantia: data.tipoGarantia ?? null,

    garantia_entregada: data.garantiaEntregada ?? false,

    motivo_retencion: data.motivoRetencion ?? null,

    monto_total: data.montoTotal,

    aplica_descuento_inapam: data.aplicaDescuentoInapam ?? false,

    descuento_aplicado: data.descuentoAplicado ?? 0,

    pago_al_momento: data.pagoAlMomento ?? false,

    fecha_limite_descuento: data.fechaLimiteDescuento ?? null,

    monto_final: data.montoFinal,

    grua_id: data.gruaId ?? null,
  };
};

export const mapInfraccionDetalle = (row: any): InfraccionDetalleDTO => {
  return {
    id: row.id,
    folio: row.folio,

    estatus: row.estatus,
    fechaInfraccion: row.fecha_infraccion,

    montoTotal: Number(row.monto_total),
    montoFinal: Number(row.monto_final),

    ciudadanoPresente: row.ciudadano_presente,
    esTitular: row.es_titular,
    presentaIne: row.presenta_ine,

    placa: row.placa,
    marca: row.marca,
    modelo: row.modelo,
    color: row.color,

    tipoVehiculo: row.tipo_vehiculo,

    tipoGarantia: row.tipo_garantia,
    garantiaEntregada: row.garantia_entregada,

    motivoRetencion: row.motivo_retencion,

    latitud: row.latitud,
    longitud: row.longitud,
    calle: row.calle,
    numero: row.numero,
    colonia: row.colonia,
    municipio: row.municipio,
    estado: row.estado,

    articuloId: row.articulo_id,
    fraccionId: row.fraccion_id,
  };
};
