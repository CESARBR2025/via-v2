"use client"

import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts"

import type { RevenueBySector } from "../types"

const SECTOR_COLORS: Record<string, string> = {
  PONIENTE: "#2563EB",
  ORIENTE: "#60A5FA",
  CENTRO: "#1E3A8A",
  "SIN ASIGNAR": "#94A3B8",
}

const formatPesos = (v: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

export function RevenueBySectorChart() {
  const [data, setData] = useState<RevenueBySector[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/recaudacion-por-sector")
        const json = await res.json()
        if (Array.isArray(json)) setData(json)
      } catch (err) {
        console.error("Error fetching revenue by sector:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  console.log(data)

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
      <h3 className="text-[16px] font-semibold text-[#0F172A] mb-4">
        Recaudación por sector
      </h3>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#E2E8F0] border-t-[#2563EB] rounded-full animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-[#94A3B8]">
          Sin datos
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
            >
              <XAxis
                type="number"
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: "#94A3B8" }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="sector"
                width={100}
                tick={{ fontSize: 12, fill: "#64748B", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
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
              <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {data.map((entry) => (
                  <Cell
                    key={entry.sector}
                    fill={SECTOR_COLORS[entry.sector] ?? "#94A3B8"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#E2E8F0] text-xs text-[#64748B]">
        {data.map((entry) => (
          <span key={entry.sector} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: SECTOR_COLORS[entry.sector] ?? "#94A3B8" }}
            />
            {entry.infracciones} infracciones
          </span>
        ))}
      </div>
    </div>
  )
}
