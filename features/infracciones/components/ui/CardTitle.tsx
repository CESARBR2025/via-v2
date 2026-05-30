export function CardTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 rounded-full bg-[#2563EB]" />
            <h2 className="text-base font-semibold text-[#0F172A]">{children}</h2>
        </div>
    );
}
