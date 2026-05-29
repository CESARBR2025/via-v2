// app/api/buscadorGlobal/registrar-infractor/route.ts

import { NextRequest, NextResponse } from "next/server";

import { POOL_PG as pool } from "@/lib/db";

import { enviarCorreoInfraccion } from "@/features/emails/server";

/**
 * POST
 * Registrar datos del infractor
 */
export async function POST(req: NextRequest) {
  try {
    console.log("entro");

    /**
     * Body
     */
    const body = await req.json();

    const {
      folio,
      nombre_infractor,
      ap_Paterno_Infractor,
      ap_Materno_Infractor,
      correo_infractor,
    } = body;

    /**
     * Validaciones
     */
    if (!folio) {
      return NextResponse.json(
        {
          message: "infraccion_id es requerido",
        },
        {
          status: 400,
        },
      );
    }

    if (!nombre_infractor) {
      return NextResponse.json(
        {
          message: "nombre_infractor es requerido",
        },
        {
          status: 400,
        },
      );
    }

    if (!correo_infractor) {
      return NextResponse.json(
        {
          message: "correo_infractor es requerido",
        },
        {
          status: 400,
        },
      );
    }

    if (!ap_Paterno_Infractor) {
      return NextResponse.json(
        {
          message: "Ap paterno es requerido",
        },
        {
          status: 400,
        },
      );
    }

    if (!ap_Materno_Infractor) {
      return NextResponse.json(
        {
          message: "Ap materno es requerido",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * Update DB
     */
    const query = `
      UPDATE public.v2_infracciones
      SET
          nombre_infractor = $1,
          apellido_paterno_infractor = $2,
          apellido_materno_infractor = $3,
          correo_infractor = $4,
          ciudadano_presente = true,
          updated_at = NOW()
      WHERE folio = $5
      RETURNING
          id,
          folio,
          nombre_infractor,
          apellido_paterno_infractor,
          apellido_materno_infractor,
          correo_infractor,
          ciudadano_presente,
          updated_at;
    `;

    const values = [
      nombre_infractor,
      ap_Paterno_Infractor,
      ap_Materno_Infractor,
      correo_infractor,
      folio,
    ];

    const result = await pool.query(query, values);

    /**
     * No encontrada
     */
    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          message: "Infracción no encontrada",
        },
        {
          status: 404,
        },
      );
    }

    /**
     * Data actualizada
     */
    const infraccion = result.rows[0];

    /**
     * Enviar correo
     */
    try {
      await enviarCorreoInfraccion({
        idInfraccion: infraccion.id,
        correoInfractor: infraccion.correo_infractor,
        nombreInfractor: `${infraccion.nombre_infractor} ${infraccion.apellido_paterno_infractor}`,
        folio: infraccion.folio,
      });

      console.log("[MAIL][OK]");
    } catch (mailError) {
      console.error("[MAIL][ERROR]", mailError);

      // NO romper el flujo por el correo
    }

    /**
     * Success
     */
    return NextResponse.json(
      {
        ok: true,
        infraccion,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("[API][REGISTRAR_INFRACCION]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error registrando infractor",
      },
      {
        status: 500,
      },
    );
  }
}
