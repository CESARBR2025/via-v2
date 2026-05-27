export function CardTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full bg-[#0076aa]" />
            <h2 className="text-base font-bold text-slate-800">{children}</h2>
        </div>
    );
}
