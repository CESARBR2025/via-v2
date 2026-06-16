import { POOL_PG } from "@/lib/db";
import { DepartamentoDB } from "./types";

export class DepartamentosRepository {
  static async listar(activo?: boolean): Promise<DepartamentoDB[]> {
    const conditions: string[] = [];
    const values: any[] = [];

    if (activo !== undefined) {
      conditions.push(`activo = $1`);
      values.push(activo);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await POOL_PG.query(`
      SELECT id, nombre, activo
      FROM v2_departamentos_oficiales
      ${where}
      ORDER BY nombre ASC
    `, values);

    return result.rows;
  }

  static async obtenerPorId(id: string): Promise<DepartamentoDB | null> {
    const result = await POOL_PG.query(`
      SELECT id, nombre, activo FROM v2_departamentos_oficiales WHERE id = $1
    `, [id]);

    return result.rows[0] || null;
  }

  static async obtenerPorNombre(nombre: string): Promise<DepartamentoDB | null> {
    const result = await POOL_PG.query(`
      SELECT id, nombre, activo FROM v2_departamentos_oficiales WHERE UPPER(nombre) = UPPER($1)
    `, [nombre]);

    return result.rows[0] || null;
  }

  static async crear(nombre: string): Promise<string> {
    const result = await POOL_PG.query(`
      INSERT INTO v2_departamentos_oficiales (nombre) VALUES ($1) RETURNING id
    `, [nombre.toUpperCase()]);

    return result.rows[0].id;
  }

  static async actualizar(id: string, nombre: string): Promise<boolean> {
    const result = await POOL_PG.query(`
      UPDATE v2_departamentos_oficiales SET nombre = $1 WHERE id = $2
    `, [nombre.toUpperCase(), id]);

    return (result.rowCount ?? 0) > 0;
  }

  static async toggleActivo(id: string, activo: boolean): Promise<boolean> {
    const result = await POOL_PG.query(`
      UPDATE v2_departamentos_oficiales SET activo = $1 WHERE id = $2
    `, [activo, id]);

    return (result.rowCount ?? 0) > 0;
  }
}
