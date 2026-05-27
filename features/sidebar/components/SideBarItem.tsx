"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSidebarStore }
    from "@/stores/sideBarStore";

type Props = {
    label: string;
    href: string;
    icon: any;
};

export default function SidebarItem({
    label,
    href,
    icon: Icon,
}: Props) {

    const pathname = usePathname();

    const { collapsed } =
        useSidebarStore();

    const active =
        pathname === href;

    return (
        <Link
            href={href}
            title={collapsed ? label : ""}
            className={`
        group
        relative
        flex items-center
        h-12 rounded-2xl
        transition-all duration-200
        font-medium

        ${collapsed
                    ? "justify-center px-0"
                    : "gap-3 px-4"
                }

        ${active
                    ? "bg-[#0b3b60] text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }
      `}
        >

            {/* ICON */}

            <Icon
                size={20}
                className="
          shrink-0
        "
            />

            {/* LABEL */}

            {!collapsed && (

                <span
                    className="
            whitespace-nowrap
          "
                >
                    {label}
                </span>

            )}

        </Link>
    );
}