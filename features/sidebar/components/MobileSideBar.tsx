"use client";

import Image from "next/image";

import { X, LogOut, ChevronUp } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

import SidebarItem from "./SideBarItem";

import { navigationByRole }
    from "../config/navigation";

import { useSidebarStore }
    from "@/stores/sideBarStore";

import { UserRole } from "../config/types";
import { useAuthStore } from "@/stores/useAuthStore";
import LoaderOverlay from "@/features/auth/components/LoaderOverlay";

type Props = {
    role: UserRole;
    userName?: string;
    userRole?: string;
};

export default function MobileSidebar({
    role,
    userName,
    userRole,
}: Props) {
    const router = useRouter();
    const logout = useAuthStore((s) => s.logout);
    const [loggingOut, setLoggingOut] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const firstName = userName?.split(" ")[0] || userName || "";

    const pathname = usePathname();

    const {
        mobileOpen,
        closeMobile,
    } = useSidebarStore();

    const navigation =
        navigationByRole[role] || [];

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } finally {
            logout();
            router.replace("/login");
        }
    };

    useEffect(() => {
        closeMobile();
        setUserMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        }
        if (userMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [userMenuOpen]);

    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    return (
        <>
            {/* OVERLAY */}

            <div
                onClick={closeMobile}
                className={`
                    fixed inset-0 z-40
                    bg-black/50
                    transition-opacity duration-300
                    md:hidden

                    ${mobileOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                    }
                `}
            />

            {/* DRAWER */}

            <aside
                className={`
                    fixed top-0 left-0 bottom-0
                    z-50
                    w-[280px]
                    bg-slate-900
                    border-r border-white/10
                    p-6
                    transition-transform duration-300 ease-in-out
                    md:hidden
                    flex flex-col
                    shadow-modal

                    ${mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }
                `}
            >

                {/* HEADER */}

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow-sm">
                            <span className="text-sm font-medium text-white tracking-tight leading-none">
                                VIA
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={closeMobile}
                        className="
                            w-9 h-9 rounded-lg
                            hover:bg-slate-800
                            flex items-center justify-center
                            text-white/55 hover:text-white/75
                            transition-colors
                        "
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* NAV */}

                <nav className="flex flex-col gap-6 flex-1">
                    {navigation.map((section) => (
                        <div key={section.title} className="space-y-1">
                            <p className="
                                px-3 mb-2
                                text-[10px] font-medium tracking-[0.12em] uppercase
                                text-white/40
                            ">
                                {section.title}
                            </p>

                            <div className="flex flex-col gap-0.5">
                                {section.items.map((item: any) => (
                                    <SidebarItem key={item.href} {...item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* FOOTER */}

                <div className="pt-4 mt-auto border-t border-white/10">
                    {userName && (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen((prev) => !prev)}
                                className={`
                                    w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-left
                                    ${userMenuOpen ? "bg-blue-700/20" : "hover:bg-slate-800"}
                                `}
                            >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-medium text-white">
                                        {userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-[12px] font-medium text-white truncate leading-tight">
                                        {firstName}
                                    </p>
                                    {userRole && (
                                        <span className="text-[9px] font-medium text-blue-300 bg-blue-700/20 px-1.5 py-0.5 rounded-full inline-block mt-0.5 leading-tight">
                                            {userRole}
                                        </span>
                                    )}
                                </div>

                                <ChevronUp
                                    size={14}
                                    strokeWidth={2}
                                    className={`shrink-0 text-white/40 transition-transform duration-200 ${userMenuOpen ? "rotate-0" : "rotate-180"}`}
                                />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-slate-200 shadow-md rounded-xl p-2 z-50 animate-fadeIn">
                                    <button
                                        onClick={handleLogout}
                                        className="
                                            w-full flex items-center gap-3
                                            h-10 px-3.5 rounded-xl
                                            bg-red-50 text-red-600
                                            hover:bg-red-100 active:bg-red-200
                                            transition-all duration-200
                                            font-medium text-[13px]
                                            group
                                        "
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0 transition-colors group-hover:bg-white">
                                            <LogOut size={14} strokeWidth={2} className="text-red-600" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <span className="block leading-tight">Cerrar sesión</span>
                                            <span className="block text-[10px] font-normal text-slate-400 leading-tight mt-0.5">
                                                Salir del sistema
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <LoaderOverlay show={loggingOut} text="Saliendo del sistema..." />

            </aside>
        </>
    );
}
