// repository/infraccion.repository.ts

import { POOL_PG as pool } from "@/lib/db";

// Endpoint generico
interface FiltroInfraccionesParams {
  dependencia: string; // La clave que determina el flujo
  from?: string; // Opcionales por si en el primer render no filtran fechas
  to?: string;
}

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
    userId: string;
  }) {
    console.log("entro");

    const { from, to, userId } = params;

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
      WHERE oficial_id = $1
      ORDER BY created_at DESC

    `;

    const values = [userId];
    console.log(values);

    const result = await pool.query(query, values);
    console.log(result);

    return {
      rows: result.rows,
    };
  }

  static async getInfraccionesFiltradasPorDependenciaRepository(
    params: FiltroInfraccionesParams,
  ) {
    console.log(
      "=== Iniciando consulta de infracciones para:",
      params.dependencia,
    );

    const { dependencia, from, to } = params;
    console.log(dependencia);

    // 1. Validamos la clave por seguridad
    const dependenciasValidas = [
      "FISCALIA",
      "JUZGADO",
      "MW",
      "MEJIA",
      "LIBERACIONES",
      "INFRACCIONES",
    ];
    if (!dependenciasValidas.includes(dependencia)) {
      console.log(dependencia);
      throw new Error(`Dependencia no autorizada o inválida: ${dependencia}`);
    }

    let query = "";
    const values: any[] = [];

    // 2. Construir la query según el tipo de dependencia
    if (dependencia === "MW" || dependencia === "MEJIA") {
      console.log("-> Buscando el ID dinámico para la grúa 'MW'...");

      // Obtener el ID de la grúa
      const queryGrua = `SELECT id FROM v2_gruas WHERE nombre = $1 LIMIT 1`;
      const resultGrua = await pool.query(queryGrua, ["MW"]);

      if (resultGrua.rows.length === 0) {
        throw new Error(
          "No se encontró ningún registro en 'v2_gruas' con el nombre 'MW'",
        );
      }

      const idGruaDinamico = resultGrua.rows[0].id;
      console.log(`-> ID de grúa recuperado con éxito: ${idGruaDinamico}`);

      // Query para MW (basada en grúa)
      query = `

            SELECT
          id,
          folio,
          estatus,
          placa,
          created_at,
          correo_infractor,
          nombre_infractor,
          estatus_dependencia
        FROM v2_infracciones
        WHERE tipo_garantia = 'VEHICULO'
        AND estatus_dependencia IN ('LIBERADO_POR_LIBERACIONES', 'EN_REVISION_MW', 'CERRADA')
          AND grua_id = $1


      `;
      values.push(idGruaDinamico);
    } else if (dependencia === "FISCALIA" || dependencia === "JUZGADO") {
      // Query estándar para dependencias legales
      console.log(`-> Buscando infracciones para: ${dependencia}`);

      query = `
        SELECT
          id,
          folio,
          estatus,
          placa,
          created_at,
          correo_infractor,
          nombre_infractor,
          estatus_dependencia,
          no_carpeta_investigacion
        FROM v2_infracciones
        WHERE tipo_garantia = 'VEHICULO'
          AND estatus = 'REGISTRADA'
          AND dependencia_receptora = $1

          
      `;
      values.push(dependencia);
    } else if (dependencia === "LIBERACIONES") {
      console.log(`-> Buscando infracciones para: ${dependencia}`);

      query = `
       SELECT
          id,
          folio,
          estatus,
          placa,
          created_at,
          correo_infractor,
          nombre_infractor,
          estatus_dependencia,
          no_carpeta_investigacion
        FROM v2_infracciones
        WHERE estatus_dependencia IN ('ESPERA_REVISION', 'EN_PROCESO_LIBERACIONES', 'LIBERADO_POR_LIBERACIONES') 
      
      `;
    } else if (dependencia === "LIBERACIONES") {
      console.log(`-> Buscando infracciones para: ${dependencia}`);

      query = `
       SELECT
          id,
          folio,
          estatus,
          placa,
          created_at,
          correo_infractor,
          nombre_infractor,
          estatus_dependencia,
          no_carpeta_investigacion
        FROM v2_infracciones
        WHERE estatus_dependencia IN ('ESPERA_REVISION', 'EN_PROCESO_LIBERACIONES', 'LIBERADO_POR_LIBERACIONES') 
      
      `;
    } else if (dependencia === "INFRACCIONES") {
      console.log(`-> Buscando infracciones para: ${dependencia}`);

      query = `
     SELECT
          i.id,
          i.folio,
          i.estatus,
          i.placa,
          i.created_at,
          i.correo_infractor,
          i.nombre_infractor,
          i.estatus_dependencia,
          i.no_carpeta_investigacion,
          i.nombre_titular_liberacion,
          i.appaterno_titular_liberacion,
          i.apmaterno_titular_liberacion,
          ops.estatus AS estatus_orden_pago
        FROM v2_infracciones i
        LEFT JOIN v2_ordenes_pago_sa7 ops ON ops.infraccion_id = i.id
        WHERE i.tipo_garantia != 'VEHICULO'
          AND (
            i.estatus_dependencia IN ('PENDIENTE_DATOS_INFRACTOR', 'PENDIENTE_PAGO_INFRACCION', 'PENDIENTE_PAGO_INSTANTE', 'PENDIENTE_ENTREGA_GARANTIA', 'LIBERADO_POR_INFRACCIONES')
            OR
            (i.estatus_dependencia IS NULL AND i.estatus = 'PENDIENTE_DATOS_INFRACTOR')
          )
          
      `;
    }

    // 3. Ordenar resultados
    query += ` ORDER BY created_at DESC`;

    // 4. Ejecutar query
    try {
      let result;

      if (dependencia === "LIBERACIONES") {
        result = await pool.query(query);
      } else {
        result = await pool.query(query, values);
      }
      console.log(`Se encontraron ${result.rowCount} registros`);

      console.log(result.rows);
      return {
        data: result.rows,
        total: result.rowCount ?? result.rows.length,
      };
    } catch (error) {
      console.error(
        `Error en repositorio para la dependencia ${dependencia}:`,
        error,
      );
      throw new Error("Error interno al consultar la base de datos");
    }
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

  // Contar registros por dependencia (genérico para FISCALIA, JUZGADO, MW, MEJIA)
  static async contarRegistrosPorDependenciaInfracciones(params: {
    dependencia: string;
  }) {
    const { dependencia } = params;

    // 1. Validamos la dependencia
    const dependenciasValidas = [
      "FISCALIA",
      "JUZGADO",
      "MW",
      "MEJIA",
      "LIBERACIONES",
      "INFRACCIONES",
    ];
    if (!dependenciasValidas.includes(dependencia)) {
      throw new Error(`Dependencia no autorizada o inválida: ${dependencia}`);
    }

    let query = "";
    const values: any[] = [];

    // 2. Construir la query según el tipo de dependencia
    if (dependencia === "MW") {
      // Obtener el ID de la grúa
      const queryGrua = `SELECT id FROM v2_gruas WHERE nombre = $1 LIMIT 1`;
      const resultGrua = await pool.query(queryGrua, ["MW"]);

      if (resultGrua.rows.length === 0) {
        throw new Error(
          "No se encontró ningún registro en 'v2_gruas' con el nombre 'MW'",
        );
      }

      const idGruaDinamico = resultGrua.rows[0].id;

      // Query para MW (basada en grúa)
      query = `
      SELECT COUNT(*)::int AS total
      FROM v2_infracciones
      WHERE tipo_garantia  = 'VEHICULO'
      AND estatus_dependencia IN ('LIBERADO_POR_LIBERACIONES', 'CERRADA', 'EN_REVISION_MW')
        AND grua_id = $1
    `;
      values.push(idGruaDinamico);
    } else if (dependencia === "LIBERACIONES") {
      query = `
      SELECT COUNT(*)::int AS total
      FROM v2_infracciones
      WHERE estatus_dependencia IN ('ESPERA_REVISION', 'EN_PROCESO_LIBERACIONES')
    `;
    } else if (dependencia === "INFRACCIONES") {
      query = `
      SELECT COUNT(*)::int AS total
      FROM v2_infracciones
      where estatus IN ('PENDIENTE_ORDEN_PAGO', 'REGISTRADA') 
        and tipo_garantia != 'VEHICULO'
       
    `;
    } else {
      // Query estándar para FISCALIA, JUZGADO, MEJIA
      query = `
      SELECT COUNT(*)::int AS total
      FROM v2_infracciones
      WHERE tipo_garantia = 'VEHICULO'
        AND estatus = 'REGISTRADA'
        AND dependencia_receptora = $1
    `;
      values.push(dependencia);
    }

    try {
      const result = await pool.query(query, values);
      return result.rows[0].total;
    } catch (error) {
      console.error(
        `Error al contar registros para la dependencia ${dependencia}:`,
        error,
      );
      throw new Error("Error interno al consultar la base de datos");
    }
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
    i.nombre_titular_liberacion,
    i.appaterno_titular_liberacion,
    i.apmaterno_titular_liberacion,
  


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

    i.es_titular,
    i.no_oficio_fiscalia,
    i.url_oficio_fiscalia,
    i.estatus_dependencia,
    i.no_carpeta_investigacion,
    i.url_oficio_pago_corralon,
    o.estatus as estatus_orden_pago

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
