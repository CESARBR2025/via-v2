import React from 'react';
import { CheckCircle, Info, Loader2, CreditCard, ExternalLink, ScanLine } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface InfraccionCreada {
    id: string | number;
    folio: string;
}

interface PasoPagoProps {
    infraccionCreada: InfraccionCreada | null;
    pagado: boolean;
    deseaPagar: boolean | null;
    setDeseaPagar: (value: boolean | null) => void;
    datos: {
        garantiaSeleccionada?: string;
        [key: string]: any;
    };
    verificarPago: () => Promise<void> | void;
    onFinalizarSinPago?: () => Promise<void> | void;
    loading: boolean;
}

export const PasoPago: React.FC<PasoPagoProps> = ({
    infraccionCreada,
    pagado,
    deseaPagar,
    setDeseaPagar,
    datos,
    verificarPago,
    onFinalizarSinPago,
    loading,
}) => {
    if (!infraccionCreada) return null;

    const baseUrl =
        process.env.NODE_ENV === 'production'
            ? 'https://via-v2.vercel.app'
            : 'http://localhost:3000';

    const urlVistaCiudadano = `${baseUrl}/infracciones/${infraccionCreada.id}`;

    if (pagado) {
        return (
            <div className="pb-8">
                <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-[#22C55E] to-[#16A34A]" />

                    <div className="p-10 text-center space-y-8">
                        <div className="w-20 h-20 rounded-2xl bg-[#DCFCE7] flex items-center justify-center mx-auto shadow-[0_0_0_4px_rgba(34,197,94,0.15)]">
                            <CheckCircle size={44} className="text-[#22C55E]" strokeWidth={1.5} />
                        </div>

                        <div className="space-y-3">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DCFCE7] text-[#16A34A] border border-[#22C55E]/30 text-sm font-bold">
                                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                                Pago Confirmado
                            </span>

                            <h2 className="text-[22px] font-bold text-[#0F172A] leading-tight">
                                Infracción Liquidada
                            </h2>

                            <p className="text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
                                El pago fue validado correctamente. El ciudadano puede continuar su camino.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold text-sm py-3.5 px-4 rounded-lg shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all active:scale-[0.98]"
                        >
                            Salir
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* DECISION PANEL */}
            <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-6 space-y-5">
                <div className="flex items-center gap-2 justify-center">
                    <CreditCard size={14} className="text-[#94A3B8]" strokeWidth={1.5} />
                    <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.12em]">
                        Pago de Infracción
                    </span>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-[#0F172A] text-center">
                        ¿El ciudadano desea pagar al instante?
                    </h3>

                    <div className="flex gap-3 max-w-xs mx-auto">
                        <button
                            type="button"
                            onClick={() => setDeseaPagar(true)}
                            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all active:scale-[0.97] ${deseaPagar === true
                                    ? 'bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]'
                                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                                }`}
                        >
                            Sí
                        </button>

                        <button
                            type="button"
                            onClick={() => setDeseaPagar(false)}
                            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all active:scale-[0.97] ${deseaPagar === false
                                    ? 'bg-[#EF4444] text-white shadow-[0_4px_12px_rgba(239,68,68,0.25)]'
                                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                                }`}
                        >
                            No
                        </button>
                    </div>
                </div>
            </div>

            {/* NO PAGA */}
            {deseaPagar === false && (
                <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-6 space-y-5">
                    <div className="flex items-start gap-3 bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-lg p-4">
                        <Info size={16} className="text-[#D97706] shrink-0 mt-0.5" />
                        <p className="text-sm text-[#92400E] leading-relaxed">
                            La infracción quedó registrada sin pago inmediato. El ciudadano podrá liquidar posteriormente en ventanilla o portales autorizados.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onFinalizarSinPago}
                        className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-sm py-3 px-4 rounded-lg transition-all active:scale-[0.98]"
                    >
                        Finalizar y Salir
                    </button>
                </div>
            )}

            {/* QR PAGO */}
            {deseaPagar === true && (
                <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#2563EB] to-[#60A5FA]" />

                    <div className="p-8 text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#F59E0B]/30 text-sm font-bold">
                            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                            <ScanLine size={14} strokeWidth={2} />
                            Esperando Pago
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-[16px] font-bold text-[#0F172A]">
                                Escanear Código QR
                            </h3>
                            <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
                                Solicite al ciudadano escanear el código para acceder al portal de pago digital.
                            </p>
                        </div>

                        <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-8 space-y-6 max-w-xs mx-auto">
                            <div className="flex justify-center">
                                <QRCodeCanvas
                                    value={urlVistaCiudadano}
                                    size={200}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                />
                            </div>

                            <span className="text-[10px] font-mono bg-[#F8FAFC] px-2 py-1 rounded border border-[#E2E8F0] text-[#64748B] break-all block">
                                {infraccionCreada.folio}
                            </span>
                        </div>

                        <div className="text-left bg-[#EFF6FF] rounded-lg p-4 border border-[#BFDBFE] flex gap-3">
                            <Info size={16} className="text-[#2563EB] shrink-0 mt-0.5" />
                            <p className="text-xs text-[#64748B] leading-relaxed">
                                La garantía seleccionada{' '}
                                <strong className="text-[#0F172A]">
                                    ({datos.garantiaSeleccionada || 'Mencionada'})
                                </strong>{' '}
                                quedará resguardada en la delegación hasta que el motor de pagos impacte la boleta.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => window.open(urlVistaCiudadano, '_blank')}
                                className="w-full flex items-center justify-center gap-2 bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#64748B] font-bold text-sm py-3 px-4 rounded-lg border border-[#E2E8F0] transition-all active:scale-[0.98]"
                            >
                                <ExternalLink size={16} strokeWidth={1.5} />
                                Abrir vista ciudadana
                            </button>

                            <button
                                type="button"
                                onClick={verificarPago}
                                disabled={loading}
                                className="w-full h-12 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Verificando transacción...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        Verificar pago en el sistema
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PasoPago;
