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
                h-[42px] rounded-xl
                transition-all duration-200
                font-medium text-sm w-full

                ${collapsed
                    ? "justify-center w-[42px] mx-auto"
                    : "gap-3 px-3"
                }

                text-red-400/80
                hover:bg-red-500/10 hover:text-red-300
            `}
        >
            <Icon
                size={20}
                className="shrink-0 text-red-400/60 group-hover:text-red-300 transition-colors duration-200"
            />

            {!collapsed && (
                <span className="whitespace-nowrap">
                    {label}
                </span>
            )}
        </button>
    );
}
