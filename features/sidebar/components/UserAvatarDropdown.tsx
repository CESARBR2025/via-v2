"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

type Props = {
    simulatedName?: string;
    simulatedRole?: string;
};

export default function UserAvatarDropdown({
    simulatedName,
    simulatedRole,
}: Props = {}) {
    const router = useRouter();

    const storeUser = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const user = storeUser ?? {
        name: simulatedName ?? "Usuario",
        role: simulatedRole ?? "Sin rol",
    };

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

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

    async function handleLogout() {
        try {
            setLoading(true);

            await fetch("/api/auth/logout", {
                method: "POST",
            });

            logout();

            router.replace("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setLoading(false);
        }
    }

    const isSimulated = !storeUser;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="
          flex items-center gap-3
          rounded-lg
          px-2 py-1.5
          hover:bg-[#F8FAFC]
          transition-all duration-200
        "
            >
                {/* Avatar */}
                <div
                    className="
            w-10 h-10 rounded-lg
            bg-gradient-to-br from-[#2563EB] to-[#1D4ED8]
            flex items-center justify-center
            text-white font-semibold text-sm
            shadow-[0_6px_20px_rgba(37,99,235,0.15)]
            border border-white/30
            transition-transform duration-200
            hover:scale-[1.03]
          "
                >
                    {user.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold text-[#0F172A] max-w-[140px] truncate">
                        {user.name}
                    </span>

                    <span className="text-xs font-medium text-[#64748B]">
                        {user.role}
                    </span>
                </div>

                {/* Arrow */}
                <ChevronDown
                    className={`
            w-4 h-4 text-[#64748B]
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
            rounded-xl
            bg-white
            border border-[#E2E8F0]
            shadow-[0_20px_60px_rgba(0,0,0,0.15),0_8px_20px_rgba(0,0,0,0.08)]
            overflow-hidden
            animate-in fade-in zoom-in-95 duration-200
          "
                >
                    {/* Header */}
                    <div
                        className="
              px-5 py-5
              bg-white
              border-b border-[#F1F5F9]
            "
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="
                  w-11 h-11 rounded-lg
                  bg-gradient-to-br from-[#2563EB] to-[#1D4ED8]
                  flex items-center justify-center
                  text-white font-semibold text-sm
                  shadow-[0_6px_20px_rgba(37,99,235,0.15)]
                "
                            >
                                {user.name.charAt(0)}
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#0F172A] truncate">
                                    {user.name}
                                </p>

                                <p className="text-xs text-[#64748B] font-medium mt-1">
                                    {user.role}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-3">
                        <button
                            type="button"
                            onClick={isSimulated ? () => router.push("/login") : handleLogout}
                            disabled={loading}
                            className="
                w-full flex items-center gap-3
                px-4 py-3.5
                rounded-lg
                text-sm font-semibold
                text-[#EF4444]
                hover:bg-[#FEE2E2]
                transition-all duration-200
                disabled:opacity-70
              "
                        >
                            <LogOut className="w-4 h-4" />

                            {loading ? "Cerrando sesión..." : isSimulated ? "Cerrar sesión" : "Cerrar sesión"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}