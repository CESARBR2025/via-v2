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
                border border-slate-200
                rounded-xl
                shadow-card
                ${padding}
                ${className}
            `}
        >
            {children}
        </div>
    );
}
