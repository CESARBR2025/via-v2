// types/infraccion.types.ts

export type InfraccionListItem = {
  urlOficioCorralon: string;
  estatusInfraccion: string;

  //extras fiscalia
  estatusDependencia: string;
  no_carpeta_investigacion: string;

  nombre_infractor: string;
  correo_infractor: string;
  id: number;
  folio: string;

  placa: string | null;
  created_at: string;

  estatus_orden_pago?: string;
  nombre_titular_liberacion?: string;
  appaterno_titular_liberacion?: string;
  apmaterno_titular_liberacion?: string;
  url_orden_salida_liberaciones?: string;
};

export type InfraccionListResponse = {
  data: InfraccionListItem[];
  page: number;
  limit: number;
  total: number;
};

// Modal de detalles
export type InfraccionDetail = {
  Header: {
    id_infraccion: string;
    folio_de_infraccion: string;
    fecha_de_registro_de_infraccion: string;
    estatus_de_infraccion: string;
    url_inapam: string;
    url_tarjeta_circulacion: string;
    url_ine: string;
    url_evidencias: string[];
    url_oficio_fiscalia: string;
    no_oficio_fiscalia: string;
    estatus_dependencia: string;
    no_carpeta_investigacion: string;
    url_oficio_pago_corralon?: string;
    url_orden_salida_liberaciones?: string;
    estatus_orden_pago?: string;
  };

  Infraccion: {
    articulo_numero: string;
    articulo_descripcion: string;
    fraccion_numero: string;
    fraccion_descripcion: string;
    total_umas: number;
    total_pesos: number;
  };

  oficial: {
    numero_empleado: string;
    nombre_completo: string;
    patrulla_nombre: string;
    activo: string;
  };

  datos_infractor: {
    es_titular: boolean;
    nombre_infractor: string;
    correo_infractor: string | null;
    curp_infractor: string | null;
    appaterno_infractor: string | null;
    apmaterno_infractor: string | null;

    // Datos de titularidad
    nombre_titular_liberacion: string;
  };

  vehiculo: {
    placa: string;
    tipo: string | null;
    marca: string;
    modelo: string;
    anio: number | null;
    color: string;
  };

  garantia: {
    garantia_retenida: boolean | string | null;
  };

  ubicacion: {
    latitud: number;
    longitud: number;
    calle: string;
    cod_postal: string;
    numero: string;
    municipio: string;
    estado: string;
  };
};
