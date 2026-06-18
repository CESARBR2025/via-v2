export function CardTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-[15px] font-medium text-slate-900 mb-4">
            {children}
        </h2>
    );
}
