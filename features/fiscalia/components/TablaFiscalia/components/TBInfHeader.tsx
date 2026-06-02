import { FileText, Layers } from 'lucide-react';

export function TablaFiscaliaHeader({ count, total }: any) {
    return (
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#E2E8F0] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                    <FileText size={20} strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                    <h2 className="text-[16px] font-semibold text-[#0F172A] truncate">
                        Infractores a procesar
                    </h2>
                    <p className="text-[12px] text-[#64748B] mt-0.5 truncate">
                        Gestiona las infracciones relacionadas a los infractores
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#EFF6FF] px-3 py-1.5 text-[12px] font-semibold text-[#2563EB]">
                <Layers size={14} strokeWidth={1.5} />
                <span>
                    {count} / {total}
                </span>
            </div>
        </div>
    );
}
