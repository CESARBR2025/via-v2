import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: string;
}

export default function CardTable({
    children,
    className = "",
    padding = "p-6",
}: CardProps) {
    return (
        <div
            className={`
                bg-[#FFFFFF]
                border border-[#E2E8F0]
                rounded-xl
                shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]
                ${padding}
                ${className}
            `}
        >
            {children}
        </div>
    );
}
