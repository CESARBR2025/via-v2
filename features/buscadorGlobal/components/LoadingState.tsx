import { Loader2 } from 'lucide-react';

export default function LoadingState() {
    return (
        <div className="flex w-full flex-col items-center gap-4 rounded-xl border border-[#E2E8F0] bg-white px-8 py-16 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
            <Loader2 size={36} className="animate-spin text-[#2563EB]" strokeWidth={2} />
            <p className="text-[14px] text-[#64748B]">
                Consultando infracciones...
            </p>
        </div>
    );
}
