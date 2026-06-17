import { NextResponse } from "next/server"
import { AdminService } from "@/features/admin/service"

export async function GET() {
  try {
    const data = await AdminService.getFinancieroDataService()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[ADMIN FINANCIERO ERROR]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
