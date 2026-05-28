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
                bg-white
                border border-gray-100
                rounded-2xl
                shadow-[0px_6px_18px_rgba(17,24,39,0.08),0px_2px_6px_rgba(31,105,231,0.06)]
                ${padding}
                ${className}
            `}
        >
            {children}
        </div>
    );
}