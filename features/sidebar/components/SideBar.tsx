"use client";

import { useState } from "react";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";

import { navigationByRole }
  from "../config/navigation";

import SidebarItem
  from "./SideBarItem";

import { UserRole }
  from "../config/types";

import { useSidebarStore }
  from "@/stores/sideBarStore";
import SidebarActionItem from "./SideBarActionItem";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import LoaderOverlay from "@/features/auth/components/LoaderOverlay";

type Props = {
  role: UserRole;
};

export default function Sidebar({
  role,
}: Props) {

  const sections =
    navigationByRole[role] || [];

  const {
    collapsed,
    toggleCollapsed,
  } = useSidebarStore();

  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      logout();
      router.replace("/login");
    }
  };

  return (
    <aside
      className={`
        hidden md:flex
        flex-col
        overflow-y-auto

        bg-[#FFFFFF]
        border-r border-[#E2E8F0]
        shadow-[2px_0_8px_rgba(0,0,0,0.04)]

        transition-all duration-300 ease-in-out

        ${collapsed
          ? "w-[72px] py-6 px-3"
          : "w-[220px] py-6 px-3"
        }
      `}
    >

      {/* ═══ HEADER ═══ */}

      <div
        className={`
          flex items-center
          ${collapsed
            ? "justify-center"
            : "justify-between"
          }
          min-h-[52px]
          px-2
        `}
      >

        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.2)]">
              <Shield size={16} className="text-white" strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-sm font-bold text-[#0F172A] tracking-tight leading-none block">
                VIA
              </span>
              <span className="text-[9px] font-medium text-[#94A3B8] tracking-[0.15em] uppercase leading-none mt-0.5 block">
                Dashboard
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.2)]">
            <Shield size={16} className="text-white" strokeWidth={1.5} />
          </div>
        )}

        <button
          onClick={toggleCollapsed}
          className={`
            w-7 h-7 rounded-lg
            hover:bg-[#F8FAFC]
            flex items-center justify-center
            text-[#94A3B8] hover:text-[#0F172A]
            transition-colors duration-200
            ${collapsed ? "hidden" : ""}
          `}
        >
          <ChevronLeft size={14} strokeWidth={2} />
        </button>

      </div>

      {collapsed && (
        <button
          onClick={toggleCollapsed}
          className="
            mt-3 w-full h-7 rounded-lg
            hover:bg-[#F8FAFC]
            flex items-center justify-center
            text-[#94A3B8] hover:text-[#0F172A]
            transition-colors duration-200
          "
        >
          <ChevronRight size={14} strokeWidth={2} />
        </button>
      )}

      {/* ═══ NAV ═══ */}

      <nav className="flex flex-col gap-6 mt-6 flex-1">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">

            {!collapsed && (
              <div className="flex items-center gap-2 px-3 mb-2">
                <div className="w-1 h-3 rounded-full bg-[#2563EB]" />
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#64748B]">
                  {section.title}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-0.5">
              {section.items.map((item: any) => (
                <SidebarItem key={item.href} {...item} />
              ))}
            </div>

          </div>
        ))}
      </nav>

      {/* ═══ FOOTER ═══ */}

      <div className="pt-4 mt-auto border-t border-[#E2E8F0]">
        {!collapsed && (
          <div className="px-2">
            <SidebarActionItem
              label="Cerrar sesión"
              icon={LogOut}
              onClick={handleLogout}
            />
          </div>
        )}
        {collapsed && (
          <SidebarActionItem
            label="Cerrar sesión"
            icon={LogOut}
            onClick={handleLogout}
          />
        )}
      </div>

      <LoaderOverlay show={loggingOut} text="Saliendo del sistema..." />
    </aside>
  );
}
