import { KpiGrid } from "@/features/admin/components/KpiGrid"

export default function AdminKpisPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">
          Indicadores del Sistema
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          KPIs generales de infracciones, pagos y recaudación
        </p>
      </div>

      <KpiGrid />
    </div>
  )
}
