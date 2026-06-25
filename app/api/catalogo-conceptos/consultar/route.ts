//! ENDPOINT PARA LLENAR LA TABLA DE CATALOGO DE CONCEPTOS DESDE SA7

import { NextResponse } from "next/server";

import { POOL_PG as pool } from "@/lib/db";

const SA7_URL =
  "https://sanjuandelrio.sytes.net:3044/api/sasiete/qas/buscar-conceptos?search=Multas%20y%20Sanciones%20Varia&tipo=Carga%20Inicial";

// Conceptos permitidos
const CONCEPTOS_OBJETIVO = ["30844", "30845", "30846"];

// Relación concepto -> clasificación
const CLASIFICACION_MAP: Record<string, "Leve" | "Media" | "Grave"> = {
  "30844": "Leve",
  "30845": "Media",
  "30846": "Grave",
};

export async function GET() {
  try {
    console.log("entro");
    // Obteniendo Bearer token

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://via-v2.vercel.app"
        : "http://localhost:3000";

    const responseTokenGuest = await fetch(`${baseUrl}/api/auth/token-guest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        codigo_invitacion: `INV-${new Date().getTime()}`,
        nombre_invitado: "CESAR IVAN BARCENAS ROSALES",
      }),
    });

    const dataTokenGuest = await responseTokenGuest.json();
    const tokenGuest = dataTokenGuest.data?.token;

    console.log(tokenGuest);

    // 1. Consultar API externa
    const response = await fetch(SA7_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenGuest}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: "Error consultando API externa",
        },
        { status: 500 },
      );
    }

    const data = await response.json();
    console.log("Respuesta de SA7:", data);

    // Ajusta según la estructura real del API
    const conceptos = Array.isArray(data) ? data : data.data;

    if (!Array.isArray(conceptos)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Respuesta inválida",
        },
        { status: 400 },
      );
    }

    // 2. Filtrar SOLO los conceptos deseados
    const conceptosFiltrados = conceptos.filter((concepto: any) =>
      CONCEPTOS_OBJETIVO.includes(concepto.conceptId?.trim()),
    );

    // 3. Guardar/actualizar en PostgreSQL
    for (const concepto of conceptosFiltrados) {
      const conceptId = concepto.conceptId?.trim();

      const clasificacionType = CLASIFICACION_MAP[conceptId];

      await pool.query(
        `
        INSERT INTO v2_catalogo_conceptos_sa7 (
          concept_id,
          code,
          name,
          description,
          category,
          amount_currency,
          amount_value,
          valid_from,
          valid_until,
          last_updated,
          status,
          clasificacion_type
        )
        VALUES (
          $1,$2,$3,$4,$5,
          $6,$7,$8,$9,$10,$11,$12
        )
        ON CONFLICT (concept_id)
        DO UPDATE SET
          code = EXCLUDED.code,
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          amount_currency = EXCLUDED.amount_currency,
          amount_value = EXCLUDED.amount_value,
          valid_from = EXCLUDED.valid_from,
          valid_until = EXCLUDED.valid_until,
          last_updated = EXCLUDED.last_updated,
          status = EXCLUDED.status,
          clasificacion_type = EXCLUDED.clasificacion_type,
          updated_at = NOW()
        `,
        [
          conceptId,
          concepto.code?.trim(),
          concepto.name,
          concepto.description,
          concepto.category,
          concepto.amount?.currency,
          concepto.amount?.value,
          concepto.validFrom,
          concepto.validUntil,
          concepto.lastUpdated,
          concepto.status,
          clasificacionType,
        ],
      );
    }

    return NextResponse.json({
      ok: true,
      total_guardados: conceptosFiltrados.length,
      conceptos: conceptosFiltrados.map((c: any) => ({
        concept_id: c.conceptId?.trim(),
        clasificacion: CLASIFICACION_MAP[c.conceptId?.trim()],
      })),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error interno del servidor",
      },
      { status: 500 },
    );
  }
}
