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
                        ? "bg-blue-50 ring-2 ring-blue-700/20"
                        : "hover:bg-slate-50"
                    }
                `}
            >
                {/* Avatar with initials */}
                <div
                    className={`
                        w-9 h-9 rounded-lg
                        flex items-center justify-center
                        text-white font-medium text-[13px] tracking-wide
                        transition-all duration-200
                        ${open
                            ? "bg-gradient-to-br from-blue-700 to-blue-900 shadow-[0_4px_12px_rgba(37,99,235,0.3)] scale-105"
                            : "bg-gradient-to-br from-blue-700 to-blue-800 shadow-[0_2px_8px_rgba(37,99,235,0.15)]"
                        }
                    `}
                >
                    {initials || <User size={14} />}
                </div>

                {/* Info */}
                <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-sm font-medium text-slate-900 max-w-[120px] truncate">
                        {firstName}
                    </span>
                    <span className="text-[11px] font-medium text-slate-600">
                        {user.role}
                    </span>
                </div>

                {/* Arrow */}
                <ChevronDown
                    size={14}
                    className={`
                        text-slate-400 hidden md:block
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
                        border border-slate-200
                        shadow-modal
                        overflow-hidden
                    "
                >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-3.5">
                            <div
                                className="
                                w-11 h-11 rounded-xl
                                bg-gradient-to-br from-blue-700 to-blue-800
                                flex items-center justify-center
                                text-white font-medium text-sm tracking-wide
                                shadow-[0_4px_12px_rgba(37,99,235,0.25)]
                                "
                            >
                                {initials}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                    {user.name}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                                    <span className="text-[12px] text-slate-600 font-medium truncate">
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
                                text-slate-600
                                hover:bg-red-50 hover:text-red-600
                                transition-all duration-150
                                disabled:opacity-50 disabled:cursor-not-allowed
                                group
                            "
                        >
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-red-100 transition-colors duration-150">
                                <LogOut size={14} className="text-slate-400 group-hover:text-red-600 transition-colors duration-150" />
                            </span>
                            <span className="flex-1 text-left">
                                {loading ? "Cerrando sesión..." : "Cerrar sesión"}
                            </span>
                            {loading && (
                                <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            )}
                        </button>
                    </div>

                    {/* Footer hint */}
                    <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 text-center font-medium">
                            VIA Dashboard v2
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
