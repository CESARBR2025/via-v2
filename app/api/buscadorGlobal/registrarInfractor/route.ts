// app/api/buscadorGlobal/registrar-infractor/route.ts

import { NextRequest, NextResponse } from "next/server";

import { POOL_PG as pool } from "@/lib/db";

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
    console.log(body);

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
          message: "correo_infractor es requerido",
        },
        {
          status: 400,
        },
      );
    }
    console.log("paso");

    console.log("[API][REGISTRAR_INFRACCION]", {
      folio,
      nombre_infractor,
      correo_infractor,
    });

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

    console.log(values);
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
     * Success
     */
    console.log("paso");
    return NextResponse.json(
      {
        ok: true,
        infraccion: result.rows[0],
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
