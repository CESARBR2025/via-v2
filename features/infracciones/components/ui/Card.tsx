export function Card({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`bg-white rounded-xl border border-slate-200 p-5 shadow-card ${className}`}
        >
            {children}
        </div>
    );
}
