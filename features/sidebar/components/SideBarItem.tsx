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
            aria-current={active ? "page" : undefined}
            className={`
                group relative flex items-center
                h-10 py-2 rounded-lg
                transition-all duration-200
                font-medium text-[14px]

                ${collapsed
                    ? "justify-center w-10 mx-auto"
                    : "gap-2.5 px-3"
                }

${active
    ? "bg-white/20 text-white"
    : "text-white/55 hover:bg-white/12 hover:text-white/80"
}
            `}
        >
            <Icon
                size={20}
                strokeWidth={1.5}
                className={`
                    shrink-0 transition-colors duration-200
                    ${active
                        ? "text-white"
                        : "text-white/40 group-hover:text-white/70"
                    }
                `}
            />

            {!collapsed && (
                <span className="whitespace-nowrap">{label}</span>
            )}
        </Link>
    );
}
