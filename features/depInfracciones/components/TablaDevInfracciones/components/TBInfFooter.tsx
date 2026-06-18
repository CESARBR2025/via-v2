import { ListChecks } from 'lucide-react';

export function TablaInfraccionesFooter({ count, page, total }: any) {
    return (
        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-200 bg-white px-6 py-3 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-1.5">
                <ListChecks size={14} strokeWidth={1.5} />
                <span>
                    Mostrando {count} de {total} registros
                </span>
            </div>
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                Página {page}
            </span>
        </div>
    );
}
