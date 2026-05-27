"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * =========================
 * 🧪 MOCK USER
 * =========================
 */
const user = {
  id: 1,
  name: "César Demo",
  role: "ADMIN",
};

/**
 * =========================
 * 🧪 MOCK MENU
 * =========================
 */
const menuByRole: any = {
  ADMIN: [
    {
      label: "Inicio",
      href: "/dashboard",
      icon: ChevronUp,
      group: "main",
    },
    {
      label: "Usuarios",
      icon: ChevronUp,
      group: "main",
      children: [
        {
          label: "Lista",
          href: "/users",
          icon: ChevronUp,
        },
        {
          label: "Crear",
          href: "/users/create",
          icon: ChevronUp,
        },
      ],
    },
    {
      label: "Eventos",
      href: "/events",
      icon: ChevronUp,
      group: "main",
    },
    {
      label: "Configuración",
      href: "/settings",
      icon: ChevronUp,
      group: "main",
    },
  ],
};

/**
 * =========================
 * BOTTOM NAV
 * =========================
 */
export default function BottomNav() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  /**
   * =========================
   * 🧪 AUTH SIMULADO
   * =========================
   * const { user } = useAuthStore();
   */

  /**
   * 👉 IMPORTANTE:
   * NO bloquear con:
   * if (!user) return null;
   */

  const userRole = user.role;

  const navItems = menuByRole[userRole] || [];

  /**
   * Solo primeros 4 items visibles
   */
  const mainItems = navItems.slice(0, 4);

  return (
    <>
      {/* =========================
          SUBMENU FLOTANTE
      ========================= */}
      {openMenu && (
        <div className="md:hidden fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl border shadow-lg p-3 space-y-2">
          {mainItems
            .find((item: any) => item.label === openMenu)
            ?.children?.map((child: any) => {
              const isActive = pathname === child.href;
              const ChildIcon = child.icon;

              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setOpenMenu(null)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    ${isActive
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-500"
                    }
                  `}
                >
                  <ChildIcon className="w-4 h-4" />
                  {child.label}
                </Link>
              );
            })}
        </div>
      )}

      {/* =========================
          BOTTOM NAV
      ========================= */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t flex items-center px-3 pt-2 pb-safe shadow-lg">
        {mainItems.map((item: any) => {
          const Icon = item.icon;
          const hasChildren = item.children?.length > 0;

          const isActive = item.href
            ? pathname === item.href
            : item.children?.some((c: any) =>
              pathname.startsWith(c.href)
            );

          if (hasChildren) {
            return (
              <button
                key={item.label}
                onClick={() =>
                  setOpenMenu(
                    openMenu === item.label ? null : item.label
                  )
                }
                className={`
                  flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-semibold
                  ${isActive ? "text-blue-600" : "text-gray-400"}
                `}
              >
                <Icon className="w-5 h-5" />
                <div className="flex items-center gap-1">
                  {item.label}
                  <ChevronUp
                    className={`w-3 h-3 transition-transform ${openMenu === item.label ? "rotate-180" : ""
                      }`}
                  />
                </div>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`
                flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-semibold
                ${isActive ? "text-blue-600" : "text-gray-400"}
              `}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}