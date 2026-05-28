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
      h-16 border-b border-[#EAF1FC]
      bg-[#FFFFFF]
      px-4 md:px-6
      flex items-center justify-between
      gap-4
    ">

      {/* LEFT: hamburger + title */}

      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleMobile}
          className="
            md:hidden
            w-9 h-9 rounded-lg
            hover:bg-[#EFF4FE]
            flex items-center justify-center
            text-[#6B778C] hover:text-[#1A2340]
            transition-colors duration-200
          "
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        <div className="md:hidden h-6 w-px bg-[#EAF1FC]" />

        <h1 className="
          text-[18px] md:text-[22px]
          font-semibold text-[#1A2340]
          truncate
        ">
          {title}
        </h1>
      </div>

      {/* RIGHT: user card */}

      <div className="
        hidden sm:flex items-center gap-3
        px-3 py-1.5 rounded-xl
        hover:bg-[#EFF4FE]
        transition-colors duration-200
        cursor-default
      ">
        <div
          className="
            w-[38px] h-[38px] rounded-xl
            bg-gradient-to-br from-[#1F69E7] to-[#3E83F0]
            flex items-center justify-center
            text-white font-semibold text-sm
            shadow-[0_4px_12px_rgba(31,105,231,0.20)]
          "
        >
          {simulatedUser.name.charAt(0)}
        </div>

        <div className="flex flex-col leading-tight">
          <span className="text-[14px] font-semibold text-[#1A2340] max-w-[140px] truncate">
            {simulatedUser.name}
          </span>
          <span className="text-[12px] font-medium text-[#8A96B0]">
            {simulatedUser.role}
          </span>
        </div>
      </div>

      {/* Mobile user avatar (icon only) */}

      <div className="
        sm:hidden
        w-[34px] h-[34px] rounded-lg
        bg-gradient-to-br from-[#1F69E7] to-[#3E83F0]
        flex items-center justify-center
        text-white font-semibold text-xs
        shadow-[0_4px_12px_rgba(31,105,231,0.20)]
      ">
        {simulatedUser.name.charAt(0)}
      </div>

    </header>
  );
}
