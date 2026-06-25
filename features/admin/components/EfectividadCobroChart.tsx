"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

import type { KpiData } from "../types"

const COLORS = ["#22C55E", "#F59E0B"]

const formatPesos = (v: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

export function EfectividadCobroChart() {
  const [data, setData] = useState<KpiData | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/kpi")
        const json = await res.json()
        if (json?.infraccionesPagadas != null && json?.infraccionesPendientes != null) {
          setData(json)
        }
      } catch (err) {
        console.error("Error fetching efectividad:", err)
      }
    }
    fetchData()
  }, [])

  if (!data) return null

  const total = data.infraccionesPagadas + data.infraccionesPendientes
  const pctPagadas = total > 0 ? Math.round((data.infraccionesPagadas / total) * 100) : 0
  const pctPendientes = total > 0 ? Math.round((data.infraccionesPendientes / total) * 100) : 0

  const chartData = [
    { name: "Pagadas", value: data.infraccionesPagadas },
    { name: "Pendientes", value: data.infraccionesPendientes },
  ]

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
      <h3 className="text-[16px] font-semibold text-[#0F172A] mb-4">
        Efectividad de cobro
      </h3>

      <div className="flex items-center gap-6">
        <div className="w-40 h-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={56}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [Number(value).toLocaleString(), name]}
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)",
                  padding: "10px 14px",
                  fontSize: 13,
                }}
                labelStyle={{ color: "#64748B", fontSize: 12, fontWeight: 600, marginBottom: 4 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
              <span className="text-[13px] text-[#64748B]">Pagadas</span>
            </div>
            <span className="text-[13px] font-semibold text-[#0F172A]">
              {data.infraccionesPagadas.toLocaleString()} <span className="text-[#22C55E] font-medium">({pctPagadas}%)</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span className="text-[13px] text-[#64748B]">Pendientes</span>
            </div>
            <span className="text-[13px] font-semibold text-[#0F172A]">
              {data.infraccionesPendientes.toLocaleString()} <span className="text-[#F59E0B] font-medium">({pctPendientes}%)</span>
            </span>
          </div>

          <div className="pt-2 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#64748B]">
                Recaudado
              </span>
              <span className="text-[13px] font-bold text-[#0F172A]">
                {formatPesos(data.recaudacionTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[13px] font-medium text-[#64748B]">
                Por cobrar
              </span>
              <span className="text-[13px] font-bold text-[#EF4444]">
                {formatPesos(data.deudaPendiente)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
