"use client";

import Image from "next/image";

import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
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
        border-r border-slate-200
        bg-[#1A2732]
        flex-col
        overflow-y-auto
        transition-all duration-300

        ${collapsed
          ? "w-24 p-3"
          : "w-72 p-4"
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
              object-contain
            "
          />


        )}

        {/* MINI LOGO */}

        {collapsed && (

          <div
            className="
              w-12 h-12 rounded-2xl
              bg-[#243544]
              flex items-center justify-center
              text-white font-black text-lg
            "
          >
            V
          </div>

        )}

        {/* TOGGLE */}

        <button
          onClick={toggleCollapsed}
          className="
            w-10 h-10 rounded-xl
            hover:bg-white/10
            flex items-center justify-center
            text-slate-300
            transition
          "
        >

          {collapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}

        </button>

      </div>

      {/* NAV */}

      <nav
        className="
          flex flex-col
          gap-8
          mt-8
        "
      >

        {sections.map((section) => (

          <div
            key={section.title}
            className="space-y-3"
          >

            {/* SECTION TITLE */}

            {!collapsed && (

              <p
                className="
                  px-3
                  text-[11px]
                  font-black
                  tracking-[0.2em]
                  uppercase
                  text-slate-500
                "
              >
                {section.title}
              </p>

            )}

            {/* ITEMS */}

            <div
              className="
                flex flex-col gap-1
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

      <div
        className="
          mt-auto pt-6
        "
      >

        {!collapsed && (

          <div
            className="
              rounded-2xl
              bg-[#243544]
              p-4
              border border-white/5
            "
          >

            <SidebarActionItem
              label="Cerrar sesión"
              icon={LogOut}
              onClick={handleLogout}
              danger
            />

          </div>

        )}

      </div>

    </aside>
  );
}