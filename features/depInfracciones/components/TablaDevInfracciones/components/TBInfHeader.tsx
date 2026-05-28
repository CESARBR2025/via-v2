import { FileText, Layers } from "lucide-react";

export function TablaInfraccionesHeader({ count, total }: any) {
    return (
        <div className="shrink-0 mb-2  flex items-center pb-2 justify-between border-b border-[#EAF1FC]">
            <div className="flex  gap-3">
                {/* Icon Container con el Soft Blue y Primary */}
                <div className="w-10 h-10 rounded-full bg-[#F0F4FF] 
                        flex items-center justify-center text-[#1F69E7]">
                    <FileText size={20} />
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-[#1A2340] tracking-tight">
                        Infracciones pendientes
                    </h2>
                    <p className="text-sm  text-gray-400 mt-0.5">
                        Gestiona los roles asignados a los usuarioss
                    </p>
                </div>
            </div>

            {/* Badge de Conteo Global */}
            <div className="flex items-center gap-1.5 bg-[#F0F4FF] text-[#1F69E7]
                     font-medium text-xs px-2.5 py-1 rounded-lg">
                <Layers size={13} />
                <span>{count} / {total}</span>
            </div>
        </div>


    );
}