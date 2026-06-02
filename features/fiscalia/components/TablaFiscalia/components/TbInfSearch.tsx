import { Search, X } from 'lucide-react';

export function SearchFiscalia({ value, onChange, onClear }: any) {
    return (
        <div className="px-6 py-3 border-b border-[#E2E8F0] shrink-0">
            <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" strokeWidth={1.5} />

                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Buscar  nombre, folio, placa o ID..."
                    className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2 pl-10 pr-8 text-[14px] text-[#0F172A] placeholder-[#94A3B8] transition-all focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none"
                />

                {value && (
                    <button
                        onClick={() => onClear()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#EF4444]"
                    >
                        <X size={15} strokeWidth={1.5} />
                    </button>
                )}
            </div>
        </div>
    );
}
