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

  static async registarNuevaInfraccionRP(
    data: Partial<InfraccionDB>,
  ): Promise<any> {
    console.log(data);
    const result = await db.query(
      `
    WITH inserted AS (
        INSERT INTO v2_infracciones (
        correo_infractor,
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
            fecha_limite_descuento,
            monto_final,
            grua_id,
        dependencia_receptora,
            anio_vehiculo,
            tipo_vehiculo,
            estatus,
            estatus_dependencia
        )
        VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
            $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
            $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
            $31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41
        )
        RETURNING *
    )

    SELECT
        inserted.*,

        -- Clasificación de la fracción
        fl.clasificacion,

        -- Concepto relacionado según clasificación
        ccs.concept_id

    FROM inserted

    LEFT JOIN v2_fracciones_ley fl
        ON fl.id = inserted.fraccion_id

    LEFT JOIN v2_catalogo_conceptos_sa7 ccs
        ON ccs.clasificacion_type = fl.clasificacion
    `,
      [
        data.correoInfractor,
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
        data.fecha_limite_descuento ?? "",
        data.monto_final,
        "11564675-0e54-49ec-8f73-8ea24a1556c4",
        data.dependenciaRemisora ?? null,
        data.anioVehiculo,
        data.tipoVehiculo,
        data.estatus ?? "REGISTRADA",
        data.estatus_dependencia ?? "NO APLICA",
      ],
    );

    return result.rows[0];
  }
  // Traer toda la data para vista de ciudadano publica

  static async obtenerDatosInfraccionCiudadanoRP(id: string) {
    const result = await db.query(
      `
    SELECT
        i.*,

        -- Clasificación de la fracción
        vfl.clasificacion,

        -- Datos de orden de pago
        ops.id AS orden_pago_local_id,
        ops.orden_pago_id,
        ops.estatus,
        ops.url_pago,
        ops.url_guardado,
        ops.folio_orden,
        ops.fecha_vencimiento,
        ops.total_pesos,
        ops.total_umas,
        ops.created_at AS orden_pago_created_at,
        ops.concepto_id,

        -- Datos de solicitud de liberación
        sl.id AS sl_id,
        sl.tipo_liberacion AS sl_tipo_liberacion,
        sl.es_empresa AS sl_es_empresa,
        sl.nombre_empresa AS sl_nombre_empresa,
        sl.rfc_empresa AS sl_rfc_empresa,
        sl.estatus AS sl_estatus,

        -- Documentos (agregados como JSON)
        CASE
            WHEN COUNT(dl.id) = 0 THEN '[]'::jsonb
            ELSE jsonb_agg(
                jsonb_build_object(
                    'tipo', dl.tipo_documento,
                    'url', dl.url_documento,
                    'label', COALESCE((
                        SELECT 'Factura' WHERE dl.tipo_documento = 'factura'
                    ), (
                        SELECT 'INE del titular' WHERE dl.tipo_documento = 'ine_titular'
                    ), (
                        SELECT 'Comprobante de domicilio' WHERE dl.tipo_documento = 'comprobante_domicilio'
                    ), (
                        SELECT 'Tarjeta de circulación' WHERE dl.tipo_documento = 'tarjeta_circulacion'
                    ), (
                        SELECT 'INE del propietario anterior' WHERE dl.tipo_documento = 'ine_propietario_anterior'
                    ), (
                        SELECT 'Oficio de liberación fiscalía' WHERE dl.tipo_documento = 'oficio_liberacion_fiscalia'
                    ), (
                        SELECT 'Oficio de liberación juzgado' WHERE dl.tipo_documento = 'oficio_liberacion_juzgado'
                    ), (
                        SELECT 'INE del representante legal' WHERE dl.tipo_documento = 'ine_representante_legal'
                    ), (
                        SELECT 'Poder notarial' WHERE dl.tipo_documento = 'poder_notarial'
                    ), (
                        SELECT 'Acta constitutiva' WHERE dl.tipo_documento = 'acta_constitutiva'
                    ), (
                        SELECT 'Constancia de situación fiscal' WHERE dl.tipo_documento = 'constancia_situacion_fiscal'
                    ), dl.tipo_documento)
                )
                ORDER BY dl.created_at
            )
        END AS documentos_liberacion_json

    FROM v2_infracciones i

    JOIN v2_fracciones_ley vfl
        ON i.fraccion_id = vfl.id

    LEFT JOIN v2_ordenes_pago_sa7 ops
        ON ops.infraccion_id = i.id

    LEFT JOIN v2_solicitudes_liberacion sl
        ON sl.infraccion_id = i.id

    LEFT JOIN v2_documentos_liberacion dl
        ON dl.solicitud_id = sl.id

    WHERE i.id = $1
    GROUP BY i.id, vfl.clasificacion, ops.id, ops.orden_pago_id, ops.estatus,
             ops.url_pago, ops.url_guardado, ops.folio_orden,
             ops.fecha_vencimiento, ops.total_pesos, ops.total_umas,
             ops.created_at, ops.concepto_id, sl.id, sl.tipo_liberacion,
             sl.es_empresa, sl.nombre_empresa, sl.rfc_empresa, sl.estatus
    `,
      [id],
    );

    return result.rows[0] || null;
  }
}
