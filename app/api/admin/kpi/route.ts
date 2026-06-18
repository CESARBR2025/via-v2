import { NextResponse } from "next/server";
import { AdminService } from "@/features/admin/service";
import { requirePermiso } from "@/lib/auth/guard";
import { PERM } from "@/features/auth/permissions";

export async function GET() {
  try {
    const auth = await requirePermiso(PERM.KPIS.VER);
    if (auth) return auth;

    const data = await AdminService.getKpiDataService();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[ADMIN KPI ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
