"use client";

import Image from "next/image";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import SidebarItem from "./SideBarItem";

import { navigationByRole }
    from "../config/navigation";

import { useSidebarStore }
    from "@/stores/sideBarStore";

import { UserRole } from "../types";

type Props = {
    role: UserRole;
};

export default function MobileSidebar({
    role,
}: Props) {

    const pathname = usePathname();

    const {
        mobileOpen,
        closeMobile,
    } = useSidebarStore();

    const navigation =
        navigationByRole[role] || [];

    // ==========================================
    // CERRAR AL NAVEGAR
    // ==========================================

    useEffect(() => {

        closeMobile();

    }, [pathname]);

    // ==========================================
    // BLOQUEAR SCROLL BODY
    // ==========================================

    useEffect(() => {

        if (mobileOpen) {

            document.body.style.overflow =
                "hidden";

        } else {

            document.body.style.overflow =
                "";

        }

        return () => {

            document.body.style.overflow =
                "";

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
                    w-72
                    bg-[#1A2732]
                    border-r border-slate-800
                    p-4
                    transition-transform duration-300
                    md:hidden
                    flex flex-col

                    ${mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }
                `}
            >

                {/* HEADER */}

                <div
                    className="
                        h-16
                        flex items-center
                        justify-between
                    "
                >

                    <Image
                        src="/ui/via-logo.png"
                        alt="VIA"
                        width={150}
                        height={50}
                        priority
                        className="
                            h-auto
                            object-contain
                        "
                    />

                    <button
                        onClick={closeMobile}
                        className="
                            w-10 h-10 rounded-xl
                            hover:bg-white/10
                            flex items-center justify-center
                            text-white
                        "
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* NAV */}

                <nav
                    className="
                        mt-6
                        flex flex-col gap-8
                    "
                >

                    {navigation.map((section) => (

                        <div
                            key={section.title}
                            className="space-y-2"
                        >

                            {/* TITLE */}

                            <p
                                className="
                                    px-3
                                    text-[11px]
                                    font-black
                                    tracking-widest
                                    text-slate-400
                                "
                            >
                                {section.title}
                            </p>

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

            </aside>
        </>
    );
}