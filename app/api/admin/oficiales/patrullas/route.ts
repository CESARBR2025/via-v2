import { NextResponse } from "next/server";
import { requirePermiso } from "@/lib/auth/guard";
import { PERM } from "@/features/auth/permissions";
import { FlotaService } from "@/features/flota/service";
import { OficialesRepository } from "@/features/oficiales/repository";
import { POOL_PG } from "@/lib/db";

export async function GET() {
  try {
    const auth = await requirePermiso(PERM.OFICIALES.GESTIONAR);
    if (auth) return auth;

    let patrullas = await FlotaService.listarPatrullasParaAsignacion();

    if (patrullas.length === 0) {
      console.warn("[API][ADMIN][OFICIALES][PATRULLAS] Flota API sin datos, usando fallback local");
      patrullas = await OficialesRepository.listarPatrullasActivas();
    }

    return NextResponse.json({ ok: true, data: patrullas });
  } catch (error: any) {
    console.error("[API][ADMIN][OFICIALES][PATRULLAS][GET]", error);

    try {
      const fallback = await OficialesRepository.listarPatrullasActivas();
      return NextResponse.json({ ok: true, data: fallback });
    } catch {
      return NextResponse.json(
        { ok: false, message: "Error al listar patrullas" },
        { status: 500 },
      );
    }
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requirePermiso(PERM.OFICIALES.GESTIONAR);
    if (auth) return auth;

    const body = await req.json();
    const { numero_unidad, placas } = body;

    if (!numero_unidad) {
      return NextResponse.json(
        { ok: false, message: "El número de unidad es obligatorio" },
        { status: 400 },
      );
    }

    const existente = await POOL_PG.query(
      `SELECT id FROM v2_patrullas WHERE numero_unidad = $1`,
      [numero_unidad],
    );

    if (existente.rows.length > 0) {
      return NextResponse.json({
        ok: true,
        data: { id: existente.rows[0].id },
        creada: false,
      });
    }

    const result = await POOL_PG.query(
      `INSERT INTO v2_patrullas (numero_unidad, placas, activo, sincronizado_en)
       VALUES ($1, $2, true, NOW())
       RETURNING id`,
      [numero_unidad, placas || null],
    );

    return NextResponse.json({
      ok: true,
      data: { id: result.rows[0].id },
      creada: true,
    });
  } catch (error: any) {
    console.error("[API][ADMIN][OFICIALES][PATRULLAS][POST]", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Error al crear patrulla" },
      { status: 500 },
    );
  }
}
