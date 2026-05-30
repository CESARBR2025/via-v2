'use client';

import { Search, Loader2 } from 'lucide-react';

interface Props {
    value: string;
    onChange: (value: string) => void;
    onSearch: () => void;
    loading: boolean;
}

export default function SearchPlaca({
    value,
    onChange,
    onSearch,
    loading,
}: Props) {
    return (
        <div className="flex w-full flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
                <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                    strokeWidth={1.5}
                />
                <input
                    type="text"
                    placeholder="Ingresa tu placa"
                    value={value}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                    className="h-13 w-full rounded-lg border border-[#E2E8F0] bg-white pl-11 pr-4 text-[15px] text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)]"
                />
            </div>

            <button
                onClick={onSearch}
                disabled={loading}
                className="flex h-13 shrink-0 items-center gap-2 rounded-lg bg-[#2563EB] px-6 text-[14px] font-semibold text-white transition-all hover:bg-[#1D4ED8] active:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Consultando...
                    </>
                ) : (
                    <>
                        <Search size={16} />
                        Buscar
                    </>
                )}
            </button>
        </div>
    );
}
