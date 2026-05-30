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
                h-10 rounded-lg
                transition-all duration-200
                font-medium text-[14px] w-full

                ${collapsed
                    ? "justify-center w-10 mx-auto"
                    : "gap-2.5 px-3"
                }

                text-[#EF4444]
                hover:bg-[#FEE2E2]
            `}
        >
            <Icon
                size={20}
                className="shrink-0 text-[#EF4444] transition-colors duration-200"
            />

            {!collapsed && (
                <span className="whitespace-nowrap">{label}</span>
            )}
        </button>
    );
}
