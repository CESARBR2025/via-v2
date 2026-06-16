"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronDown, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

type Props = {
    userName: string;
    userRole: string;
};

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "?";
    const first = parts[0].charAt(0).toUpperCase();
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : "";
    return first + last;
}

function getFirstName(name: string): string {
    return name.trim().split(/\s+/)[0] || name;
}

export default function UserAvatarDropdown({ userName, userRole }: Props) {
    const router = useRouter();

    const storeUser = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const user = storeUser ?? { name: userName, role: userRole };

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

    const initials = getInitials(user.name);
    const firstName = getFirstName(user.name);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`
                    flex items-center gap-2.5
                    rounded-xl
                    px-2.5 py-2
                    transition-all duration-200
                    ${open
                        ? "bg-[#EFF6FF] ring-2 ring-[#2563EB]/20"
                        : "hover:bg-[#F8FAFC]"
                    }
                `}
            >
                {/* Avatar with initials */}
                <div
                    className={`
                        w-9 h-9 rounded-lg
                        flex items-center justify-center
                        text-white font-bold text-[13px] tracking-wide
                        transition-all duration-200
                        ${open
                            ? "bg-gradient-to-br from-[#1D4ED8] to-[#1E3A8A] shadow-[0_4px_12px_rgba(37,99,235,0.3)] scale-105"
                            : "bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] shadow-[0_2px_8px_rgba(37,99,235,0.15)]"
                        }
                    `}
                >
                    {initials || <User size={14} />}
                </div>

                {/* Info */}
                <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold text-[#0F172A] max-w-[120px] truncate">
                        {firstName}
                    </span>
                    <span className="text-[11px] font-medium text-[#64748B]">
                        {user.role}
                    </span>
                </div>

                {/* Arrow */}
                <ChevronDown
                    size={14}
                    className={`
                        text-[#94A3B8] hidden md:block
                        transition-transform duration-200
                        ${open ? "rotate-180" : ""}
                    `}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    className="
                        absolute right-0 top-13 z-50
                        w-[270px]
                        rounded-xl
                        bg-white
                        border border-[#E2E8F0]
                        shadow-[0_20px_60px_rgba(0,0,0,0.12),0_8px_20px_rgba(0,0,0,0.06)]
                        overflow-hidden
                    "
                >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-[#F1F5F9]">
                        <div className="flex items-center gap-3.5">
                            <div
                                className="
                                    w-11 h-11 rounded-xl
                                    bg-gradient-to-br from-[#2563EB] to-[#1D4ED8]
                                    flex items-center justify-center
                                    text-white font-bold text-sm tracking-wide
                                    shadow-[0_4px_12px_rgba(37,99,235,0.25)]
                                "
                            >
                                {initials}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-[#0F172A] truncate">
                                    {user.name}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                                    <span className="text-[12px] text-[#64748B] font-medium truncate">
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-2">
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={loading}
                            className="
                                w-full flex items-center gap-3
                                px-3.5 py-2.5
                                rounded-lg
                                text-sm font-medium
                                text-[#64748B]
                                hover:bg-[#FEE2E2] hover:text-[#DC2626]
                                transition-all duration-150
                                disabled:opacity-50 disabled:cursor-not-allowed
                                group
                            "
                        >
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#F1F5F9] group-hover:bg-[#FECACA] transition-colors duration-150">
                                <LogOut size={14} className="text-[#94A3B8] group-hover:text-[#DC2626] transition-colors duration-150" />
                            </span>
                            <span className="flex-1 text-left">
                                {loading ? "Cerrando sesión..." : "Cerrar sesión"}
                            </span>
                            {loading && (
                                <span className="w-4 h-4 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
                            )}
                        </button>
                    </div>

                    {/* Footer hint */}
                    <div className="px-5 py-2.5 bg-[#F8FAFC] border-t border-[#F1F5F9]">
                        <p className="text-[10px] text-[#94A3B8] text-center font-medium">
                            VIA Dashboard v2
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
