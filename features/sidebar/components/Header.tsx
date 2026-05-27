"use client";

import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";

/**
 * =========================
 * 🧪 MOCK USER (SIMULADO)
 * =========================
 * luego: useAuthStore()
 */
const user = {
  id: 1,
  name: "César Demo",
  role: "ADMIN",
};

/**
 * =========================
 * PAGE TITLE LOGIC
 * =========================
 */
const getTitle = (pathname: string) => {
  if (pathname.startsWith("/admin/usuarios")) return "Usuarios";
  if (pathname.startsWith("/admin/eventos")) return "Eventos";
  if (pathname.startsWith("/admin/configuracion")) return "Configuración";
  return "Dashboard";
};

/**
 * =========================
 * MOCK AVATAR COMPONENT
 * =========================
 * luego: UserAvatarDropdown real
 */
function UserAvatarDropdownMock() {
  return (
    <div className="w-9 h-9 rounded-full bg-[#1F69E7] text-white flex items-center justify-center text-sm font-bold">
      CD
    </div>
  );
}

/**
 * =========================
 * HEADER
 * =========================
 */
export default function Header() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  /**
   * =========================
   * 🧪 AUTH SIMULADO
   * =========================
   * const user = useAuthStore(state => state.user);
   */

  /**
   * 👉 IMPORTANTE:
   * NO bloquear render con:
   * if (!user) return null;
   */

  return (
    <header
      className="
        sticky top-0 z-50
        h-16
        bg-white
        border-b border-[#EAF1FC]
        px-4 md:px-6
        flex items-center
        shadow-[0_2px_12px_rgba(31,105,231,0.04)]
      "
    >
      {/* TITLE DESKTOP */}
      <div className="hidden md:flex items-center">
        <h1 className="text-lg font-bold text-[#1A2340]">
          {title}
        </h1>
      </div>

      {/* MOBILE BRAND */}
      <div className="flex md:hidden items-center gap-3">
        <img
          src="/conecta-pan-logo-f2.png"
          alt="logo"
          className="h-7 w-auto"
        />
      </div>

      {/* RIGHT ACTIONS */}
      <div className="ml-auto flex items-center gap-3">
        {/* NOTIFICATIONS */}
        <button
          className="
            relative w-10 h-10 rounded-2xl
            bg-[#F0F4FF]
            flex items-center justify-center
            text-[#6B778C]
            hover:bg-[#EFF4FE]
            hover:text-[#1F69E7]
            transition
          "
        >
          <Bell className="w-4 h-4" />

          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* AVATAR MOCK */}
        <UserAvatarDropdownMock />
      </div>
    </header>
  );
}