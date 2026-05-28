"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { useSidebarStore } from "@/stores/sideBarStore";

const PAGE_TITLES: Record<string, string> = {
  "/oficiales/captura": "Capturar Infracción",
  "/oficiales/capturar": "Capturar Infracción",
  "/oficiales/realizadas": "Infracciones Realizadas",
  "/depInfracciones/dashboard": "Consultar Infracciones",
  "/dashboard": "Dashboard",
};

const getPageTitle = (path: string): string => {
  if (PAGE_TITLES[path]) return PAGE_TITLES[path];
  const match = Object.entries(PAGE_TITLES).find(([key]) =>
    path.startsWith(key)
  );
  return match ? match[1] : "Panel Principal";
};

export default function Header() {
  const pathname = usePathname();
  const toggleMobile = useSidebarStore((s) => s.toggleMobile);

  const title = getPageTitle(pathname);

  const simulatedUser = {
    name: "César Bárcenas",
    role: "Oficial de Tránsito",
  };

  return (
    <header className="
      h-16 border-b border-[#E8EEF9]
      bg-[#FFFFFF]
      px-4 md:px-6
      flex items-center justify-between
      gap-4
    ">

      {/* LEFT */}

      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleMobile}
          className="
            md:hidden
            w-9 h-9 rounded-lg
            hover:bg-[#F1F5F9]
            flex items-center justify-center
            text-[#64748B] hover:text-[#0F172A]
            transition-colors duration-200
          "
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        <div className="md:hidden h-6 w-px bg-[#E8EEF9]" />

        <h1 className="
          text-[18px] md:text-[22px]
          font-semibold text-[#0F172A]
          truncate
        ">
          {title}
        </h1>
      </div>

      {/* RIGHT — user card */}

      <div className="
        hidden sm:flex items-center gap-3
        px-3 py-1.5 rounded-xl
        hover:bg-[#F1F5F9]
        transition-colors duration-200
        cursor-default
      ">
        <div
          className="
            w-[38px] h-[38px] rounded-xl
            bg-gradient-to-br from-[#1D4ED8] to-[#3B82F6]
            flex items-center justify-center
            text-[#FFFFFF] font-semibold text-sm
            shadow-[0_4px_12px_rgba(29,78,216,0.20)]
          "
        >
          {simulatedUser.name.charAt(0)}
        </div>

        <div className="flex flex-col leading-tight">
          <span className="text-[14px] font-semibold text-[#0F172A] max-w-[140px] truncate">
            {simulatedUser.name}
          </span>
          <span className="text-[12px] font-medium text-[#64748B]">
            {simulatedUser.role}
          </span>
        </div>
      </div>

      {/* Mobile avatar */}
      <div className="
        sm:hidden
        w-[34px] h-[34px] rounded-lg
        bg-gradient-to-br from-[#1D4ED8] to-[#3B82F6]
        flex items-center justify-center
        text-[#FFFFFF] font-semibold text-xs
        shadow-[0_4px_12px_rgba(29,78,216,0.20)]
      ">
        {simulatedUser.name.charAt(0)}
      </div>

    </header>
  );
}
