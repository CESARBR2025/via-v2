"use client"

import { useEffect, useState } from "react"
import {
  FileText,
  CheckCircle2,
  Clock,
  Zap,
  Truck,
  DollarSign,
  CreditCard,
  TrendingUp,
  Heart,
} from "lucide-react"

import { KpiCard } from "./KpiCard"
import { SkeletonCard } from "@/components/ui/Skeleton"
import type { KpiData } from "../types"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

const formatNumber = (v: unknown) => {
  if (typeof v !== "number") return "—"
  return v.toLocaleString()
}

const kpiConfig: {
  key: keyof KpiData
  title: string
  icon: typeof FileText
  iconBgColor: string
  iconColor: string
  formatter: (v: unknown) => string
  suffix?: string
}[] = [
  {
    key: "totalInfracciones",
    title: "Infracciones Generadas",
    icon: FileText,
    iconBgColor: "#EFF6FF",
    iconColor: "#2563EB",
    formatter: formatNumber,
  },
  {
    key: "infraccionesPagadas",
    title: "Infracciones Pagadas",
    icon: CheckCircle2,
    iconBgColor: "#DCFCE7",
    iconColor: "#22C55E",
    formatter: formatNumber,
  },
  {
    key: "infraccionesPendientes",
    title: "Pendientes de Pago",
    icon: Clock,
    iconBgColor: "#FEF3C7",
    iconColor: "#F59E0B",
    formatter: formatNumber,
  },
  {
    key: "pagadasAlInstante",
    title: "Pagadas al Instante",
    icon: Zap,
    iconBgColor: "#EFF6FF",
    iconColor: "#60A5FA",
    formatter: formatNumber,
  },
  {
    key: "vehiculosRetenidos",
    title: "Vehículos Retenidos",
    icon: Truck,
    iconBgColor: "#FEE2E2",
    iconColor: "#EF4444",
    formatter: formatNumber,
  },
  {
    key: "recaudacionTotal",
    title: "Recaudación Total",
    icon: DollarSign,
    iconBgColor: "#DCFCE7",
    iconColor: "#16A34A",
    suffix: "MXN",
    formatter: (v: unknown) => {
      if (typeof v !== "number") return "—"
      return formatCurrency(v)
    },
  },
  {
    key: "deudaPendiente",
    title: "Deuda Pendiente",
    icon: CreditCard,
    iconBgColor: "#FEE2E2",
    iconColor: "#DC2626",
    suffix: "MXN",
    formatter: (v: unknown) => {
      if (typeof v !== "number") return "—"
      return formatCurrency(v)
    },
  },
  {
    key: "montoPromedio",
    title: "Monto Promedio",
    icon: TrendingUp,
    iconBgColor: "#EFF6FF",
    iconColor: "#2563EB",
    suffix: "MXN",
    formatter: (v: unknown) => {
      if (typeof v !== "number") return "—"
      return formatCurrency(v)
    },
  },
  {
    key: "descuentosInapam",
    title: "Desc. INAPAM",
    icon: Heart,
    iconBgColor: "#FFF7ED",
    iconColor: "#C2410C",
    formatter: formatNumber,
  },
]

const KPI_KEYS: (keyof KpiData)[] = [
  "totalInfracciones",
  "infraccionesPagadas",
  "infraccionesPendientes",
  "pagadasAlInstante",
  "vehiculosRetenidos",
  "recaudacionTotal",
  "deudaPendiente",
  "montoPromedio",
  "descuentosInapam",
]

function isValidKpiData(obj: unknown): obj is KpiData {
  if (!obj || typeof obj !== "object") return false
  return KPI_KEYS.every((key) => typeof (obj as Record<string, unknown>)[key] === "number")
}

export function KpiGrid() {
  const [data, setData] = useState<KpiData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchKpi = async () => {
      try {
        const res = await fetch("/api/admin/kpi", { cache: "no-store" })
        const json = await res.json()

        if (isValidKpiData(json)) {
          setData(json)
        } else {
          console.error("Invalid KPI response:", json)
        }
      } catch (err) {
        console.error("Error fetching KPI data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchKpi()
  }, [])

  if (loading) return <SkeletonCard count={9} />

  if (!data) {
    return (
      <p className="text-sm text-[#EF4444] bg-[#FEE2E2] rounded-lg p-4">
        Error al cargar los indicadores
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpiConfig.map((cfg) => (
        <KpiCard
          key={cfg.key}
          title={cfg.title}
          value={cfg.formatter(data[cfg.key])}
          icon={cfg.icon}
          iconBgColor={cfg.iconBgColor}
          iconColor={cfg.iconColor}
          suffix={cfg.suffix}
        />
      ))}
    </div>
  )
}
