"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, ChevronDown, User, Settings, RefreshCw, Shield, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

const ROLE_LABELS: Record<string, string> = {
    super_admin: "Super Administrador",
    admin: "Administrador",
    oficial: "Oficial de Policía",
    infracciones: "Depto. Infracciones",
    liberaciones: "Depto. Liberaciones",
    fiscalia: "Fiscalía",
    juzgado_civico: "Juzgado Cívico",
    corralon_mejia: "Corralón Mejía",
    corralon_mw: "Corralón MW",
};

type Props = {
    userName: string;
    userRole: string;
    allRoles: string[];
    activeRole: string;
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

export default function UserAvatarDropdown({ userName, userRole, allRoles, activeRole }: Props) {
    const router = useRouter();

    const storeUser = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const user = storeUser ?? { name: userName, role: userRole };

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [switchingRole, setSwitchingRole] = useState<string | null>(null);

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

    async function handleSwitchRole(rol: string) {
        if (rol === activeRole || switchingRole) return;

        try {
            setSwitchingRole(rol);

            const res = await fetch("/api/auth/switch-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rol }),
            });

            const data = await res.json();

            if (data.ok && data.redirectTo) {
                setOpen(false);
                router.replace(data.redirectTo);
                router.refresh();
            }
        } catch (error) {
            console.error("Switch role error:", error);
        } finally {
            setSwitchingRole(null);
        }
    }

    const initials = getInitials(user.name);
    const firstName = getFirstName(user.name);

    const otherRoles = allRoles.filter((r) => r !== activeRole);

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
                        ? "bg-white/90 backdrop-blur-md ring-2 ring-blue-600/20"
                        : "bg-white/60 backdrop-blur-md border border-slate-200/60 hover:bg-white/90"
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
                        bg-gradient-to-br from-blue-700 to-blue-600
                        shadow-lg shadow-blue-700/20
                        ${open ? "scale-105" : ""}
                    `}
                >
                    {initials || <User size={14} />}
                </div>

                {/* Info */}
                <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-sm font-medium text-slate-900 max-w-[120px] truncate">
                        {firstName}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
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
                        absolute right-0 top-full mt-2 z-50
                        w-[280px]
                        rounded-xl
                        bg-white
                        border border-slate-200
                        shadow-modal
                        overflow-hidden
                        animate-fadeIn
                    "
                >
                    {/* Header — user info */}
                    <div className="px-4 pt-4 pb-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="
                                w-10 h-10 rounded-xl
                                bg-gradient-to-br from-blue-700 to-blue-600
                                flex items-center justify-center
                                text-white font-medium text-sm tracking-wide
                                shadow-md shadow-blue-700/20
                                "
                            >
                                {initials}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-900 truncate leading-tight">
                                    {user.name}
                                </p>
                                <p className="text-[12px] text-slate-500 truncate mt-0.5">
                                    {user.role}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-3 h-px bg-slate-100" />

                    {/* Menu items */}
                    <div className="p-1.5">
                        <Link
                            href="/oficiales/perfil"
                            onClick={() => setOpen(false)}
                            className="
                                w-full flex items-center gap-3
                                px-3 py-2.5
                                rounded-lg
                                text-sm font-medium text-slate-700
                                hover:bg-slate-100
                                transition-colors duration-150
                            "
                        >
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100">
                                <Settings size={14} className="text-slate-500" />
                            </span>
                            Mi Perfil
                        </Link>
                    </div>

                    {/* Divider */}
                    <div className="mx-3 h-px bg-slate-100" />

                    {/* Role switcher */}
                    {otherRoles.length > 0 && (
                        <div className="p-1.5">
                            <div className="px-3 py-1.5">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                    Cambiar rol
                                </p>
                            </div>
                            <div className="space-y-0.5">
                                {otherRoles.map((rol) => {
                                    const isLoading = switchingRole === rol;
                                    const label = ROLE_LABELS[rol] || rol;

                                    return (
                                        <button
                                            key={rol}
                                            type="button"
                                            onClick={() => handleSwitchRole(rol)}
                                            disabled={isLoading}
                                            className="
                                                w-full flex items-center gap-3
                                                px-3 py-2.5
                                                rounded-lg
                                                text-sm font-medium text-slate-700
                                                hover:bg-blue-50 hover:text-blue-700
                                                transition-colors duration-150
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                group
                                            "
                                        >
                                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 transition-colors">
                                                {isLoading ? (
                                                    <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Shield size={14} className="text-slate-500 group-hover:text-blue-600" />
                                                )}
                                            </span>
                                            <span className="flex-1 text-left">{label}</span>
                                            <ArrowRight size={13} className="text-slate-300 group-hover:text-blue-500 transition-colors opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="mx-3 h-px bg-slate-100" />

                    {/* Logout */}
                    <div className="p-1.5">
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={loading}
                            className="
                                w-full flex items-center gap-3
                                px-3 py-2.5
                                rounded-lg
                                text-sm font-medium
                                text-red-600
                                hover:bg-red-50
                                transition-colors duration-150
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-50">
                                <LogOut size={14} className="text-red-500" />
                            </span>
                            <span className="flex-1 text-left">
                                {loading ? "Cerrando sesión..." : "Cerrar sesión"}
                            </span>
                            {loading && (
                                <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            )}
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 text-center font-medium">
                            VIA Dashboard v2
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
