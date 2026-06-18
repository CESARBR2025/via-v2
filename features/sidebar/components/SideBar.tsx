"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { navigationByRole }
  from "../config/navigation";

import SidebarItem
  from "./SideBarItem";

import { UserRole }
  from "../config/types";

import { useSidebarStore }
  from "@/stores/sideBarStore";

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

  return (
    <aside
      className={`
        hidden md:flex
        flex-col
        overflow-y-auto

        bg-slate-900
        border-r border-white/10
        shadow-card

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
          <div className="flex items-center gap-3">
            <Image
              src="/roles/Estrella.png"
              alt="SSPM"
              width={32}
              height={32}
              className="object-contain shrink-0"
            />
            <div>
              <span className="text-sm font-medium text-white tracking-tight leading-none block">
                SSPM
              </span>
              <span className="text-[9px] font-medium text-white/40 tracking-[0.15em] uppercase leading-none mt-0.5 block">
                San Juan del Río
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <Image
            src="/roles/Estrella.png"
            alt="SSPM"
            width={28}
            height={28}
            className="object-contain"
          />
        )}

        <button
          onClick={toggleCollapsed}
          aria-label="Colapsar menú lateral"
          className={`
            w-7 h-7 rounded-lg
            hover:bg-slate-800
            flex items-center justify-center
            text-white/40 hover:text-white
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
            hover:bg-slate-800
            flex items-center justify-center
            text-white/40 hover:text-white
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
                <div className="w-1 h-3 rounded-full bg-blue-400" />
                <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/40">
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


    </aside>
  );
}
