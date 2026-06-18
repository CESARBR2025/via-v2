import type { LucideIcon } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconBgColor: string
  iconColor: string
  suffix?: string
}

export function KpiCard({ title, value, icon: Icon, iconBgColor, iconColor, suffix }: KpiCardProps) {
  return (
    <div
      className="
        bg-white border border-[#E2E8F0] rounded-xl
        p-4 md:p-5
        shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]
      "
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon size={20} color={iconColor} strokeWidth={1.5} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide truncate">
            {title}
          </p>
          <p className="text-[22px] font-bold text-[#0F172A] mt-0.5 leading-tight">
            {value}
            {suffix && (
              <span className="text-[12px] font-medium text-[#64748B] ml-1.5">
                {suffix}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
