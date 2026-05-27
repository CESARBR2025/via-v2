"use client";

import { useSidebarStore } from "@/stores/sideBarStore";

type Props = {
    label: string;
    icon: any;
    onClick: () => void;
    danger?: boolean;
};

export default function SidebarActionItem({
    label,
    icon: Icon,
    onClick,
    danger = false,
}: Props) {
    const { collapsed } = useSidebarStore();

    return (
        <button
            onClick={onClick}
            title={collapsed ? label : ""}
            className={`
        group
        relative
        flex items-center
        h-12 rounded-2xl
        transition-all duration-200
        font-medium w-full

        ${collapsed ? "justify-center px-0" : "gap-3 px-4"}

        ${danger
                    ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }
      `}
        >
            <Icon size={20} className="shrink-0" />

            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
        </button>
    );
}