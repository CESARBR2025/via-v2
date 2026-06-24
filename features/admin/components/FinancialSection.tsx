import { MonthlyRevenueChart } from "./MonthlyRevenueChart"
import { TopFraccionesChart } from "./TopFraccionesChart"
import { RevenueByDayChart } from "./RevenueByDayChart"
import { EfectividadCobroChart } from "./EfectividadCobroChart"
import { RevenueBySeverityChart } from "./RevenueBySeverityChart"
import { RevenueBySectorChart } from "./RevenueBySectorChart"
import { TopOficialesChart } from "./TopOficialesChart"

export function FinancialSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[16px] font-semibold text-[#0F172A]">
          Recaudación
        </h2>
        <p className="text-sm text-[#64748B] mt-0.5">
          Ingresos generados por el sistema
        </p>
      </div>

      <MonthlyRevenueChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopFraccionesChart />
        <RevenueByDayChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EfectividadCobroChart />
        <RevenueBySeverityChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
        <RevenueBySectorChart />
      </div>

      <TopOficialesChart />
    </div>
  )
}
