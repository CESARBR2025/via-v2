"use client";

import { usePathname, useRouter } from "next/navigation";
import { Menu, Plus } from "lucide-react";

import { useSidebarStore } from "@/stores/sideBarStore";
import UserAvatarDropdown from "./UserAvatarDropdown";
import Breadcrumbs from "./Breadcrumbs";
import DateDisplay from "./DateDisplay";
import NotificationBell from "./NotificationBell";

const PAGE_TITLES: Record<string, string> = {
  "/oficiales/dashboard": "Dashboard",
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
  roleKey: string;
};

type ContextualAction = {
  label: string;
  href: string;
  icon: typeof Plus;
};

function getContextualAction(role: string, path: string): ContextualAction | null {
  if (role === "oficial" && !path.startsWith("/oficiales/captura")) {
    return { label: "Nueva Infracción", href: "/oficiales/captura", icon: Plus };
  }
  return null;
}

export default function Header({ userName, userRole, roleKey }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const toggleMobile = useSidebarStore((s) => s.toggleMobile);

  const title = getPageTitle(pathname);
  const action = getContextualAction(roleKey, pathname);

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

      {/* CENTER — date */}

      <DateDisplay />

      {/* RIGHT — contextual action + notifications + user avatar */}

      <div className="flex items-center gap-1">
        {action && (
          <button
            type="button"
            onClick={() => router.push(action.href)}
            className="
              hidden sm:inline-flex items-center gap-1.5
              h-9 px-3
              rounded-lg
              bg-[#2563EB]
              text-white text-sm font-semibold
              hover:bg-[#1D4ED8] active:bg-[#1E40AF]
              transition-colors duration-150
            "
          >
            <action.icon size={16} strokeWidth={2} />
            <span className="hidden lg:inline">{action.label}</span>
          </button>
        )}

        <NotificationBell />
        <UserAvatarDropdown userName={userName} userRole={userRole} />
      </div>

    </header>
  );
}
