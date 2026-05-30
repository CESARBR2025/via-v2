import { FileText, Receipt, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { ProcesoEstado } from "../../types.";

interface ProcesoModalProps {
    estado: ProcesoEstado;
    mensaje?: string;
}

const config: Record<ProcesoEstado, {
    icon: typeof FileText;
    color: string;
    bgColor: string;
    ringColor: string;
    label: string;
}> = {
    inicio: {
        icon: FileText,
        color: "#2563EB",
        bgColor: "#EFF6FF",
        ringColor: "rgba(37,99,235,0.2)",
        label: "",
    },
    creando: {
        icon: FileText,
        color: "#2563EB",
        bgColor: "#EFF6FF",
        ringColor: "rgba(37,99,235,0.2)",
        label: "Creando infracción",
    },
    orden: {
        icon: Receipt,
        color: "#F59E0B",
        bgColor: "#FEF3C7",
        ringColor: "rgba(245,158,11,0.2)",
        label: "Generando orden de pago",
    },
    completado: {
        icon: CheckCircle2,
        color: "#22C55E",
        bgColor: "#DCFCE7",
        ringColor: "rgba(34,197,94,0.2)",
        label: "Completado",
    },
    error: {
        icon: XCircle,
        color: "#EF4444",
        bgColor: "#FEE2E2",
        ringColor: "rgba(239,68,68,0.2)",
        label: "Error",
    },
};

const STEPS = [
    { key: "creando", label: "Registrando" },
    { key: "orden", label: "Orden de pago" },
    { key: "completado", label: "Finalizado" },
] as const;

function getStepIndex(estado: ProcesoEstado): number {
    if (estado === "creando") return 0;
    if (estado === "orden") return 1;
    if (estado === "completado") return 2;
    return -1;
}

export function ProcesoModal({ estado, mensaje }: ProcesoModalProps) {
    if (estado === "inicio") return null;

    const { icon: Icon, color, bgColor, ringColor, label } = config[estado];
    const isProcessing = estado === "creando" || estado === "orden";
    const isError = estado === "error";
    const currentStep = getStepIndex(estado);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#FFFFFF] rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15),0_8px_20px_rgba(0,0,0,0.08)]">

                {/* Visual area */}
                <div className="flex flex-col items-center px-8 pt-10 pb-6">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                        style={{
                            backgroundColor: bgColor,
                            boxShadow: `0 0 0 4px ${ringColor}`,
                        }}
                    >
                        {isProcessing ? (
                            <Loader2
                                size={28}
                                style={{ color }}
                                className="animate-spin"
                                strokeWidth={1.5}
                            />
                        ) : (
                            <Icon
                                size={28}
                                style={{ color }}
                                strokeWidth={1.5}
                                className={isError ? "" : "animate-in fade-in zoom-in"}
                            />
                        )}
                    </div>

                    <p className="text-[16px] font-semibold text-[#0F172A] text-center">
                        {mensaje || label}
                    </p>

                    {isProcessing && (
                        <p className="text-[12px] text-[#64748B] mt-2 text-center">
                            Por favor espera, esto solo toma unos segundos
                        </p>
                    )}

                    {isError && (
                        <p className="text-[12px] text-[#EF4444] mt-2 text-center">
                            Revisa tu conexión e intenta de nuevo
                        </p>
                    )}
                </div>

                {/* Progress stepper */}
                {currentStep >= 0 && (
                    <div className="px-8 pb-8">
                        <div className="flex items-center justify-between">
                            {STEPS.map((step, idx) => {
                                const isDone = idx < currentStep;
                                const isActive = idx === currentStep;
                                const isPending = idx > currentStep;

                                return (
                                    <div key={step.key} className="flex items-center flex-1 last:flex-none">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div
                                                className={`
                                                    w-7 h-7 rounded-full flex items-center justify-center
                                                    text-[11px] font-bold transition-all duration-300
                                                    ${isDone ? "bg-[#22C55E] text-white" : ""}
                                                    ${isActive ? "bg-[#2563EB] text-white ring-4 ring-[#2563EB]/20" : ""}
                                                    ${isPending ? "bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0]" : ""}
                                                `}
                                            >
                                                {isDone ? (
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                    </svg>
                                                ) : (
                                                    idx + 1
                                                )}
                                            </div>
                                            <span
                                                className={`
                                                    text-[10px] text-center leading-tight
                                                    ${isDone ? "text-[#22C55E] font-medium" : ""}
                                                    ${isActive ? "text-[#2563EB] font-semibold" : ""}
                                                    ${isPending ? "text-[#94A3B8]" : ""}
                                                `}
                                            >
                                                {step.label}
                                            </span>
                                        </div>

                                        {idx < STEPS.length - 1 && (
                                            <div
                                                className="flex-1 h-[2px] mx-2 mt-[-18px] transition-all duration-300"
                                                style={{
                                                    background: idx < currentStep ? "#22C55E" : "#E2E8F0",
                                                }}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
