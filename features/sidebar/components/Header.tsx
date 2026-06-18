"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { useSidebarStore } from "@/stores/sideBarStore";
import UserAvatarDropdown from "./UserAvatarDropdown";
import Breadcrumbs from "./Breadcrumbs";
import GlobalSearch from "./GlobalSearch";

const PAGE_TITLES: Record<string, string> = {
  "/oficiales/captura": "Capturar Infracción",
  "/oficiales/capturar": "Capturar Infracción",
  "/oficiales/realizadas": "Infracciones Realizadas",
  "/oficiales/perfil": "Mi Perfil",
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

type Props = {
  userName: string;
  userRole: string;
};

export default function Header({ userName, userRole }: Props) {
  const pathname = usePathname();
  const toggleMobile = useSidebarStore((s) => s.toggleMobile);

  const title = getPageTitle(pathname);

  return (
    <header className="
      h-16 border-b border-[#E2E8F0]
      bg-[#FFFFFF]
      px-4 md:px-6
      flex items-center justify-between
      gap-4
    ">

      {/* LEFT — mobile: hamburger + title / desktop: breadcrumbs */}

      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleMobile}
          className="
            md:hidden
            w-9 h-9 rounded-lg
            hover:bg-[#F8FAFC]
            flex items-center justify-center
            text-[#64748B] hover:text-[#0F172A]
            transition-colors duration-200
          "
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        <div className="md:hidden h-6 w-px bg-[#E2E8F0]" />

        <h1 className="
          md:hidden
          text-[22px] font-bold text-[#0F172A]
          truncate
        ">
          {title}
        </h1>

        <Breadcrumbs />
      </div>

      {/* CENTER — global search */}

      <div className="flex-shrink-0">
        <GlobalSearch />
      </div>

      {/* RIGHT — user avatar + dropdown */}

      <UserAvatarDropdown userName={userName} userRole={userRole} />

    </header>
  );
}
