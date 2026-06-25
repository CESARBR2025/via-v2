"use client"

import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts"
import { ChevronDown } from "lucide-react"

import type { MonthlyRevenue } from "../types"

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

const formatPesos = (v: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

export function MonthlyRevenueChart() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const [data, setData] = useState<MonthlyRevenue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/recaudacion-mensual?year=${year}`)
        const json = await res.json()
        if (Array.isArray(json)) setData(json)
      } catch (err) {
        console.error("Error fetching monthly revenue:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [year])

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[16px] font-semibold text-[#0F172A]">
          Recaudación por mes
        </h3>

        <div className="relative">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="appearance-none bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#64748B] font-medium px-3 py-1.5 pr-8 focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition-all cursor-pointer"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <ChevronDown
            size={14}
            strokeWidth={1.5}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#E2E8F0] border-t-[#2563EB] rounded-full animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-[#94A3B8]">
          Sin datos para {year}
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#94A3B8" }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                formatter={(value) => [formatPesos(Number(value)), "Recaudación"]}
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
              <Bar
                dataKey="total"
                fill="#2563EB"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
