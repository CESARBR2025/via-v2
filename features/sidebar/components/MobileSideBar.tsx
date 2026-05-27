"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { navigation } from "../config/navigation";


import SidebarItem from "./SideBarItem";


import { useSidebarStore } from "@/stores/sideBarStore";

export default function MobileSidebar() {

    const pathname = usePathname();

    const {
        mobileOpen,
        closeMobile,
    } = useSidebarStore();

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
                    bg-white
                    border-r border-slate-200
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

                <div className="
                    h-16
                    flex items-center
                    justify-between
                ">

                    <h2 className="
                        text-2xl font-black
                        text-[#0b3b60]
                    ">
                        VIA
                    </h2>

                    <button
                        onClick={closeMobile}
                        className="
                            w-10 h-10 rounded-xl
                            hover:bg-slate-100
                            flex items-center justify-center
                        "
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* NAV */}

                <nav className="
                    mt-6
                    flex flex-col gap-2
                ">

                    {navigation.map((item) => (

                        <SidebarItem
                            key={item.href}
                            {...item}
                        />

                    ))}

                </nav>

            </aside>
        </>
    );
}