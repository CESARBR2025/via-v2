"use client";

import {
  ChevronDown,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

/**
 * =========================
 * 🧪 MOCK USER (SIMULADO)
 * =========================
 * Aquí luego conectas useAuthStore()
 */
const user = {
  id: 1,
  name: "César Demo",
  role: "ADMIN",
};

/**
 * =========================
 * 🧪 MOCK MENU (SIMULADO)
 * =========================
 * Aquí luego conectas menuByRole[user.role]
 */
const menuByRole: any = {
  ADMIN: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Menu,
      group: "General",
    },
    {
      label: "Usuarios",
      group: "Administración",
      icon: Menu,
      children: [
        {
          label: "Lista",
          href: "/users",
          icon: Menu,
        },
        {
          label: "Crear",
          href: "/users/create",
          icon: Menu,
        },
      ],
    },
  ],
};

/**
 * =========================
 * NAV ITEM
 * =========================
 */
function NavItem({ item }: any) {
  const pathname = usePathname();
  const Icon = item.icon;

  const hasChildren = item.children?.length > 0;

  const isActive = item.href
    ? pathname === item.href
    : item.children?.some((c: any) => pathname.startsWith(c.href));

  const [open, setOpen] = useState(isActive);

  return (
    <div>
      {hasChildren ? (
        <>
          <button
            onClick={() => setOpen(!open)}
            className={`
              w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm
              ${isActive ? "bg-blue-100 text-blue-600" : "text-gray-500"}
            `}
          >
            <Icon className="w-4 h-4" />
            {item.label}

            <ChevronDown
              className={`ml-auto w-4 h-4 transition ${open ? "rotate-0" : "-rotate-90"
                }`}
            />
          </button>

          <div
            className={`ml-6 mt-1 space-y-1 overflow-hidden transition-all ${open ? "max-h-40" : "max-h-0"
              }`}
          >
            {item.children.map((child: any) => {
              const ChildIcon = child.icon;

              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  <ChildIcon className="w-4 h-4" />
                  {child.label}
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <Link
          href={item.href}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-xl text-sm
            ${isActive ? "bg-blue-500 text-white" : "text-gray-500"}
          `}
        >
          <Icon className="w-4 h-4" />
          {item.label}
        </Link>
      )}
    </div>
  );
}

/**
 * =========================
 * SIDEBAR CONTENT
 * =========================
 */
function SidebarContent({ grouped }: any) {
  return (
    <div className="flex flex-col h-full">
      {/* LOGO */}
      <div className="flex items-center justify-center px-4 py-6 border-b">
        <div className="font-bold text-lg">LOGO</div>
      </div>

      {/* MENU */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {Object.entries(grouped).map(([group, items]: any) => (
          <div key={group}>
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">
              {group}
            </p>

            <div className="space-y-1">
              {items.map((item: any) => (
                <NavItem key={item.label} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}

/**
 * =========================
 * SIDEBAR MAIN
 * =========================
 */
export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  /**
   * =========================
   * 🧪 SIMULACIÓN AUTH
   * =========================
   * const { user } = useAuthStore();
   */

  /**
   * =========================
   * 🧪 ROLE SIMULADO
   * =========================
   */
  const userRole = user.role;

  /**
   * =========================
   * 🧪 MENU POR ROL
   * =========================
   */
  const navItems = menuByRole[userRole] || [];

  /**
   * =========================
   * GROUPING LOGIC
   * =========================
   */
  const grouped = navItems.reduce((acc: any, item: any) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  /**
   * =========================
   * CLOSE ON ROUTE CHANGE
   * =========================
   */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /**
   * =========================
   * LOCK SCROLL MOBILE
   * =========================
   */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  return (
    <>
      {/* DESKTOP */}
      <aside className="hidden md:flex w-60 h-screen flex-col bg-white border-r">
        <SidebarContent grouped={grouped} />
      </aside>

      {/* MOBILE */}
      <div className="md:hidden">
        {/* TOP BAR */}
        <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b flex items-center px-4 z-40">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>

          <span className="ml-3 font-bold">Dashboard</span>
        </header>

        {/* OVERLAY */}
        <div
          onClick={() => setMobileOpen(false)}
          className={`fixed inset-0 bg-black/40 z-40 transition ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        />

        {/* DRAWER */}
        <div
          ref={drawerRef}
          className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-50 transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <SidebarContent grouped={grouped} />
        </div>
      </div>
    </>
  );
}