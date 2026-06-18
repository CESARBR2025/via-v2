import React from 'react';
import {
    CheckCircle,
    Clock,
    Loader2,
    CreditCard,
    Ban,
    ArrowLeft,
    ShieldCheck,
    Smartphone,
    Wallet,
    Scan,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { SegmentedControl } from '../ui/SegmentedControl';
import { Card } from '../ui/Card';
import { CardTitle } from '../ui/CardTitle';

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
                <Card className="overflow-hidden p-0 text-center">
                    <div className="h-1.5 bg-gradient-to-r from-green-500 to-green-600" />

                    <div className="px-6 py-10 sm:px-8 space-y-6">
                        <div className="relative mx-auto w-20 h-20">
                            <div className="absolute inset-0 rounded-xl bg-green-100 animate-ping opacity-30" />
                            <div className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-[0_0_0_6px_rgba(34,197,94,0.12)]">
                                <CheckCircle size={40} className="text-green-500" strokeWidth={1.5} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <span className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-500/30 text-xs font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                Pago Confirmado
                            </span>

                            <h2 className="text-[22px] font-medium text-slate-900 leading-tight tracking-tight">
                                Infracción Liquidada
                            </h2>

                            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                                El pago fue validado correctamente. El ciudadano puede continuar su camino.
                            </p>
                        </div>

                        <div className="max-w-xs mx-auto">
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="w-full h-11 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={16} strokeWidth={1.5} />
                                Nueva infracción
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-8 animate-fadeIn">
            {/* DECISION CARD */}
            <Card>
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 text-center leading-relaxed max-w-md mx-auto">
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
            </Card>

            {/* CONTENT CARDS */}
            <div className="relative">
                {deseaPagar === false && (
                    <div className="animate-fadeIn space-y-4">
                        <Card>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shrink-0 shadow-sm">
                                    <Clock size={18} className="text-amber-600" strokeWidth={1.5} />
                                </div>
                                <div className="min-w-0 flex-1 pt-0.5">
                                    <p className="text-sm font-medium text-slate-900">
                                        Pago diferido
                                    </p>
                                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                                        La infracción quedó registrada. El ciudadano podrá liquidar el monto en ventanilla de la delegación o en los portales autorizados dentro del plazo establecido.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 -mx-6 -mb-5 px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span className="text-xs text-slate-500 font-medium">
                                    Se aplicará descuento por pago anticipado dentro de los primeros 10 días
                                </span>
                            </div>
                        </Card>

                        <button
                            type="button"
                            onClick={onFinalizarSinPago}
                            className="w-full h-11 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-medium text-sm rounded-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
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
                            <Card className="h-full flex flex-col">
                                <div className="space-y-5 flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                                <Scan size={16} className="text-amber-600" strokeWidth={1.5} />
                                            </div>
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-600 text-xs font-medium border border-amber-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                Esperando Pago
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 space-y-4 border border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-blue-700/10 flex items-center justify-center">
                                                    <Wallet size={16} className="text-blue-700" strokeWidth={1.5} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                                        Monto
                                                    </p>
                                                    <p className="text-lg font-medium text-slate-900 tracking-tight mt-0.5">
                                                        ${Number(ordenPago?.totalPesos || datos.fraccionMonto || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                                                    </p>
                                                </div>
                                            </div>
                                            {datos.descuentoAplicado ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-600 text-xs font-medium">
                                                    -{datos.descuentoAplicado}%
                                                </span>
                                            ) : null}
                                        </div>

                                        <div className="w-full h-px bg-slate-200" />

                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-amber-100/80 flex items-center justify-center">
                                                <ShieldCheck size={16} className="text-amber-600" strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                                    Garantía
                                                </p>
                                                <p className="text-sm font-medium text-slate-900 mt-0.5">
                                                    {datos.garantiaSeleccionada || 'Mencionada'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5 bg-orange-50 rounded-lg p-3 border border-orange-200">
                                        <ShieldCheck size={14} className="text-orange-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                                        <p className="text-xs text-orange-800 leading-relaxed">
                                            Quedará resguardada en la delegación hasta que el motor de pagos impacte la boleta.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 mt-5">
                                    <button
                                        type="button"
                                        onClick={verificarPago}
                                        disabled={loading}
                                        className="w-full h-11 rounded-lg bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
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
                                        className="w-full h-11 rounded-lg bg-transparent hover:bg-slate-50 active:bg-slate-100 text-slate-500 font-medium text-sm flex items-center justify-center gap-2 border border-slate-200 transition-all active:scale-[0.99]"
                                    >
                                        <Smartphone size={16} strokeWidth={1.5} />
                                        Vista ciudadano
                                    </button>
                                </div>
                            </Card>
                        </div>

                        {/* RIGHT: QR */}
                        <div className="lg:col-span-2">
                            <Card className="h-full flex flex-col items-center justify-center text-center space-y-5">
                                <div className="bg-white rounded-lg border border-slate-200 p-4">
                                    <QRCodeCanvas
                                        value={urlVistaCiudadano}
                                        size={160}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.1em]">
                                        Folio
                                    </p>
                                    <span className="text-xs font-mono font-medium text-slate-900 tracking-wide">
                                        {infraccionCreada.folio}
                                    </span>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PasoPago;
