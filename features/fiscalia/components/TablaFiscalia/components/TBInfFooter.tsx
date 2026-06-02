import { ListChecks } from 'lucide-react';

export function TablaFiscaliaFooter({ count, page, total }: any) {
    return (
        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-[#E2E8F0] bg-white px-6 py-3 text-[12px] font-medium text-[#94A3B8]">
            <div className="flex items-center gap-1.5">
                <ListChecks size={14} strokeWidth={1.5} />
                <span>
                    Mostrando {count} de {total} registros
                </span>
            </div>
            <span className="rounded-md bg-[#F1F5F9] px-2.5 py-0.5 text-[11px] font-semibold text-[#64748B]">
                Página {page}
            </span>
        </div>
    );
}
