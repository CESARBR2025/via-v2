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

    // 1. Validamos la clave por seguridad
    const dependenciasValidas = ["FISCALIA", "JUZGADO", "MW"];
    if (!dependenciasValidas.includes(dependencia)) {
      throw new Error(`Dependencia no autorizada o inválida: ${dependencia}`);
    }

    const values: any[] = [];
    let query = "";

    // 2. Control de Flujo Dinámico
    if (dependencia === "MW") {
      console.log("-> Buscando el ID dinámico para la grúa 'MW'...");

      // 2.A: Consultamos el ID de la grúa basándonos en su columna 'nombre'
      const queryGrua = `SELECT id FROM v2_gruas WHERE nombre = $1 LIMIT 1`;
      const resultGrua = await pool.query(queryGrua, ["MW"]);

      // Si no encuentra la grúa con ese nombre, detenemos el proceso con un error descriptivo
      if (resultGrua.rows.length === 0) {
        throw new Error(
          "No se encontró ningún registro en 'v2_gruas' con el nombre 'MW'",
        );
      }

      const idGruaDinamico = resultGrua.rows[0].id;
      console.log(`-> ID de grúa recuperado con éxito: ${idGruaDinamico}`);

      // 2.B: Armamos la query principal usando el ID que acabamos de descubrir
      query = `
      SELECT
        i.id,
        i.folio,
        i.estatus,
        i.placa,
        i.created_at,
        i.correo_infractor,
        i.nombre_infractor
      FROM v2_infracciones i
      WHERE i.garantia_retenida = 'VEHICULO'
        AND i.estatus != 'LIBERADA'
        AND i.grua_id = $1
    `;

      // El primer parámetro ($1) de esta query será el ID que encontramos en el paso A
      values.push(idGruaDinamico);
    } else if (dependencia === "FISCALIA") {
      console.log("entro aqui");
      console.log(dependencia);
      // Flujo estándar para Dependencias (FISCALIA, JUZGADO_CIVICO)
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
    } else {
      console.log("entro");
      console.log(dependencia);
      // Flujo estándar para Dependencias (FISCALIA, JUZGADO_CIVICO)
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
    }
    console.log("paso");

    // 3. Condicionales Opcionales de Fechas (reutilizando las posiciones $2 y $3)
    if (from && to) {
      const fechaColumna = dependencia === "MW" ? "i.created_at" : "created_at";
      query += ` AND ${fechaColumna} BETWEEN $${values.length + 1} AND $${values.length + 2}`;
      values.push(from, to);
    }

    // Cierre de la consulta uniforme
    const ordenColumna = dependencia === "MW" ? "i.created_at" : "created_at";
    query += ` ORDER BY ${ordenColumna} DESC`;

    try {
      const result = await pool.query(query, values);
      console.log(result);

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

    i.es_titular,
    i.no_oficio_fiscalia,
    i.url_oficio_fiscalia,
    i.estatus_dependencia,
    i.no_carpeta_investigacion

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
