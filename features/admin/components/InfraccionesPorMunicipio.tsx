"use client"

import { useEffect, useState } from "react"
import { MapPin } from "lucide-react"

import type { GeoItem } from "../types"
import { Skeleton } from "@/components/ui/Skeleton"

export function InfraccionesPorMunicipio() {
  const [data, setData] = useState<GeoItem[]>([])
  const [totalUbicacion, setTotalUbicacion] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/geografico")
        const json = await res.json()
        if (json?.porMunicipio) setData(json.porMunicipio)
        if (json?.totalConUbicacion != null) setTotalUbicacion(json.totalConUbicacion)
      } catch (err) {
        console.error("Error fetching municipios:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const maxTotal = Math.max(...data.map((d) => d.total), 1)

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-semibold text-[#0F172A]">
          Infracciones por municipio
        </h3>
        <div className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
          <MapPin size={14} strokeWidth={1.5} />
          {totalUbicacion} ubicadas
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-[#94A3B8]">
          Sin datos
        </div>
      ) : (
        <div className="space-y-2.5">
          {data.map((item) => (
            <div key={item.nombre}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-[#0F172A] font-medium">
                  {item.nombre}
                </span>
                <span className="text-[13px] font-semibold text-[#0F172A]">
                  {item.total}
                </span>
              </div>
              <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                  style={{ width: `${(item.total / maxTotal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
