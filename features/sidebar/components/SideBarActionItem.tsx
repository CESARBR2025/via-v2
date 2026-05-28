"use client";

import { useSidebarStore } from "@/stores/sideBarStore";

type Props = {
    label: string;
    icon: any;
    onClick: () => void;
};

export default function SidebarActionItem({
    label,
    icon: Icon,
    onClick,
}: Props) {
    const { collapsed } = useSidebarStore();

    return (
        <button
            onClick={onClick}
            title={collapsed ? label : ""}
            className={`
                group relative flex items-center
                h-[42px] rounded-lg
                transition-all duration-200
                font-medium text-sm w-full

                ${collapsed
                    ? "justify-center w-[42px] mx-auto"
                    : "gap-3 px-3"
                }

                text-red-300
                hover:bg-white/10 hover:text-red-200
            `}
        >
            <Icon
                size={20}
                className="shrink-0 text-red-300/70 group-hover:text-red-200 transition-colors duration-200"
            />

            {!collapsed && (
                <span className="whitespace-nowrap">{label}</span>
            )}
        </button>
    );
}
