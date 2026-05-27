import React from 'react';
import { CheckCircle, Info, Loader2 } from 'lucide-react';
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
    loading: boolean;
}

export const PasoPago: React.FC<PasoPagoProps> = ({
    infraccionCreada,
    pagado,
    deseaPagar,
    setDeseaPagar,
    datos,
    verificarPago,
    loading,
}) => {
    if (!infraccionCreada) return null;

    const baseUrl =
        process.env.NODE_ENV === 'production'
            ? 'https://via-v2.vercel.app'
            : 'http://localhost:3000';

    const urlVistaCiudadano = `${baseUrl}/infracciones/${infraccionCreada.id}`;

    // ==========================================
    // ESCENARIO 1: PAGO VALIDADO / CONFIRMADO
    // ==========================================
    if (pagado) {
        return (
            <div className="max-w-xl mx-auto pb-8 animate-fadeIn">
                <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl overflow-hidden">
                    <div className="p-10 text-center space-y-8">
                        {/* ICONO DE EXITO */}
                        <div className="w-28 h-28 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                            <CheckCircle size={60} className="text-emerald-600" />
                        </div>

                        {/* TEXTO INFORMATIVO */}
                        <div className="space-y-3">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-sm font-bold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Pago Confirmado
                            </span>

                            <h2 className="text-3xl font-black text-emerald-700 leading-tight">
                                EL CIUDADANO PUEDE CONTINUAR SU CAMINO
                            </h2>

                            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                                El pago fue validado correctamente y la infracción quedó liquidada en el sistema.
                            </p>
                        </div>

                        {/* ACCION DE SALIDA */}
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-4 px-4 rounded-2xl transition-all active:scale-[0.98]"
                        >
                            Salir
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // ESCENARIO 2: FLUJO DE COBRO / SELECCION
    // ==========================================
    return (
        <div className="space-y-6 max-w-xl mx-auto pb-8 animate-fadeIn">
            {/* PANEL DE DECISIÓN */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                <div className="text-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                        Pago de Infracción
                    </span>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-700">
                        ¿Ciudadano desea pagar al instante?
                    </h3>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setDeseaPagar(true)}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${deseaPagar === true
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            Sí
                        </button>

                        <button
                            type="button"
                            onClick={() => setDeseaPagar(false)}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${deseaPagar === false
                                ? 'bg-red-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            No
                        </button>
                    </div>
                </div>
            </div>

            {/* SUB-ESCENARIO: CIUDADANO RECHAZA PAGO INMEDIATO */}
            {deseaPagar === false && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5 animate-fadeIn">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-sm text-amber-700 leading-relaxed">
                            La infracción quedó registrada sin pago inmediato. El ciudadano podrá liquidar posteriormente en ventanilla o portales autorizados.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="w-full bg-slate-800 hover:bg-slate-950 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all active:scale-[0.98]"
                    >
                        Finalizar y Salir
                    </button>
                </div>
            )}

            {/* SUB-ESCENARIO: CIUDADANO SELECCIONA PAGO INMEDIATO (CÓDIGO QR) */}
            {deseaPagar === true && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn">
                    <div className="p-8 text-center space-y-6">
                        {/* INDICADOR DE ESPERA */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 text-sm font-bold">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            Esperando Pago del Ciudadano
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-[#0b3b60]">
                                Escanear Código QR
                            </h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                                Solicite al ciudadano escanear el código para acceder al portal de pago digital.
                            </p>
                        </div>

                        {/* CONTENEDOR DE QR */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6 max-w-xs mx-auto">
                            <div className="flex justify-center">
                                <QRCodeCanvas
                                    value={urlVistaCiudadano}
                                    size={200}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                />
                            </div>

                            <span className="text-[10px] font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-500 break-all block">
                                {infraccionCreada.folio}
                            </span>
                        </div>

                        {/* RECORDATORIO DE GARANTÍA */}
                        <div className="text-left bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 flex gap-3">
                            <Info size={16} className="text-[#0076aa] shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-600 leading-relaxed">
                                La garantía seleccionada{' '}
                                <strong className="text-[#0b3b60]">
                                    ({datos.garantiaSeleccionada || 'Mencionada'})
                                </strong>{' '}
                                quedará resguardada en la delegación hasta que el motor de pagos impacte la boleta.
                            </p>
                        </div>

                        {/* PANEL DE ACCIONES DISPONIBLES */}
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => window.open(urlVistaCiudadano, '_blank')}
                                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm py-3 px-4 rounded-xl transition-all"
                            >
                                Abrir vista ciudadana
                            </button>

                            <button
                                type="button"
                                onClick={verificarPago}
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
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