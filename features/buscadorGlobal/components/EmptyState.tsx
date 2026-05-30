import { SearchX } from 'lucide-react';

export default function EmptyState() {
    return (
        <div className="flex w-full flex-col items-center gap-4 rounded-xl border border-dashed border-[#E2E8F0] bg-white px-8 py-16 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9]">
                <SearchX size={24} className="text-[#94A3B8]" strokeWidth={1.5} />
            </div>
            <div>
                <h3 className="text-[18px] font-semibold text-[#0F172A]">
                    No se encontraron infracciones
                </h3>
                <p className="mt-1 text-[14px] text-[#64748B]">
                    Verifica la placa e intenta nuevamente.
                </p>
            </div>
        </div>
    );
}
