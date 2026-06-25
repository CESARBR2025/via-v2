"use client"

import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts"

import type { TopFraccion } from "../types"

export function TopFraccionesChart() {
  const [data, setData] = useState<TopFraccion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/financiero")
        const json = await res.json()
        if (json?.topFracciones) setData(json.topFracciones)
      } catch (err) {
        console.error("Error fetching top fracciones:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
      <h3 className="text-[16px] font-semibold text-[#0F172A] mb-4">
        Top 5 fracciones más infraccionadas
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
                tick={{ fontSize: 12, fill: "#94A3B8" }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="descripcion"
                width={140}
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: string) =>
                  v.length > 28 ? v.slice(0, 28) + "…" : v
                }
              />
              <Tooltip
                formatter={(value) => [Number(value ?? 0).toLocaleString(), "Infracciones"]}
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
                fill="#8B5CF6"
                radius={[0, 6, 6, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
