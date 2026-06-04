// repository/infraccion.repository.ts

import { POOL_PG as pool } from "@/lib/db";

export class DepInfraccionesRepository {
  static async getInfraccionesFiltradasRepository(params: {
    from: string;
    to: string;
  }) {
    console.log("entro");

    const { from, to } = params;

    const query = `
        SELECT
        id,
        folio,
        estatus,
        placa,
        created_at,
        correo_infractor,
        nombre_infractor
      FROM v2_infracciones
      WHERE tipo_garantia != 'VEHICULO'
        AND estatus != 'PAGADA'
      ORDER BY created_at DESC

    `;

    const values = [from, to];

    const result = await pool.query(query);
    console.log(result);

    return {
      rows: result.rows,
    };
  }

  //Listar infracciones de oficiales realizdas
  static async getInfraccionesRealizadasOficialRP(params: {
    from: string;
    to: string;
  }) {
    console.log("entro");

    const { from, to } = params;

    const query = `
        SELECT
        id,
        folio,
        estatus,
        placa,
        created_at,
        correo_infractor,
        nombre_infractor
      FROM v2_infracciones
      ORDER BY created_at DESC

    `;

    const values = [from, to];

    const result = await pool.query(query);
    console.log(result);

    return {
      rows: result.rows,
    };
  }

  //Listar infracciones de fiscalia
  static async getInfraccionesFiscaliaFiltradasRepository(params: {
    from: string;
    to: string;
  }) {
    console.log("entro");

    const { from, to } = params;

    const query = `
         SELECT
        id,
        folio,
        estatus,
        placa,
        created_at,
        correo_infractor,
        nombre_infractor
      FROM v2_infracciones
      WHERE tipo_garantia  = 'VEHICULO'
        AND estatus != 'LIBERADA'
        AND dependencia_receptora = 'FISCALIA'
      ORDER BY created_at DESC

    `;

    const values = [from, to];

    const result = await pool.query(query);
    console.log(result);

    return {
      rows: result.rows,
    };
  }

  static async contarRegistrosInfracciones(params: {
    from: string;
    to: string;
  }) {
    const { from, to } = params;

    const query = `
      SELECT COUNT(*)::int AS total
      FROM v2_infracciones
      WHERE tipo_garantia != 'VEHICULO'        
        AND created_at BETWEEN $1 AND $2
    `;

    const result = await pool.query(query, [from, to]);

    return result.rows[0].total;
  }

  // Contar registros de fiscalia
  static async contarRegistrosFiscaliaInfracciones(params: {
    from: string;
    to: string;
  }) {
    const { from, to } = params;

    const query = `
      SELECT COUNT(*)::int AS total
      FROM v2_infracciones
      WHERE tipo_garantia = 'VEHICULO'   
      AND dependencia_receptora = 'FISCALIA'     
        AND created_at BETWEEN $1 AND $2
    `;

    const result = await pool.query(query, [from, to]);

    return result.rows[0].total;
  }

  static async detalleInfraccionRP(id: string) {
    const query = `
  SELECT 
    i.evidencias,
    i.url_inapam,
    i.url_ine,
    i.url_tarjeta_circulacion,
    
    i.id,
    i.folio,
    i.estatus,
    i.created_at,


    i.articulo_id,
    a.descripcion as articulo_descripcion,
    i.fraccion_id,
    f.descripcion as fraccion_descripcion,

    i.nombre_infractor,
    i.apellido_paterno_infractor,
    i.apellido_materno_infractor,
    i.curp_infractor,
    i.marca,
    i.modelo,
    i.color,
    i.placa,
    i.correo_infractor,

    i.latitud,
    i.longitud,
    i.codigo_postal,
    i.calle,
    i.numero,
    i.municipio,
    i.estado,
    

    i.tipo_garantia,
    i.garantia_entregada,

    o.total_umas,
    o.total_pesos,

    i.es_titular

  FROM v2_infracciones i
  LEFT JOIN v2_ordenes_pago_sa7 o
    ON o.infraccion_id = i.id
  JOIN v2_articulos_ley a on i.articulo_id = a.id
  JOIN v2_fracciones_ley f on i.fraccion_id = f.id
  WHERE i.id = $1 
  ORDER BY o.created_at DESC
  LIMIT 1;
`;

    const result = await pool.query(query, [id]);

    return result.rows[0];
  }
}
