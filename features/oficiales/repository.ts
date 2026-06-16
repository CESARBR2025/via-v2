import { POOL_PG } from "@/lib/db";
import { CrearOficialDTO, ActualizarOficialDTO, ListarOficialesParams } from "./types";

export class OficialesRepository {
  static async listar(params: ListarOficialesParams) {
    const { search, activo, departamentoId, page, limit } = params;
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (search) {
      conditions.push(`(
        u.nombres ILIKE $${idx} OR
        u.apellido_p ILIKE $${idx} OR
        u.apellido_m ILIKE $${idx} OR
        u.curp ILIKE $${idx} OR
        o.numero_empleado ILIKE $${idx}
      )`);
      values.push(`%${search}%`);
      idx++;
    }

    if (activo !== undefined) {
      conditions.push(`o.activo = $${idx}`);
      values.push(activo);
      idx++;
    }

    if (departamentoId) {
      conditions.push(`o.departamento_id = $${idx}`);
      values.push(departamentoId);
      idx++;
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM v2_oficiales o
      INNER JOIN v2_usuarios u ON u.id = o.usuario_id
      ${whereClause}
    `;

    const dataQuery = `
      SELECT
        o.id,
        o.usuario_id,
        o.numero_empleado,
        u.nombres,
        u.apellido_p,
        u.apellido_m,
        u.curp,
        u.correo,
        o.telefono,
        o.departamento_id,
        d.nombre AS departamento_nombre,
        o.rango_id,
        r.nombre AS rango_nombre,
        o.patrulla_id,
        p.numero_unidad AS patrulla_unidad,
        o.sector_id,
        s.nombre AS sector_nombre,
        o.fecha_ingreso,
        o.activo,
        o.created_at
      FROM v2_oficiales o
      INNER JOIN v2_usuarios u ON u.id = o.usuario_id
      LEFT JOIN v2_patrullas p ON p.id = o.patrulla_id
      LEFT JOIN v2_sectores s ON s.id = o.sector_id
      LEFT JOIN v2_departamentos_oficiales d ON d.id = o.departamento_id
      LEFT JOIN v2_rangos_oficiales r ON r.id = o.rango_id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const offset = (page - 1) * limit;
    values.push(limit, offset);

    const [countResult, dataResult] = await Promise.all([
      POOL_PG.query(countQuery, values.slice(0, -2)),
      POOL_PG.query(dataQuery, values),
    ]);

    return {
      data: dataResult.rows,
      total: countResult.rows[0].total,
    };
  }

  static async obtenerPorId(id: string) {
    const result = await POOL_PG.query(`
      SELECT
        o.id,
        o.usuario_id,
        o.numero_empleado,
        u.nombres,
        u.apellido_p,
        u.apellido_m,
        u.curp,
        u.correo,
        o.telefono,
        o.departamento_id,
        d.nombre AS departamento_nombre,
        o.rango_id,
        r.nombre AS rango_nombre,
        o.patrulla_id,
        p.numero_unidad AS patrulla_unidad,
        o.sector_id,
        s.nombre AS sector_nombre,
        o.fecha_ingreso,
        o.activo,
        o.created_at,
        o.updated_at
      FROM v2_oficiales o
      INNER JOIN v2_usuarios u ON u.id = o.usuario_id
      LEFT JOIN v2_patrullas p ON p.id = o.patrulla_id
      LEFT JOIN v2_sectores s ON s.id = o.sector_id
      LEFT JOIN v2_departamentos_oficiales d ON d.id = o.departamento_id
      LEFT JOIN v2_rangos_oficiales r ON r.id = o.rango_id
      WHERE o.id = $1
    `, [id]);

    return result.rows[0] || null;
  }

  static async obtenerPorUsuarioId(usuarioId: string) {
    const result = await POOL_PG.query(`
      SELECT id FROM v2_oficiales WHERE usuario_id = $1
    `, [usuarioId]);

    return result.rows[0] || null;
  }

  static async obtenerPorUsuarioIdCompleto(usuarioId: string) {
    const result = await POOL_PG.query(`
      SELECT
        o.id,
        o.usuario_id,
        o.numero_empleado,
        u.nombres,
        u.apellido_p,
        u.apellido_m,
        u.curp,
        u.correo,
        o.telefono,
        o.departamento_id,
        d.nombre AS departamento_nombre,
        o.rango_id,
        r.nombre AS rango_nombre,
        o.patrulla_id,
        p.numero_unidad AS patrulla_unidad,
        p.placas AS patrulla_placas,
        o.sector_id,
        s.nombre AS sector_nombre,
        o.fecha_ingreso,
        o.activo,
        o.created_at,
        o.updated_at
      FROM v2_oficiales o
      INNER JOIN v2_usuarios u ON u.id = o.usuario_id
      LEFT JOIN v2_patrullas p ON p.id = o.patrulla_id
      LEFT JOIN v2_sectores s ON s.id = o.sector_id
      LEFT JOIN v2_departamentos_oficiales d ON d.id = o.departamento_id
      LEFT JOIN v2_rangos_oficiales r ON r.id = o.rango_id
      WHERE o.usuario_id = $1
    `, [usuarioId]);

    return result.rows[0] || null;
  }

  static async obtenerPorNumeroEmpleado(numeroEmpleado: string) {
    const result = await POOL_PG.query(`
      SELECT id FROM v2_oficiales WHERE numero_empleado = $1
    `, [numeroEmpleado]);

    return result.rows[0] || null;
  }

  static async buscarUsuarioPorCurp(curp: string) {
    const result = await POOL_PG.query(`
      SELECT id, nombres, apellido_p, apellido_m, curp, correo
      FROM v2_usuarios
      WHERE curp = $1 AND activo = true
    `, [curp]);

    return result.rows[0] || null;
  }

  static async asignarRolOficial(usuarioId: string) {
    await POOL_PG.query(`
      INSERT INTO v2_usuarios_roles (usuario_id, rol_id)
      SELECT $1, id FROM v2_roles WHERE nombre = 'oficial'
      ON CONFLICT DO NOTHING
    `, [usuarioId]);
  }

  static async crear(data: CrearOficialDTO & { usuario_id: string }) {
    const result = await POOL_PG.query(`
      INSERT INTO v2_oficiales (
        usuario_id, numero_empleado, telefono, departamento_id,
        rango_id, patrulla_id, sector_id, fecha_ingreso
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date)
      RETURNING id
    `, [
      data.usuario_id,
      data.numeroEmpleado,
      data.telefono ?? null,
      data.departamentoId ?? null,
      data.rangoId ?? null,
      data.patrullaId ?? null,
      data.sectorId ?? null,
      data.fechaIngreso ?? null,
    ]);

    return result.rows[0].id;
  }

  static async actualizar(id: string, data: ActualizarOficialDTO) {
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.numeroEmpleado !== undefined) {
      sets.push(`numero_empleado = $${idx++}`);
      values.push(data.numeroEmpleado);
    }
    if (data.telefono !== undefined) {
      sets.push(`telefono = $${idx++}`);
      values.push(data.telefono);
    }
    if (data.departamentoId !== undefined) {
      sets.push(`departamento_id = $${idx++}`);
      values.push(data.departamentoId);
    }
    if (data.rangoId !== undefined) {
      sets.push(`rango_id = $${idx++}`);
      values.push(data.rangoId);
    }
    if (data.patrullaId !== undefined) {
      sets.push(`patrulla_id = $${idx++}`);
      values.push(data.patrullaId);
    }
    if (data.sectorId !== undefined) {
      sets.push(`sector_id = $${idx++}`);
      values.push(data.sectorId);
    }
    if (data.fechaIngreso !== undefined) {
      sets.push(`fecha_ingreso = $${idx++}::date`);
      values.push(data.fechaIngreso);
    }
    if (data.activo !== undefined) {
      sets.push(`activo = $${idx++}`);
      values.push(data.activo);
    }

    if (sets.length === 0) return null;

    values.push(id);

    const result = await POOL_PG.query(`
      UPDATE v2_oficiales
      SET ${sets.join(", ")}
      WHERE id = $${idx}
      RETURNING id
    `, values);

    return result.rows[0]?.id || null;
  }

  static async listarDepartamentos() {
    const result = await POOL_PG.query(`
      SELECT id, nombre FROM v2_departamentos_oficiales WHERE activo = true ORDER BY nombre ASC
    `);

    return result.rows;
  }

  static async listarSectoresActivos() {
    const result = await POOL_PG.query(`
      SELECT id, nombre FROM v2_sectores WHERE activo = true ORDER BY nombre ASC
    `);
    return result.rows;
  }

  static async listarPatrullasActivas() {
    const result = await POOL_PG.query(`
      SELECT id, numero_unidad, placas
      FROM v2_patrullas
      WHERE activo = true
      ORDER BY numero_unidad
    `);

    return result.rows;
  }

  static async listarRangosActivos() {
    const result = await POOL_PG.query(`
      SELECT id, nombre FROM v2_rangos_oficiales WHERE activo = true ORDER BY nombre ASC
    `);
    return result.rows;
  }
}
