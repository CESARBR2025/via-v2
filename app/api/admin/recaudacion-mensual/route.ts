import { NextResponse } from "next/server"
import { AdminService } from "@/features/admin/service"
import { requirePermiso } from "@/lib/auth/guard";
import { PERM } from "@/features/auth/permissions";

export async function GET(req: Request) {
  try {
    const auth = await requirePermiso(PERM.FINANCIERO.VER);
    if (auth) return auth;

    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()), 10)

    if (isNaN(year) || year < 2020 || year > 2100) {
      return NextResponse.json({ error: "Año inválido" }, { status: 400 })
    }

    const data = await AdminService.getMonthlyRevenueService(year)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[ADMIN MONTHLY ERROR]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
