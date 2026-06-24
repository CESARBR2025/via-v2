"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

import type { RevenueBySeverity } from "../types"

const SEVERITY_COLORS: Record<string, string> = {
  Grave: "#EF4444",
  Media: "#F59E0B",
  Leve: "#22C55E",
}

const SEVERITY_LABELS: Record<string, string> = {
  Grave: "Grave",
  Media: "Media",
  Leve: "Leve",
}

const SEVERITY_BG: Record<string, string> = {
  Grave: "#FEE2E2",
  Media: "#FEF3C7",
  Leve: "#DCFCE7",
}

const formatPesos = (v: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

export function RevenueBySeverityChart() {
  const [data, setData] = useState<RevenueBySeverity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/recaudacion-por-gravedad")
        const json = await res.json()
        if (Array.isArray(json)) setData(json)
      } catch (err) {
        console.error("Error fetching revenue by severity:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  console.log(data)

  if (loading) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="h-48 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#E2E8F0] border-t-[#2563EB] rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="h-48 flex items-center justify-center text-sm text-[#94A3B8]">
          Sin datos
        </div>
      </div>
    )
  }

  const totalRecaudado = data.reduce((acc, d) => acc + d.total, 0)

  const chartData = data.map((d) => ({
    name: SEVERITY_LABELS[d.clasificacion] ?? d.clasificacion,
    value: d.total,
    clasificacion: d.clasificacion,
  }))

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
      <h3 className="text-[16px] font-semibold text-[#0F172A] mb-4">
        Recaudación por gravedad
      </h3>

      <div className="flex items-center gap-6">
        <div className="w-36 h-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={52}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.clasificacion}
                    fill={SEVERITY_COLORS[entry.clasificacion] ?? "#94A3B8"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatPesos(Number(value)), "Recaudación"]}
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.07)",
                  fontSize: 13,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3 flex-1">
          {data.map((entry) => {
            const pct = totalRecaudado > 0
              ? Math.round((entry.total / totalRecaudado) * 100)
              : 0
            return (
              <div key={entry.clasificacion}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: SEVERITY_COLORS[entry.clasificacion] ?? "#94A3B8" }}
                    />
                    <span className="text-[12px] font-medium text-[#64748B]">
                      {SEVERITY_LABELS[entry.clasificacion] ?? entry.clasificacion}
                    </span>
                  </div>
                  <span className="text-[12px] font-semibold text-[#0F172A]">
                    {formatPesos(entry.total)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
                  <span
                    className="h-1.5 rounded-full flex-1"
                    style={{
                      backgroundColor: SEVERITY_BG[entry.clasificacion] ?? "#F1F5F9",
                    }}
                  >
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: SEVERITY_COLORS[entry.clasificacion] ?? "#94A3B8",
                      }}
                    />
                  </span>
                  <span>{pct}%</span>
                </div>
              </div>
            )
          })}

          <div className="pt-2 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#64748B]">
                Total
              </span>
              <span className="text-[13px] font-bold text-[#0F172A]">
                {formatPesos(totalRecaudado)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
