import React from 'react';
import {
    CheckCircle,
    Clock,
    Loader2,
    CreditCard,
    QrCode,
    Ban,
    ArrowLeft,
    ShieldCheck,
    Smartphone,
    Wallet,
    Scan,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { SegmentedControl } from '../ui/SegmentedControl';

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
        descuentoAplicado?: number;
        [key: string]: any;
    };
    verificarPago: () => Promise<void> | void;
    onFinalizarSinPago?: () => Promise<void> | void;
    loading: boolean;
    ordenPago?: { totalPesos: string; totalUmas: string } | null;
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
    ordenPago,
}) => {
    if (!infraccionCreada) return null;

    const baseUrl =
        process.env.NODE_ENV === 'production'
            ? 'https://via-v2.vercel.app'
            : 'http://localhost:3000';

    const urlVistaCiudadano = `${baseUrl}/infracciones/${infraccionCreada.id}`;

    if (pagado) {
        return (
            <div className="pb-8 animate-fadeIn">
                <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-[0_4px_12px_rgba(0,0,0,0.07),0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-[#22C55E] to-[#16A34A]" />

                    <div className="px-6 py-10 sm:px-8 text-center space-y-6">
                        <div className="relative mx-auto w-20 h-20">
                            <div className="absolute inset-0 rounded-xl bg-[#DCFCE7] animate-ping opacity-30" />
                            <div className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-[#DCFCE7] to-[#BBF7D0] flex items-center justify-center shadow-[0_0_0_6px_rgba(34,197,94,0.12)]">
                                <CheckCircle size={40} className="text-[#22C55E]" strokeWidth={1.5} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#22C55E]/30 text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                                Pago Confirmado
                            </span>

                            <h2 className="text-[22px] font-bold text-[#0F172A] leading-tight tracking-tight">
                                Infracción Liquidada
                            </h2>

                            <p className="text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
                                El pago fue validado correctamente. El ciudadano puede continuar su camino.
                            </p>
                        </div>

                        <div className="max-w-xs mx-auto">
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-semibold text-sm rounded-lg shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={16} strokeWidth={1.5} />
                                Nueva infracción
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-8 animate-fadeIn">
            {/* DECISION CARD */}
            <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-6">
                <div className="space-y-4">
                    <p className="text-sm text-[#64748B] text-center leading-relaxed max-w-md mx-auto">
                        ¿El ciudadano desea realizar el pago de la infracción al instante?
                    </p>

                    <div className="max-w-xs mx-auto">
                        <SegmentedControl
                            options={[
                                { value: 'true', label: 'Pagar ahora', icon: CreditCard },
                                { value: 'false', label: 'Pagar después', icon: Ban },
                            ]}
                            value={deseaPagar === null ? null : String(deseaPagar)}
                            onChange={(val) => setDeseaPagar(val === 'true')}
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>

            {/* CONTENT CARDS */}
            <div className="relative">
                {deseaPagar === false && (
                    <div className="animate-fadeIn space-y-4">
                        <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                            <div className="flex items-start gap-4 p-5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(245,158,11,0.15)]">
                                    <Clock size={18} className="text-[#D97706]" strokeWidth={1.5} />
                                </div>
                                <div className="min-w-0 flex-1 pt-0.5">
                                    <p className="text-sm font-semibold text-[#0F172A]">
                                        Pago diferido
                                    </p>
                                    <p className="text-xs text-[#64748B] leading-relaxed mt-1">
                                        La infracción quedó registrada. El ciudadano podrá liquidar el monto en ventanilla de la delegación o en los portales autorizados dentro del plazo establecido.
                                    </p>
                                </div>
                            </div>
                            <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                                <span className="text-[11px] text-[#64748B] font-medium">
                                    Se aplicará descuento por pago anticipado dentro de los primeros 10 días
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onFinalizarSinPago}
                            className="w-full h-11 bg-[#0F172A] hover:bg-[#1E293B] active:bg-[#334155] text-white font-semibold text-sm rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={16} strokeWidth={1.5} />
                            Finalizar y Salir
                        </button>
                    </div>
                )}

                {deseaPagar === true && (
                    <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-5 gap-5">
                        {/* LEFT: INFO */}
                        <div className="lg:col-span-3 space-y-5">
                            <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-6 h-full flex flex-col">
                                    <div className="space-y-5 flex-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center">
                                                    <Scan size={16} className="text-[#D97706]" strokeWidth={1.5} />
                                                </div>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] text-[11px] font-semibold border border-[#F59E0B]/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                                                    Esperando Pago
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] rounded-xl p-5 space-y-4 border border-[#E2E8F0]">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
                                                        <Wallet size={16} className="text-[#2563EB]" strokeWidth={1.5} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.06em]">
                                                            Monto
                                                        </p>
                                                        <p className="text-[17px] font-bold text-[#0F172A] tracking-tight mt-0.5">
                                                            ${Number(ordenPago?.totalPesos || datos.fraccionMonto || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                                                        </p>
                                                    </div>
                                                </div>
                                                {datos.descuentoAplicado ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#DCFCE7] text-[#16A34A] text-[11px] font-semibold">
                                                        -{datos.descuentoAplicado}%
                                                    </span>
                                                ) : null}
                                            </div>

                                            <div className="w-full h-px bg-[#E2E8F0]" />

                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-[#FEF3C7]/80 flex items-center justify-center">
                                                    <ShieldCheck size={16} className="text-[#D97706]" strokeWidth={1.5} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.06em]">
                                                        Garantía
                                                    </p>
                                                    <p className="text-sm font-semibold text-[#0F172A] mt-0.5">
                                                        {datos.garantiaSeleccionada || 'Mencionada'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2.5 bg-[#FFF7ED] rounded-lg p-3 border border-[#FED7AA]">
                                            <ShieldCheck size={14} className="text-[#EA580C] shrink-0 mt-0.5" strokeWidth={1.5} />
                                            <p className="text-[11px] text-[#9A3412] leading-relaxed">
                                                Quedará resguardada en la delegación hasta que el motor de pagos impacte la boleta.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mt-5">
                                        <button
                                            type="button"
                                            onClick={verificarPago}
                                            disabled={loading}
                                            className="w-full h-11 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all active:scale-[0.98]"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Verificando transacción...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle size={18} />
                                                    Verificar pago
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => window.open(urlVistaCiudadano, '_blank')}
                                            className="w-full h-11 rounded-lg bg-transparent hover:bg-[#F8FAFC] active:bg-[#F1F5F9] text-[#64748B] font-medium text-sm flex items-center justify-center gap-2 border border-[#E2E8F0] transition-all active:scale-[0.98]"
                                        >
                                            <Smartphone size={16} strokeWidth={1.5} />
                                            Vista ciudadano
                                        </button>
                                </div>
                            </div>

                        </div>

                        {/* RIGHT: QR */}
                        <div className="lg:col-span-2">
                            <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-6 h-full flex flex-col items-center justify-center text-center space-y-5">
                                <div className="bg-white rounded-lg border border-[#E2E8F0] p-4">
                                    <QRCodeCanvas
                                        value={urlVistaCiudadano}
                                        size={160}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em]">
                                        Folio
                                    </p>
                                    <span className="text-xs font-mono font-bold text-[#0F172A] tracking-wide">
                                        {infraccionCreada.folio}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PasoPago;
