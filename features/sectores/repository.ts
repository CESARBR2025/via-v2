import { POOL_PG } from "@/lib/db";
import { SectorDB } from "./types";

export class SectoresRepository {
  static async listar(activo?: boolean): Promise<SectorDB[]> {
    const conditions: string[] = [];
    const values: any[] = [];

    if (activo !== undefined) {
      conditions.push(`activo = $1`);
      values.push(activo);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await POOL_PG.query(`
      SELECT id, nombre, activo
      FROM v2_sectores
      ${where}
      ORDER BY nombre ASC
    `, values);

    return result.rows;
  }

  static async obtenerPorId(id: string): Promise<SectorDB | null> {
    const result = await POOL_PG.query(`
      SELECT id, nombre, activo FROM v2_sectores WHERE id = $1
    `, [id]);

    return result.rows[0] || null;
  }

  static async obtenerPorNombre(nombre: string): Promise<SectorDB | null> {
    const result = await POOL_PG.query(`
      SELECT id, nombre, activo FROM v2_sectores WHERE UPPER(nombre) = UPPER($1)
    `, [nombre]);

    return result.rows[0] || null;
  }

  static async crear(nombre: string): Promise<string> {
    const result = await POOL_PG.query(`
      INSERT INTO v2_sectores (nombre) VALUES ($1) RETURNING id
    `, [nombre.toUpperCase()]);

    return result.rows[0].id;
  }

  static async actualizar(id: string, nombre: string): Promise<boolean> {
    const result = await POOL_PG.query(`
      UPDATE v2_sectores SET nombre = $1 WHERE id = $2
    `, [nombre.toUpperCase(), id]);

    return (result.rowCount ?? 0) > 0;
  }

  static async toggleActivo(id: string, activo: boolean): Promise<boolean> {
    const result = await POOL_PG.query(`
      UPDATE v2_sectores SET activo = $1 WHERE id = $2
    `, [activo, id]);

    return (result.rowCount ?? 0) > 0;
  }
}
