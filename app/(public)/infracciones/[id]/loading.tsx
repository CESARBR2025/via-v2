import { FileSearch } from 'lucide-react';

export default function Loading() {
    return (
        <main className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-4">
            <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-[0_4px_12px_rgba(0,0,0,0.07),0_1px_3px_rgba(0,0,0,0.04)] p-10 max-w-md w-full">
                <div className="flex flex-col items-center text-center space-y-6">

                    <div className="relative">
                        <div className="w-14 h-14 border-4 border-[#E2E8F0] border-t-[#2563EB] rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <FileSearch size={18} className="text-[#2563EB]" strokeWidth={1.5} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-[22px] font-bold text-[#0F172A]">
                            Consultando infracción
                        </h2>
                        <p className="text-sm text-[#64748B] leading-relaxed max-w-xs mx-auto">
                            Estamos verificando el estado de la orden de pago. Esto puede tardar unos segundos.
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>

                </div>
            </div>
        </main>
    );
}
