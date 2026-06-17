"use client"

import { useRouter } from "next/navigation"
import { Users, Settings } from "lucide-react"

export default function AdminDashboardPage() {
  const router = useRouter()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">
          Dashboard de Administración
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Accesos rápidos del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => router.push("/admin/oficiales")}
          className="bg-white border border-[#E2E8F0] rounded-xl p-6 text-left hover:shadow-[0_6px_20px_rgba(37,99,235,0.15),0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#2563EB] transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center mb-4 group-hover:bg-[#2563EB] transition-colors">
            <Users size={20} className="text-[#2563EB] group-hover:text-white transition-colors" strokeWidth={1.5} />
          </div>
          <h3 className="text-[16px] font-semibold text-[#0F172A] mb-1">
            Gestión de Oficiales
          </h3>
          <p className="text-sm text-[#64748B]">
            Administra los oficiales de policía, asigna números de empleado, departamentos y patrullas
          </p>
        </button>

        <button
          onClick={() => router.push("/admin/configuracion")}
          className="bg-white border border-[#E2E8F0] rounded-xl p-6 text-left hover:shadow-[0_6px_20px_rgba(37,99,235,0.15),0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#2563EB] transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center mb-4 group-hover:bg-[#2563EB] transition-colors">
            <Settings size={20} className="text-[#2563EB] group-hover:text-white transition-colors" strokeWidth={1.5} />
          </div>
          <h3 className="text-[16px] font-semibold text-[#0F172A] mb-1">
            Configuración
          </h3>
          <p className="text-sm text-[#64748B]">
            Catálogos de sectores, departamentos y rangos
          </p>
        </button>
      </div>
    </div>
  )
}
