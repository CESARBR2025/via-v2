import { NextResponse } from "next/server"
import { AdminService } from "@/features/admin/service"

export async function GET(req: Request) {
  try {
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
