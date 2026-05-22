import { POOL_PG as db } from "@/lib/db";
import { InfraccionDB } from "./types.";

export class InfraccionesRepository {
  static async obtenerSiguienteSecuencia(): Promise<number> {
    const result = await db.query<{
      nextval: string;
    }>(`
            select nextval('seq_folios_infraccion')
        `);

    return Number(result.rows[0].nextval);
  }

  static async crear(data: Partial<InfraccionDB>): Promise<InfraccionDB> {
    const result = await db.query<InfraccionDB>(
      `
            insert into v2_infracciones (
                folio,
                seq_valor,
                oficial_id,
                patrulla_id,
                placa_patrulla,
                articulo_id,
                fraccion_id,
                ciudadano_presente,
                es_titular,
                presenta_ine,
                curp_infractor,
                nombre_infractor,
                apellido_paterno_infractor,
                apellido_materno_infractor,
                marca,
                modelo,
                color,
                placa,
                latitud,
                longitud,
                codigo_postal,
                colonia,
                calle,
                numero,
                municipio,
                estado,
                tipo_garantia,
                garantia_entregada,
                motivo_retencion,
                monto_total,
                aplica_descuento_inapam,
                descuento_aplicado,
                pago_al_momento,
                fecha_limite_descuento,
                monto_final,
                grua_id
            )
            values (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
                $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
                $31,$32,$33,$34,$35,$36
            )
            returning *
            `,
      [
        data.folio,
        data.seq_valor,
        data.oficial_id,
        data.patrulla_id,
        data.placa_patrulla,
        data.articulo_id,
        data.fraccion_id,
        data.ciudadano_presente,
        data.es_titular,
        data.presenta_ine,
        data.curp_infractor,
        data.nombre_infractor,
        data.apellido_paterno_infractor,
        data.apellido_materno_infractor,
        data.marca,
        data.modelo,
        data.color,
        data.placa,
        data.latitud,
        data.longitud,
        data.codigo_postal,
        data.colonia,
        data.calle,
        data.numero,
        data.municipio,
        data.estado,
        data.tipo_garantia,
        data.garantia_entregada,
        data.motivo_retencion,
        data.monto_total,
        data.aplica_descuento_inapam,
        data.descuento_aplicado,
        data.pago_al_momento,
        data.fecha_limite_descuento,
        data.monto_final,
        data.grua_id,
      ],
    );

    return result.rows[0];
  }

  // Traer toda la data para vista de ciudadano publica
  static async obtenerPorId(id: string) {
    const result = await db.query(
      `
      select
        id,
        folio,
        estatus,
        created_at,

        monto_total,
        monto_final,

        ciudadano_presente,
        es_titular,
        presenta_ine,

        placa,
        marca,
        modelo,
        color,



        tipo_garantia,
        garantia_entregada,
        motivo_retencion,

        latitud,
        longitud,
        calle,
        numero,
        colonia,
        municipio,
        estado,

        articulo_id,
        fraccion_id

      from v2_infracciones
      where id = $1
      `,
      [id],
    );

    return result.rows[0] || null;
  }
}
