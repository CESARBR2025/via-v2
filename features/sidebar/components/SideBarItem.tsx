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
                group relative flex items-center
                h-[42px] rounded-lg
                transition-all duration-200
                font-medium text-sm

                ${collapsed
                    ? "justify-center w-[42px] mx-auto"
                    : "gap-3 px-3"
                }

                ${active
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:bg-white/[0.10] hover:text-white"
                }
            `}
        >
            <Icon
                size={20}
                className={`
                    shrink-0 transition-colors duration-200
                    ${active
                        ? "text-white"
                        : "text-white/45 group-hover:text-white/80"
                    }
                `}
            />

            {!collapsed && (
                <span className="whitespace-nowrap">{label}</span>
            )}
        </Link>
    );
}
