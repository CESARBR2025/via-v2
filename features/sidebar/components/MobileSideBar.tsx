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
                    bg-[#FFFFFF]
                    border-r border-[#E2E8F0]
                    p-6
                    transition-transform duration-300 ease-in-out
                    md:hidden
                    flex flex-col
                    shadow-[0_20px_60px_rgba(0,0,0,0.15),0_8px_20px_rgba(0,0,0,0.08)]

                    ${mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }
                `}
            >

                {/* HEADER */}

                <div className="flex items-center justify-between mb-8">
                    <Image
                        src="/ui/via-logo.png"
                        alt="VIA"
                        width={130}
                        height={45}
                        priority
                        className="h-auto object-contain"
                    />

                    <button
                        onClick={closeMobile}
                        className="
                            w-9 h-9 rounded-lg
                            hover:bg-[#F8FAFC]
                            flex items-center justify-center
                            text-[#64748B] hover:text-[#0F172A]
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
                                text-[10px] font-semibold tracking-[0.12em] uppercase
                                text-[#64748B]
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
