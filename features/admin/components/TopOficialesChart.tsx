"use client"

import { useEffect, useState } from "react"
import { Medal, User } from "lucide-react"

import type { TopOficial } from "../types"

const formatPesos = (v: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return <Medal size={16} className="text-[#F59E0B]" strokeWidth={1.5} />
  if (rank === 2)
    return <Medal size={16} className="text-[#94A3B8]" strokeWidth={1.5} />
  if (rank === 3)
    return <Medal size={16} className="text-[#CD7F32]" strokeWidth={1.5} />
  return (
    <span className="w-4 text-center text-xs font-medium text-[#94A3B8]">
      {rank}
    </span>
  )
}

export function TopOficialesChart() {
  const [data, setData] = useState<TopOficial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/top-oficiales")
        const json = await res.json()
        if (Array.isArray(json)) setData(json)
      } catch (err) {
        console.error("Error fetching top oficiales:", err)
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
        Top 10 oficiales por recaudación
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                <th className="text-left pb-2 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider w-8">#</th>
                <th className="text-left pb-2 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Oficial</th>
                <th className="text-left pb-2 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider hidden sm:table-cell">No. Empleado</th>
                <th className="text-right pb-2 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Infracciones</th>
                <th className="text-right pb-2 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Recaudación</th>
              </tr>
            </thead>
            <tbody>
              {data.map((oficial, i) => (
                <tr
                  key={oficial.usuarioId}
                  className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors"
                >
                  <td className="py-2.5 pr-2 align-middle">
                    <RankBadge rank={i + 1} />
                  </td>
                  <td className="py-2.5 pr-4 align-middle">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
                        <User size={14} className="text-[#2563EB]" strokeWidth={1.5} />
                      </div>
                      <span className="text-[13px] font-medium text-[#0F172A] truncate max-w-[140px]">
                        {oficial.nombres}
                        {oficial.apellidoP ? ` ${oficial.apellidoP}` : ""}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 align-middle hidden sm:table-cell">
                    <span className="text-[12px] text-[#64748B]">
                      {oficial.numeroEmpleado ?? "—"}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 align-middle text-right">
                    <span className="text-[13px] font-medium text-[#0F172A]">
                      {oficial.infracciones.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-2.5 align-middle text-right">
                    <span className="text-[13px] font-semibold text-[#0F172A]">
                      {formatPesos(oficial.total)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
