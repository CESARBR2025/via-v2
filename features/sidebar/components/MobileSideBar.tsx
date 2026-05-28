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

import { UserRole } from "../config/types";

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

    useEffect(() => {
        closeMobile();
    }, [pathname]);

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
                    bg-[rgba(10,14,30,0.72)] backdrop-blur-sm
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
                    bg-[#1D4ED8]
                    border-r border-white/[0.08]
                    p-5
                    transition-transform duration-300 ease-in-out
                    md:hidden
                    flex flex-col
                    shadow-[0_16px_48px_rgba(29,78,216,0.30)]

                    ${mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }
                `}
            >

                {/* HEADER */}

                <div className="flex items-center justify-between min-h-[52px]">
                    <Image
                        src="/ui/via-logo.png"
                        alt="VIA"
                        width={130}
                        height={45}
                        priority
                        className="h-auto object-contain brightness-0 invert"
                    />

                    <button
                        onClick={closeMobile}
                        className="
                            w-9 h-9 rounded-lg
                            hover:bg-white/[0.12]
                            flex items-center justify-center
                            text-white/50 hover:text-white
                            transition-colors
                        "
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* NAV */}

                <nav className="mt-8 flex flex-col gap-6 flex-1">
                    {navigation.map((section) => (
                        <div key={section.title} className="space-y-2">
                            <p className="
                                px-3
                                text-[11px] font-semibold tracking-[0.1em] uppercase
                                text-white/45
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

            </aside>
        </>
    );
}
