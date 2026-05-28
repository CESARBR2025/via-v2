import { Search, X } from "lucide-react";

export function TablaInfraccionesSearch({ value, onChange, onClear }: any) {
    return (
        <div className="mt-4 border-b border-[#EAF1FC] bg-[#FAFBFF] mb-6 mt-6">
            <div className="relative max-w-sm">
                <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A96B0]"
                />

                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Buscar folio, placa o ID..."
                    className="w-full pl-10 pr-8 py-2 text-[14px] bg-white border border-[#DDE3F0] rounded-xl text-[#1A2340] placeholder-[#8A96B0] transition-all focus:outline-none focus:border-[#1F69E7] focus:ring-4 focus:ring-[#1F69E7]/[0.08]"
                />

                {value && (
                    <button
                        onClick={() => onChange('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A96B0] hover:text-[#E55353] transition"
                    >
                        <X size={15} />
                    </button>
                )}
            </div>
        </div>

    );
}