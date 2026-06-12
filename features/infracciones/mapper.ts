import { CrearInfraccionDTO } from "./types.";
import { InfraccionDetalleDTO } from "./types.";

export const mapCrearInfraccionToDB = (
  data: CrearInfraccionDTO,
  folio: string,
  seqValor: number,
) => {
  return {
    dependenciaRemisora: data.dependenciaRemisora,
    correoInfractor: data.correoInfractor,
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

    tipoVehiculo: data.tipoVehiculo ?? "VACIO",
    anioVehiculo: data.anioVehiculo ?? "VACIO",

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

    estatus: data.estatus,

    estatus_dependencia: data.estatusDependencia ?? null,

    grua_id: data.gruaId ?? null,
  };
};

export const mapInfraccionDetalle = (row: any): InfraccionDetalleDTO => {
  const documentosLiberacion: Record<string, { url: string; label: string }> =
    {};

  const docsJson = row.documentos_liberacion_json;
  if (docsJson && Array.isArray(docsJson)) {
    for (const doc of docsJson) {
      if (doc.url) {
        documentosLiberacion[doc.tipo] = {
          url: doc.url,
          label: doc.label || doc.tipo,
        };
      }
    }
  }

  return {
    // Datos de juzgado y tilar
    dependenciaReceptora: row.dependencia_receptora,
    noOficio: row.no_oficio_fiscalia ?? row.no_oficio_juzgado,
    urlOficio: row.url_oficio_fiscalia ?? row.url_oficio_juzgado,
    estatusDependencia: row.estatus_dependencia,
    estatusInfraccion: row.estatus,
    nombreTitular: [
      row.nombre_titular_liberacion,
      row.appaterno_titular_liberacion,
      row.apmaterno_titular_liberacion,
    ]
      .filter(Boolean)
      .join(" "),
    correoTitular: row.correo_titular_liberacion,
    curpTitular: row.curp_titular_liberacion,
    noCarpetaInvestigacion: row.no_carpeta_investigacion,

    descuento_aplicado: row.descuento_aplicado,
    fecha_limite_descuento: row.fecha_limite_descuento,
    clasificacion: row.clasificacion,
    id: row.id,
    folio: row.folio,

    estatusPago: row.estatusPago,
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

    nombreInfractor: row.nombre_infractor,
    apellidoPaternoInfractor: row.apellido_paterno_infractor,
    apellidoMaternoInfractor: row.apellido_materno_infractor,

    orden_pago_local_id: row.orden_pago_local_id,
    orden_pago_id: row.orden_pago_id,

    estatus_orden_pago: row.estatus_orden_pago,
    url_pago: row.url_pago,
    url_guardado: row.url_guardado,
    folio_orden: row.folio_orden,
    fecha_vencimiento: row.fecha_vencimiento,
    total_pesos: Number(row.total_pesos),
    total_umas: Number(row.total_umas),
    created_at: row.created_at,
    concepto_id: row.concepto_id,

    documentosLiberacion,

    dl_tipo_liberacion: row.sl_tipo_liberacion ?? row.dl_tipo_liberacion,
    dl_es_empresa: row.sl_es_empresa ?? row.dl_es_empresa,
    dl_nombre_empresa: row.sl_nombre_empresa ?? row.dl_nombre_empresa,
    dl_rfc_empresa: row.sl_rfc_empresa ?? row.dl_rfc_empresa,
  };
};
