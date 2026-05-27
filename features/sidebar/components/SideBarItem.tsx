"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

    const active = pathname === href;

    return (
        <Link
            href={href}
            className={`
                flex items-center gap-3
                h-12 px-4 rounded-2xl
                transition-all
                font-medium
                ${active
                    ? "bg-[#0b3b60] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }
            `}
        >
            <Icon size={20} />

            <span>{label}</span>
        </Link>
    );
}