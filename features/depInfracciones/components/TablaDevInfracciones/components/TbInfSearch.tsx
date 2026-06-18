import { Search, X } from 'lucide-react';

export function TablaInfraccionesSearch({ value, onChange, onClear }: any) {
    return (
        <div className="px-6 py-3 border-b border-slate-200 shrink-0">
            <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.5} />

                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Buscar folio, placa o ID..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pl-10 pr-8 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
                />

                {value && (
                    <button
                        onClick={() => onClear()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-red-500"
                    >
                        <X size={15} strokeWidth={1.5} />
                    </button>
                )}
            </div>
        </div>
    );
}
