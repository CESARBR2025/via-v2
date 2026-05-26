'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
    CheckCircle2,
    CreditCard,
    Loader2,
    X,
} from 'lucide-react';

type Props = {
    infraccionId: string;
    ordenPagoId: string;
    urlPago: string;
    estatus: string;
};

export default function PagoInfraccion({
    infraccionId,
    ordenPagoId,
    urlPago,
    estatus,
}: Props) {

    const router = useRouter();

    const [open, setOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const [pagado, setPagado] = useState(
        estatus === 'PAGADA'
    );

    const [mostrandoExito, setMostrandoExito] =
        useState(false);

    // =====================================================
    // VERIFICAR PAGO
    // =====================================================

    const verificarPago = async () => {

        // EVITAR REQUESTS DUPLICADOS

        if (loading) return;

        try {

            setLoading(true);

            const res = await fetch(
                `/api/pagosInfracciones/verificar/${ordenPagoId}/${infraccionId}`,
                {
                    method: 'GET',
                    cache: 'no-store',
                }
            );

            const data = await res.json();

            console.log('VERIFICAR PAGO:', data);

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

        console.log('INICIANDO POLLING');

        const interval = setInterval(() => {

            console.log('POLLING: verificando pago');

            verificarPago();

        }, 5000);

        // LIMPIAR INTERVALO

        return () => {

            console.log('DETENIENDO POLLING');

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
                    <CheckCircle2 size={40} />
                </div>

                <div className="space-y-2">

                    <h3 className="text-xl font-black text-slate-800">
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
                    w-full h-14 rounded-2xl
                    bg-[#0b3b60]
                    hover:bg-[#0d4d7d]
                    text-white font-bold
                    transition
                    flex items-center justify-center gap-2
                "
            >
                <CreditCard size={18} />

                Pagar infracción

            </button>

            {/* INFO */}

            <div className="
                rounded-2xl bg-blue-50
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
                        bg-white rounded-3xl
                        w-full max-w-5xl
                        overflow-hidden
                        shadow-2xl
                    ">

                        {/* HEADER */}

                        <div className="
                            h-16 border-b border-slate-200
                            px-5 flex items-center justify-between
                        ">

                            <div>

                                <h3 className="font-black text-slate-800">
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
                                        w-10 h-10 rounded-xl
                                        hover:bg-slate-100
                                        flex items-center justify-center
                                    "
                                >
                                    <X size={18} />
                                </button>
                            )}

                        </div>

                        {/* CONTENIDO */}

                        {mostrandoExito ? (

                            <div className="
                                h-[700px]
                                flex flex-col
                                items-center
                                justify-center
                                text-center
                                px-10
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

                                    <CheckCircle2 size={56} />

                                </div>

                                <h2 className="
                                    text-4xl font-black
                                    text-slate-800
                                    leading-tight
                                ">

                                    GRACIAS POR TU PAGO

                                </h2>

                                <p className="
                                    mt-4 text-lg
                                    font-semibold
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

                            <>
                                {/* IFRAME */}

                                <iframe
                                    src={urlPago}
                                    className="w-full h-[700px]"
                                    allow="payment"
                                />

                                {/* FOOTER */}

                                <div className="
                                    border-t border-slate-200
                                    p-4 flex justify-end
                                ">

                                    <button
                                        onClick={verificarPago}
                                        disabled={loading}
                                        className="
                                            h-12 px-6 rounded-2xl
                                            bg-emerald-600
                                            hover:bg-emerald-700
                                            disabled:opacity-50
                                            text-white font-bold
                                            flex items-center gap-2
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
                                                <CheckCircle2 size={18} />

                                                Verificar pago
                                            </>
                                        )}

                                    </button>

                                </div>
                            </>

                        )}

                    </div>

                </div>

            )}

        </div>
    );
}