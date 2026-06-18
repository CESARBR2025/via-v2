import { ChevronDown } from "lucide-react";

export function SelectWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative">
            {children}
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <ChevronDown size={16} className="text-slate-400" strokeWidth={1.5} />
            </div>
        </div>
    );
}