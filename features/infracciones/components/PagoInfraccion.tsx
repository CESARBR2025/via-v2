'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
    CheckCircle2,
    CreditCard,
    ExternalLink,
    Loader2,
    X,
} from 'lucide-react';

type Props = {
    infraccionId: string;
    ordenPagoId: string;
    urlPago: string;
    estatus: string;
    estatusDependencia: string;
    estatusInfraccion: string

};

export default function PagoInfraccion({
    infraccionId,
    ordenPagoId,
    urlPago,
    estatus,
    estatusDependencia,
    estatusInfraccion
}: Props) {
    console.log(urlPago)
    console.log(ordenPagoId)
    let urlPagoFinal = `https://municipio.azurewebsites.net/PagoOP.aspx?id=${ordenPagoId}`
    const router = useRouter();

    const [open, setOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const [pagado, setPagado] = useState(
        estatus === 'P'
    );

    const [mostrandoExito, setMostrandoExito] =
        useState(false);

    const popupRef = useRef<Window | null>(null)
    const [popupAbierta, setPopupAbierta] = useState(false)
    const [abriendoPopup, setAbriendoPopup] = useState(false)

    useEffect(() => {
        if (!popupAbierta) return
        const interval = setInterval(() => {
            if (popupRef.current?.closed) {
                setPopupAbierta(false)
                popupRef.current = null
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [popupAbierta])

    const abrirPopup = () => {
        setAbriendoPopup(true)
        setTimeout(() => {
            const ancho = 800
            const alto = 750
            const left = (screen.width - ancho) / 2
            const top = (screen.height - alto) / 2
            popupRef.current = window.open(
                urlPagoFinal,
                'PagoInfraccion',
                `width=${ancho},height=${alto},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
            )
            setPopupAbierta(true)
            setAbriendoPopup(false)
        }, 300)
    }

    // =====================================================
    // VERIFICAR PAGO
    // =====================================================

    const verificarPago = async () => {

        // Estados actuales

        // EVITAR REQUESTS DUPLICADOS

        if (loading) return;

        try {

            setLoading(true);

            let url = ''

            // Caso 1: Ciudadano ausente
            if (estatusInfraccion === 'PENDIENTE_PAGO' && estatusDependencia === 'PENDIENTE_PAGO_INFRACCION') {
                url = `/api/pagosInfracciones/confirmarPagoAusente/${ordenPagoId}/${infraccionId}`

            } else if (estatusInfraccion === 'PENDIENTE_PAGO' && estatusDependencia === 'PENDIENTE_PAGO_INSTANTE') {
                // Caso 2: ciudaadno paga infraccion al instante y no se retiene la garantia
                url = `/api/pagosInfracciones/confirmarPagoInstante/${ordenPagoId}/${infraccionId}`
            } else if (estatusInfraccion === 'PENDIENTE_PAGO' && estatusDependencia === 'PLACA_RETENIDA_EN_TRANSITO') {
                // Caso 3: garantia retenida y pago despues
                url = `/api/pagosInfracciones/confirmarPagoRetenida/${ordenPagoId}/${infraccionId}`
            } else if (estatusInfraccion === 'PENDIENTE_PAGO' && estatusDependencia === 'PENDIENTE_PAGO_LIBERACION') {
                // Caso 4: Pago de infraccion liberacion
                url = `/api/pagosInfracciones/confirmarPagoLiberacion/${ordenPagoId}/${infraccionId}`
            }

            const res = await fetch(url,
                {
                    method: 'GET',
                    cache: 'no-store',
                }
            );

            const data = await res.json();

            // =============================================
            // PAGADO
            // =============================================

            if (data.pagado) {

                setPagado(true);

                // OCULTAR IFRAME
                // MOSTRAR MENSAJE ÉXITO

                setMostrandoExito(true);

                // ESPERAR 3 SEGUNDOS

                setTimeout(() => {

                    // CERRAR MODAL

                    setOpen(false);

                    // LIMPIAR ESTADO

                    setMostrandoExito(false);

                    // REFRESH SERVER COMPONENT

                    router.refresh();

                }, 3000);

                return;
            }

        } catch (error) {

            console.error(
                'ERROR VERIFICANDO PAGO:',
                error
            );

        } finally {

            setLoading(false);

        }
    };

    // =====================================================
    // POLLING AUTOMÁTICO
    // =====================================================

    useEffect(() => {

        // SI MODAL CERRADO O YA PAGADO:
        // NO HACER POLLING

        if (!open || pagado) return;

        const interval = setInterval(() => {

            verificarPago();

        }, 5000);

        // LIMPIAR INTERVALO

        return () => {

            clearInterval(interval);

        };

    }, [open, pagado]);

    // =====================================================
    // CERRAR MODAL
    // =====================================================

    const handleClose = async () => {

        setOpen(false);

        // VERIFICAR UNA ÚLTIMA VEZ

        await verificarPago();

    };

    // =====================================================
    // PAGADA
    // =====================================================

    if (pagado && !open) {

        return (
            <div className="p-8 text-center space-y-5">

                <div className="
                    w-20 h-20 rounded-full
                    bg-emerald-500/10
                    border border-emerald-500/20
                    text-emerald-600
                    flex items-center justify-center
                    mx-auto
                ">
                    <CheckCircle2 size={40} strokeWidth={1.5} />
                </div>

                <div className="space-y-2">

                    <h3 className="text-xl font-medium text-slate-800">
                        Tu infracción fue pagada
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed">
                        El pago fue validado correctamente.
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // PENDIENTE
    // =====================================================

    return (

        <div className="p-5 space-y-5">

            {/* BOTÓN ABRIR MODAL */}

            <button
                onClick={() => setOpen(true)}
                className="
                    w-full h-14 rounded-lg
                    bg-blue-700
                    hover:bg-blue-800
                    active:bg-blue-900
                    text-white font-medium
                    transition
                    flex items-center justify-center gap-2
                    active:scale-[0.99]
                "
            >
                <CreditCard size={18} strokeWidth={1.5} />

                Pagar infracción

            </button>

            {/* INFO */}

            <div className="
                rounded-lg bg-blue-50
                border border-blue-100
                p-4
            ">
                <p className="text-xs text-blue-700 leading-relaxed">

                    El pago será procesado mediante
                    una plataforma segura externa.

                </p>
            </div>

            {/* MODAL */}

            {open && (

                <div className="
                    fixed inset-0 z-50
                    bg-black/70
                    flex items-center justify-center
                    p-4
                ">

                    <div className="
                        bg-white rounded-xl
                        w-full max-w-4xl xl:max-w-6xl
                        h-[90vh] md:h-[85vh]
                        overflow-hidden
                        shadow-modal
                        flex flex-col
                    ">

                        {/* HEADER */}

                        <div className="
                            h-16 border-b border-slate-200
                            px-5 flex items-center justify-between
                        ">

                            <div>

                                <h3 className="font-medium text-slate-800">
                                    Pago Digital
                                </h3>

                                <p className="text-xs text-slate-500">
                                    Plataforma segura
                                </p>

                            </div>

                            {!mostrandoExito && (
                                <button
                                    onClick={handleClose}
                                    className="
                                        w-10 h-10 rounded-lg
                                        hover:bg-slate-100
                                        flex items-center justify-center
                                    "
                                >
                                    <X size={18} strokeWidth={1.5} />
                                </button>
                            )}

                        </div>

                        {/* CONTENIDO */}

                        {mostrandoExito ? (

                            <div className="
                                flex-1
                                flex flex-col
                                items-center
                                justify-center
                                text-center
                                px-6
                                bg-gradient-to-b
                                from-emerald-50
                                to-white
                            ">

                                <div className="
                                    w-28 h-28 rounded-full
                                    bg-emerald-500/10
                                    border border-emerald-500/20
                                    flex items-center justify-center
                                    text-emerald-600
                                    mb-8
                                ">

                                    <CheckCircle2 size={56} strokeWidth={1.5} />

                                </div>

                                <h2 className="
                                    text-4xl font-medium
                                    text-slate-800
                                    leading-tight
                                ">

                                    GRACIAS POR TU PAGO

                                </h2>

                                <p className="
                                    mt-4 text-lg
                                    font-medium
                                    text-emerald-700
                                ">

                                    TODOS SOMOS SAN JUAN

                                </p>

                                <p className="
                                    mt-6 text-sm
                                    text-slate-500
                                    max-w-md
                                    leading-relaxed
                                ">

                                    El pago de tu infracción fue
                                    validado correctamente en el
                                    sistema digital.

                                </p>

                            </div>

                        ) : (

                            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                                {/* INSTRUCTIONS PANEL */}

                                <div className="
                                    lg:w-72 lg:border-r border-slate-200
                                    bg-slate-50
                                    p-5
                                    space-y-5
                                    overflow-y-auto
                                    shrink-0
                                    max-h-64 lg:max-h-none
                                ">
                                    <div>
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Indicaciones
                                        </h4>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            Sigue estos pasos para completar tu pago
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <span className="w-7 h-7 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">Calcula el pago</p>
                                                <p className="text-xs text-slate-500 leading-relaxed">Da clic en el bot&oacute;n <span className="font-medium text-slate-700">Calcular pago</span> dentro del formulario.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <span className="w-7 h-7 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">Selecciona Visa</p>
                                                <p className="text-xs text-slate-500 leading-relaxed">Elige la opci&oacute;n <span className="font-medium text-slate-700">Tarjeta Visa</span> como m&eacute;todo de pago.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <span className="w-7 h-7 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">Ingresa tus datos</p>
                                                <p className="text-xs text-slate-500 leading-relaxed">Proporciona los datos de tu tarjeta: n&uacute;mero, fecha de vencimiento y CVV.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">&iexcl;Listo!</p>
                                                <p className="text-xs text-slate-500 leading-relaxed">Una vez procesado, presiona <span className="font-medium text-slate-700">Verificar pago</span> para confirmar.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                                        <p className="text-[11px] text-blue-700 leading-relaxed">
                                            Tus datos est&aacute;n protegidos. La transacci&oacute;n se realiza en un entorno seguro.
                                        </p>
                                    </div>
                                </div>

                                {/* POPUP + FOOTER */}

                                <div className="flex-1 flex flex-col min-w-0">
                                    <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 gap-6">

                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
                                            <CreditCard size={28} strokeWidth={1.5} />
                                        </div>

                                        <div className="text-center space-y-2 max-w-sm">
                                            <h4 className="text-base font-semibold text-slate-800">
                                                Abrir plataforma de pago
                                            </h4>
                                            <p className="text-sm text-slate-500 leading-relaxed">
                                                Ser&aacute;s redirigido a una ventana segura para realizar el pago con tu tarjeta.
                                            </p>
                                        </div>

                                        <button
                                            onClick={abrirPopup}
                                            disabled={abriendoPopup || popupAbierta}
                                            className="
                                                h-14 px-10 rounded-lg
                                                bg-blue-700
                                                hover:bg-blue-800
                                                active:bg-blue-900
                                                active:scale-[0.99]
                                                text-white font-medium
                                                flex items-center gap-2.5
                                                transition-all
                                                shadow-lg shadow-blue-700/20
                                                disabled:opacity-60 disabled:cursor-not-allowed
                                            "
                                        >
                                            {abriendoPopup ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Abriendo...
                                                </>
                                            ) : popupAbierta ? (
                                                <>
                                                    <ExternalLink size={18} strokeWidth={1.5} />
                                                    Ventana abierta
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard size={18} strokeWidth={1.5} />
                                                    Ir a pagar
                                                </>
                                            )}
                                        </button>

                                        {popupAbierta ? (
                                            <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-2.5">
                                                <span className="w-2 h-2 rounded-full bg-blue-700 animate-pulse" />
                                                <p className="text-xs text-blue-700 font-medium">Esperando que completes el pago en la ventana abierta...</p>
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-slate-400 text-center max-w-xs">
                                                Despu&eacute;s de realizar el pago, cierra la ventana y presiona el bot&oacute;n de abajo para verificar.
                                            </p>
                                        )}
                                    </div>

                                    <div className="
                                        border-t border-slate-200
                                        p-4 flex items-center justify-between gap-4
                                    ">
                                        <p className="text-xs text-slate-400 hidden sm:block">
                                            El pago se verifica autom&aacute;ticamente cada 5 segundos
                                        </p>

                                        <button
                                            onClick={verificarPago}
                                            disabled={loading}
                                            className="
                                                h-12 px-6 rounded-lg
                                                bg-emerald-600
                                                hover:bg-emerald-700
                                                disabled:opacity-50
                                                text-white font-medium
                                                flex items-center gap-2
                                                active:scale-[0.99]
                                                ml-auto
                                            "
                                        >

                                            {loading ? (
                                                <>
                                                    <Loader2
                                                        size={18}
                                                        className="animate-spin"
                                                    />

                                                    Verificando...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={18} strokeWidth={1.5} />

                                                    Verificar pago
                                                </>
                                            )}

                                        </button>

                                    </div>
                                </div>
                            </div>

                        )}

                    </div>

                </div>

            )}

        </div>
    );
}
