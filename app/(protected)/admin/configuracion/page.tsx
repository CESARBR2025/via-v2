"use client"

import { useRouter } from "next/navigation"
import { MapPin, Building2, ArrowUpDown } from "lucide-react"

const catalogs = [
  {
    label: "Sectores",
    href: "/admin/sectores",
    icon: MapPin,
    desc: "Administra los sectores de la corporación",
  },
  {
    label: "Departamentos",
    href: "/admin/departamentos",
    icon: Building2,
    desc: "Gestiona los departamentos y áreas",
  },
  {
    label: "Rangos",
    href: "/admin/rangos",
    icon: ArrowUpDown,
    desc: "Configura los rangos y jerarquías",
  },
]

export default function ConfiguracionPage() {
  const router = useRouter()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">
          Configuración
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Catálogos del sistema
        </p>
      </div>

      <h2 className="text-[16px] font-semibold text-[#0F172A]">
        Gestión de oficiales
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {catalogs.map((cat) => (
          <button
            key={cat.href}
            onClick={() => router.push(cat.href)}
            className="bg-white border border-[#E2E8F0] rounded-xl p-6 text-left hover:shadow-[0_6px_20px_rgba(37,99,235,0.15),0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#2563EB] transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center mb-4 group-hover:bg-[#2563EB] transition-colors">
              <cat.icon size={20} className="text-[#2563EB] group-hover:text-white transition-colors" strokeWidth={1.5} />
            </div>
            <h3 className="text-[16px] font-semibold text-[#0F172A] mb-1">
              {cat.label}
            </h3>
            <p className="text-sm text-[#64748B]">
              {cat.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
