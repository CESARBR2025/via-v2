// types/infraccion.types.ts

export type InfraccionListItem = {
  nombre_infractor: string;
  correo_infractor: string;
  id: number;
  folio: string;
  estatus: string;
  placa: string | null;
  created_at: string;
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
  };

  Infraccion: {
    articulo_descripcion: string;
    fraccion_descripcion: string;
    total_umas: number;
    total_pesos: number;
  };

  datos_infractor: {
    nombre_infractor: string;
    correo_infractor: string | null;
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
