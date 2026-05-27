"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export default function UserAvatarDropdown() {
    const router = useRouter();

    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    /**
     * cerrar al click fuera
     */
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /**
     * logout centralizado
     */
    async function handleLogout() {
        try {
            setLoading(true);

            await fetch("/api/auth/logout", {
                method: "POST",
            });

            logout(); // 👈 Zustand reset

            router.replace("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setLoading(false);
        }
    }

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="
          flex items-center gap-3
          rounded-2xl
          px-2 py-1.5
          hover:bg-[#EFF4FE]
          transition-all duration-200
        "
            >
                {/* Avatar */}
                <div
                    className="
            w-10 h-10 rounded-2xl
            bg-gradient-to-br from-[#1F69E7] to-[#3E83F0]
            flex items-center justify-center
            text-white font-semibold text-sm
            shadow-[0_6px_18px_rgba(31,105,231,0.18)]
            border border-white/30
            transition-transform duration-200
            hover:scale-[1.03]
          "
                >
                    {user.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold text-[#1A2340] max-w-[140px] truncate">
                        {user.name}
                    </span>

                    <span className="text-xs font-medium text-[#8A96B0]">
                        {user.role}
                    </span>
                </div>

                {/* Arrow */}
                <ChevronDown
                    className={`
            w-4 h-4 text-[#6B778C]
            transition-transform duration-200
            ${open ? "rotate-180" : ""}
          `}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    className="
            absolute right-0 top-16 z-50
            w-[280px]
            rounded-3xl
            bg-white
            border border-[#EAF1FC]
            shadow-[0_20px_50px_rgba(31,105,231,0.10)]
            overflow-hidden
            animate-in fade-in zoom-in-95 duration-200
          "
                >
                    {/* Header */}
                    <div
                        className="
              px-5 py-5
              bg-gradient-to-b from-[#FAFBFF] to-white
              border-b border-[#EEF2F8]
            "
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="
                  w-11 h-11 rounded-2xl
                  bg-gradient-to-br from-[#1F69E7] to-[#3E83F0]
                  flex items-center justify-center
                  text-white font-semibold text-sm
                  shadow-[0_6px_18px_rgba(31,105,231,0.18)]
                "
                            >
                                {user.name.charAt(0)}
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#1A2340] truncate">
                                    {user.name}
                                </p>

                                <p className="text-xs text-[#8A96B0] font-medium mt-1">
                                    {user.role}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-3">
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={loading}
                            className="
                w-full flex items-center gap-3
                px-4 py-3.5
                rounded-2xl
                text-sm font-semibold
                text-[#B54747]
                hover:bg-[#FFF0F0]
                transition-all duration-200
                disabled:opacity-70
              "
                        >
                            <LogOut className="w-4 h-4" />

                            {loading ? "Cerrando sesión..." : "Cerrar sesión"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}