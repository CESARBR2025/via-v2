"use client";

import Image from "next/image";

import {
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { navigationByRole }
  from "../config/navigation";

import SidebarItem
  from "./SideBarItem";

import { UserRole }
  from "../types";

import { useSidebarStore }
  from "@/stores/sideBarStore";
import SidebarActionItem from "./SideBarActionItem";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      logout();
      router.replace("/login");
    }
  };

  return (
    <aside
      className={`
        hidden md:flex
        border-r border-white/[0.06]
        bg-[#13294B]
        flex-col
        overflow-y-auto
        transition-all duration-300 ease-in-out

        ${collapsed
          ? "w-[72px] py-4 px-3"
          : "w-64 py-5 px-4"
        }
      `}
    >

      {/* HEADER */}

      <div
        className={`
          flex items-center
          ${collapsed
            ? "justify-center"
            : "justify-between"
          }
          min-h-[52px]
        `}
      >

        {/* LOGO */}

        {!collapsed && (
          <Image
            src="/ui/via-logo.png"
            alt="VIA"
            width={100}
            height={60}
            priority
            className="
              h-auto
              object-contain brightness-0 invert
            "
          />
        )}

        {collapsed && (
          <div
            className="
              w-10 h-10 rounded-xl
              bg-[#1F69E7]
              flex items-center justify-center
              text-white font-black text-base
              shadow-lg shadow-[#1F69E7]/25
            "
          >
            V
          </div>
        )}

        {/* TOGGLE */}

        <button
          onClick={toggleCollapsed}
          className={`
            w-8 h-8 rounded-lg
            hover:bg-white/[0.08]
            flex items-center justify-center
            text-white/50 hover:text-white
            transition-colors duration-200
            ${collapsed ? "hidden" : ""}
          `}
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>

      </div>

      {/* COLLAPSE TOGGLE (when collapsed) */}

      {collapsed && (
        <button
          onClick={toggleCollapsed}
          className="
            mt-3 w-full h-8 rounded-lg
            hover:bg-white/[0.08]
            flex items-center justify-center
            text-white/50 hover:text-white
            transition-colors duration-200
          "
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      )}

      {/* NAV */}

      <nav
        className="
          flex flex-col
          gap-6
          mt-6
          flex-1
        "
      >
        {sections.map((section) => (
          <div
            key={section.title}
            className="space-y-2"
          >

            {!collapsed && (
              <p
                className="
                  px-3
                  text-[11px]
                  font-semibold
                  tracking-[0.1em]
                  uppercase
                  text-white/40
                "
              >
                {section.title}
              </p>
            )}

            <div
              className="
                flex flex-col gap-0.5
              "
            >
              {section.items.map((item: any) => (
                <SidebarItem
                  key={item.href}
                  {...item}
                />
              ))}
            </div>

          </div>
        ))}
      </nav>

      {/* FOOTER */}

      <div className="
        pt-4 mt-auto
        border-t border-white/[0.06]
      ">
        {!collapsed && (
          <div
            className="
              rounded-xl
              bg-white/[0.04]
              p-2
              border border-white/[0.06]
            "
          >
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

    </aside>
  );
}
