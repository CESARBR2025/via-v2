"use client";

import { useState, useRef, useEffect } from "react";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
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
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import LoaderOverlay from "@/features/auth/components/LoaderOverlay";

type Props = {
  role: UserRole;
  userName?: string;
  userRole?: string;
};

export default function Sidebar({
  role,
  userName,
  userRole,
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const firstName = userName?.split(" ")[0] || userName || "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

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
          aria-label="Colapsar menú lateral"
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
          aria-label="Expandir menú lateral"
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

      <nav className="flex flex-col gap-6 mt-6 flex-1" aria-label="Navegación principal">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">

            {!collapsed && (
              <div className="flex items-center gap-2 px-3 mb-2">
                <div className="w-1 h-3 rounded-full bg-[#2563EB]" />
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#94A3B8]">
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
        {userName && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className={`
                w-full flex items-center rounded-lg transition-all duration-200 text-left
                ${userMenuOpen
                  ? "bg-[#EFF6FF]"
                  : "hover:bg-[#F8FAFC]"
                }
                ${collapsed
                  ? "justify-center w-10 mx-auto h-10"
                  : "gap-2.5 px-3 py-2"
                }
              `}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>

              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-[#0F172A] truncate leading-tight">
                      {firstName}
                    </p>
                    {userRole && (
                      <span className="text-[9px] font-medium text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded-full inline-block mt-0.5 leading-tight">
                        {userRole}
                      </span>
                    )}
                  </div>
                  <ChevronUp
                    size={14}
                    strokeWidth={2}
                    className={`shrink-0 text-[#94A3B8] transition-transform duration-200 ${userMenuOpen ? "rotate-0" : "rotate-180"}`}
                  />
                </>
              )}
            </button>

            {userMenuOpen && (
              <div
                className={`
                  bg-[#FFFFFF] border border-[#E2E8F0]
                  shadow-[0_4px_12px_rgba(0,0,0,0.07),0_1px_3px_rgba(0,0,0,0.04)]
                  rounded-xl p-2 z-50
                  animate-fadeIn

                  ${collapsed
                    ? "absolute left-full ml-3 bottom-0 min-w-[220px]"
                    : "absolute bottom-full mb-2 left-0 right-0"
                  }
                `}
              >
                {collapsed && (
                  <div className="px-3 py-2.5 border-b border-[#E2E8F0] mb-1.5">
                    <p className="text-[13px] font-semibold text-[#0F172A] truncate leading-tight">
                      {firstName}
                    </p>
                    {userRole && (
                      <p className="text-[11px] text-[#64748B] mt-0.5">{userRole}</p>
                    )}
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="
                    w-full flex items-center gap-3
                    h-10 px-3.5 rounded-xl
                    bg-[#FEF2F2] text-[#DC2626]
                    hover:bg-[#FEE2E2] active:bg-[#FECACA]
                    transition-all duration-200
                    font-semibold text-[13px]
                    group
                  "
                >
                  <div className="w-7 h-7 rounded-lg bg-[#FEE2E2] flex items-center justify-center shrink-0 transition-colors group-hover:bg-white">
                    <LogOut size={14} strokeWidth={2} className="text-[#DC2626]" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block leading-tight">Cerrar sesión</span>
                    <span className="block text-[10px] font-normal text-[#94A3B8] leading-tight mt-0.5">
                      Salir del sistema
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <LoaderOverlay show={loggingOut} text="Saliendo del sistema..." />
    </aside>
  );
}
