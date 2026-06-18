import { FileText, Receipt, CheckCircle2, XCircle, Loader2, RefreshCw, Check } from "lucide-react";
import { ProcesoEstado } from "../../types.";

interface ProcesoModalProps {
    estado: ProcesoEstado;
    mensaje?: string;
    onRetry?: () => void;
}

const config: Record<ProcesoEstado, {
    icon: typeof FileText;
    bgClass: string;
    textClass: string;
    ringClass: string;
    label: string;
}> = {
    inicio: {
        icon: FileText,
        bgClass: "bg-blue-50",
        textClass: "text-blue-600",
        ringClass: "ring-blue-600/20",
        label: "",
    },
    creando: {
        icon: FileText,
        bgClass: "bg-blue-50",
        textClass: "text-blue-600",
        ringClass: "ring-blue-600/20",
        label: "Creando infracción",
    },
    documentos: {
        icon: FileText,
        bgClass: "bg-blue-50",
        textClass: "text-blue-600",
        ringClass: "ring-blue-600/20",
        label: "Creando infracción",
    },
    evidencias: {
        icon: FileText,
        bgClass: "bg-blue-50",
        textClass: "text-blue-600",
        ringClass: "ring-blue-600/20",
        label: "Creando infracción",
    },
    orden: {
        icon: Receipt,
        bgClass: "bg-amber-50",
        textClass: "text-amber-500",
        ringClass: "ring-amber-500/20",
        label: "Generando orden de pago",
    },
    completado: {
        icon: CheckCircle2,
        bgClass: "bg-green-50",
        textClass: "text-green-500",
        ringClass: "ring-green-500/20",
        label: "Completado",
    },
    error: {
        icon: XCircle,
        bgClass: "bg-red-50",
        textClass: "text-red-500",
        ringClass: "ring-red-500/20",
        label: "Error",
    },
};

const STEPS = [
    { key: "creando", label: "Registrando" },
    { key: "documentos", label: "Guardado documentos" },
    { key: "evidencias", label: "Guardado evidencias" },
    { key: "orden", label: "Orden de pago" },

    { key: "completado", label: "Finalizado" },
] as const;

function getStepIndex(estado: ProcesoEstado): number {
    if (estado === "creando") return 0;
    if (estado === "documentos") return 1;
    if (estado === "evidencias") return 2;
    if (estado === "orden") return 3;
    if (estado === "completado") return 4;
    return -1;
}

export function ProcesoModal({ estado, mensaje, onRetry }: ProcesoModalProps) {
    if (estado === "inicio") return null;

    const { icon: Icon, bgClass, textClass, ringClass, label } = config[estado];
    const isProcessing = estado === "creando" || estado === "orden";
    const isError = estado === "error";
    const currentStep = getStepIndex(estado);

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-live="polite"
            aria-label={mensaje || label}
        >
            <div
                className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-modal"
                tabIndex={-1}
            >
                {/* Visual area */}
                <div className="flex flex-col items-center px-8 pt-10 pb-6">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-5 ring-4 ${bgClass} ${ringClass}`}>
                        {isProcessing ? (
                            <Loader2 size={28} className={`animate-spin ${textClass}`} strokeWidth={1.5} />
                        ) : (
                            <Icon size={28} className={textClass} strokeWidth={1.5} />
                        )}
                    </div>

                    <p className="text-sm font-medium text-slate-900 text-center">
                        {mensaje || label}
                    </p>

                    {isProcessing && (
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            Por favor espera, esto solo toma unos segundos
                        </p>
                    )}

                    {isError && (
                        <p className="text-xs text-red-500 mt-2 text-center">
                            Revisa tu conexión e intenta de nuevo
                        </p>
                    )}
                </div>

                {/* Actions */}
                {isError && (
                    <div className="px-8 pb-8 flex flex-col gap-2">
                        {onRetry && (
                            <button
                                type="button"
                                onClick={onRetry}
                                className="w-full h-11 rounded-lg text-[13px] font-medium text-white flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 transition-all active:scale-[0.99]"
                            >
                                <RefreshCw size={15} />
                                Reintentar
                            </button>
                        )}
                        <p className="text-[10px] text-slate-400 text-center">
                            Si el problema persiste, cierra el formulario y vuelve a intentarlo
                        </p>
                    </div>
                )}

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
                                                    text-[11px] font-medium transition-all duration-300
                                                    ${isDone ? "bg-green-500 text-white" : ""}
                                                    ${isActive ? "bg-blue-600 text-white ring-4 ring-blue-600/20" : ""}
                                                    ${isPending ? "bg-slate-100 text-slate-400 border border-slate-200" : ""}
                                                `}
                                            >
                                                {isDone ? (
                                                    <Check size={14} strokeWidth={3} />
                                                ) : (
                                                    idx + 1
                                                )}
                                            </div>
                                            <span
                                                className={`
                                                    text-[10px] text-center leading-tight
                                                    ${isDone ? "text-green-500 font-medium" : ""}
                                                    ${isActive ? "text-blue-600 font-medium" : ""}
                                                    ${isPending ? "text-slate-400" : ""}
                                                `}
                                            >
                                                {step.label}
                                            </span>
                                        </div>

                                        {idx < STEPS.length - 1 && (
                                            <div
                                                className={`flex-1 h-[2px] mx-2 mt-[-18px] transition-all duration-300 ${idx < currentStep ? 'bg-green-500' : 'bg-slate-200'}`}
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
