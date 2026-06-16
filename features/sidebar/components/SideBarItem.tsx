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
                h-10 rounded-lg
                transition-all duration-200
                font-medium text-[14px]

                ${collapsed
                    ? "justify-center w-10 mx-auto"
                    : "gap-2.5 px-3"
                }

                ${active
                    ? "bg-[#EFF6FF] text-[#2563EB]"
                    : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                }
            `}
        >
            <Icon
                size={20}
                className={`
                    shrink-0 transition-colors duration-200
                    ${active
                        ? "text-[#2563EB]"
                        : "text-[#94A3B8] group-hover:text-[#64748B]"
                    }
                `}
            />

            {!collapsed && (
                <span className="whitespace-nowrap">{label}</span>
            )}
        </Link>
    );
}
