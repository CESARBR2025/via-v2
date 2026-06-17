import { NextResponse } from "next/server";
import { AdminService } from "@/features/admin/service";

export async function GET() {
  try {
    const data = await AdminService.getKpiDataService();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[ADMIN KPI ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
