import { NextResponse } from "next/server"
import { requirePermiso } from "@/lib/auth/guard"
import { PERM } from "@/features/auth/permissions"
import { POOL_PG } from "@/lib/db"

export async function GET() {
  try {
    const auth = await requirePermiso(PERM.FINANCIERO.VER)
    if (auth) return auth

    const result = await POOL_PG.query(
      `SELECT latitud, longitud
       FROM v2_infracciones
       WHERE latitud IS NOT NULL
         AND longitud IS NOT NULL
         AND latitud != 0
         AND longitud != 0`,
    )

    return NextResponse.json({ data: result.rows })
  } catch (error: any) {
    console.error("[GEOGRAFICO COORDENADAS ERROR]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
