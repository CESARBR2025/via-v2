"use client";

import { useState, useEffect, useRef } from "react";
import { useSpeechRecognition } from "@/lib/embeddings/hooks/useSpeechRecognition";
import {
    Mic,
    Square,
    Search,
    Volume2,
    FileText,
    Scale,
    Hash,
    TrendingUp,
    Sparkles,
    AlertCircle,
} from "lucide-react";

type Resultado = {
    id: number;
    articulo_numero: string;
    articulo_descripcion: string;
    fraccion_numero: string;
    fraccion_descripcion: string;
    clasificacion: string;
    monto_umas: number;
    similitud: number;
};

export default function LegalPage() {
    const { transcript, isListening, start, stop } = useSpeechRecognition();
    const [loading, setLoading] = useState(false);
    const [resultados, setResultados] = useState<Resultado[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const lastSearchedRef = useRef<string>("");

    useEffect(() => {
        if (!isListening) return;
        if (!transcript.trim()) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            if (transcript !== lastSearchedRef.current) {
                lastSearchedRef.current = transcript;
                buscar(transcript);
            }
        }, 800);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [transcript, isListening]);

    useEffect(() => {
        if (isListening) return;
        if (!transcript.trim()) return;
        if (transcript === lastSearchedRef.current) return;

        lastSearchedRef.current = transcript;
        buscar(transcript);
    }, [isListening]);

    const buscar = async (texto?: string) => {
        const query = texto ?? transcript;
        if (!query.trim()) return;

        try {
            setLoading(true);
            setHasSearched(true);

            const response = await fetch("/api/legal/buscar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texto: query }),
            });

            const data = await response.json();

            if (data.ok) {
                setResultados(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartListening = () => {
        setResultados([]);
        setHasSearched(false);
        lastSearchedRef.current = "";
        start();
    };

    const handleStopListening = () => {
        stop();
    };

    return (
        <div className="min-h-dvh overflow-x-hidden bg-[#F1F5F9]">
            <div className="relative bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] overflow-hidden">
                <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-10 bg-white/30" />
                <div className="absolute top-12 -right-6 w-32 h-32 rounded-full opacity-[0.08] bg-white/40" />
                <div className="absolute -bottom-10 left-1/4 w-40 h-40 rounded-full opacity-10 bg-white/20" />

                <div className="relative max-w-5xl mx-auto px-6 sm:px-8 py-8 sm:py-10">
                    <div className="flex items-center gap-4">
                        <div
                            className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}
                        >
                            <Sparkles size={26} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                Búsqueda Inteligente
                            </h1>
                            <p className="text-[13px] text-white/70 mt-1">
                                Búsqueda por voz con IA · Reglamento de Tránsito
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 sm:px-8 -mt-6 relative z-10 pb-8 space-y-5">
                <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative shrink-0">
                            <button
                                onClick={isListening ? handleStopListening : handleStartListening}
                                className={`
                                    relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
                                    ${isListening
                                        ? 'bg-[#DC2626] hover:bg-[#991B1B] shadow-lg shadow-[#DC2626]/30'
                                        : 'bg-[#2563EB] hover:bg-[#1D4ED8] shadow-lg shadow-[#2563EB]/25'
                                    }
                                `}
                                aria-label={isListening ? "Detener grabación" : "Iniciar grabación"}
                            >
                                {isListening ? (
                                    <Square size={24} className="text-white fill-white" />
                                ) : (
                                    <Mic size={28} className="text-white" />
                                )}

                                {isListening && (
                                    <>
                                        <span className="absolute inset-0 rounded-full animate-ping bg-[#DC2626]/40" style={{ animationDuration: '1.5s' }} />
                                        <span className="absolute inset-[-4px] rounded-full animate-ping bg-[#DC2626]/20" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                                    </>
                                )}
                            </button>

                            {isListening && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#22C55E] border-[3px] border-white shadow-md flex items-center justify-center">
                                    <Volume2 size={10} className="text-white" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-3 flex-wrap">
                                <span className={`
                                    inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold
                                    ${isListening
                                        ? 'bg-[#DCFCE7] text-[#16A34A]'
                                        : 'bg-[#F1F5F9] text-[#64748B]'
                                    }
                                `}>
                                    <span className={`
                                        w-2 h-2 rounded-full
                                        ${isListening ? 'bg-[#22C55E] animate-pulse' : 'bg-[#94A3B8]'}
                                    `} />
                                    {isListening ? 'Grabando' : 'Detenido'}
                                </span>

                                {loading && (
                                    <span className="inline-flex items-center gap-1.5 text-[12px] text-[#2563EB] font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '0s' }} />
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '0.15s' }} />
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '0.3s' }} />
                                        Buscando...
                                    </span>
                                )}

                                {resultados.length > 0 && (
                                    <span className="text-[12px] text-[#64748B]">
                                        {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {transcript ? (
                                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="shrink-0 w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] mt-0.5">
                                            <FileText size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#64748B] mb-1">
                                                Texto detectado
                                            </p>
                                            <p className="text-[15px] font-medium text-[#0F172A] leading-relaxed">
                                                {transcript}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-5 text-center">
                                    <p className="text-[14px] text-[#94A3B8]">
                                        {isListening
                                            ? 'Esperando entrada de voz...'
                                            : 'Presiona el micrófono para comenzar'}
                                    </p>
                                </div>
                            )}

                            {transcript && !loading && (
                                <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
                                    <button
                                        onClick={() => buscar()}
                                        disabled={!transcript.trim()}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563EB] text-white text-[13px] font-semibold hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Search size={15} />
                                        Buscar ahora
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {hasSearched && (
                    <>
                        {loading ? (
                            <div className="rounded-xl bg-white border border-[#E2E8F0] p-12 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative w-12 h-12">
                                        <div className="absolute inset-0 rounded-full border-4 border-[#DBEAFE]" />
                                        <div className="absolute inset-0 rounded-full border-4 border-t-[#3B82F6] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[15px] font-semibold text-[#0F172A]">Analizando consulta</p>
                                        <p className="text-[13px] text-[#64748B] mt-1">Buscando coincidencias en el reglamento...</p>
                                    </div>
                                </div>
                            </div>
                        ) : resultados.length > 0 ? (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-base font-semibold text-[#0F172A]">
                                        Resultados encontrados
                                    </h2>
                                    <span className="text-[12px] text-[#64748B]">
                                        Ordenados por similitud semántica
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {resultados.map((item, index) => (
                                        <ResultCard
                                            key={item.id}
                                            item={item}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl bg-white border border-[#E2E8F0] p-12 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div className="w-14 h-14 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
                                        <AlertCircle size={26} className="text-[#D97706]" />
                                    </div>
                                    <div>
                                        <p className="text-[15px] font-semibold text-[#0F172A]">Sin resultados</p>
                                        <p className="text-[13px] text-[#64748B] mt-1">
                                            No se encontraron coincidencias. Intenta con una descripción diferente.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {!hasSearched && !isListening && (
                    <div className="rounded-xl bg-white border border-[#E2E8F0] p-14 sm:p-16 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                        <div className="flex flex-col items-center gap-5 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] flex items-center justify-center text-[#2563EB] shadow-inner">
                                <Mic size={30} />
                            </div>
                            <div className="max-w-sm">
                                <p className="text-[17px] font-bold text-[#0F172A]">
                                    ¿Qué infracción buscas?
                                </p>
                                <p className="text-[13px] text-[#64748B] mt-2 leading-relaxed">
                                    Presiona el micrófono y describe la falta de tránsito con tus propias palabras. El sistema buscará automáticamente en el reglamento.
                                </p>
                            </div>
                            <button
                                onClick={handleStartListening}
                                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#2563EB] text-white text-[14px] font-semibold hover:bg-[#1D4ED8] transition-all shadow-lg shadow-[#2563EB]/25"
                            >
                                <Mic size={18} />
                                Iniciar búsqueda por voz
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ResultCard({
    item,
    index,
}: {
    item: Resultado;
    index: number;
}) {
    const similitud = item.similitud;

    const similarityColor =
        similitud >= 85
            ? 'text-[#16A34A] bg-[#DCFCE7]'
            : similitud >= 70
                ? 'text-[#D97706] bg-[#FEF3C7]'
                : 'text-[#DC2626] bg-[#FEE2E2]';

    const clasif = (item.clasificacion ?? '').toLowerCase();
    const classificationColor =
        clasif === 'grave'
            ? 'text-[#DC2626] bg-[#FEE2E2]'
            : clasif === 'menos grave'
                ? 'text-[#D97706] bg-[#FEF3C7]'
                : clasif === 'no grave'
                    ? 'text-[#16A34A] bg-[#DCFCE7]'
                    : 'text-[#64748B] bg-[#F1F5F9]';

    return (
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.07),0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#BFDBFE] transition-all duration-200">
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] font-bold text-[14px]">
                        {index + 1}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-[15px] font-bold text-[#0F172A]">
                            Artículo {item.articulo_numero}
                            <span className="text-[#64748B] font-medium"> · Fracción {item.fraccion_numero}</span>
                        </h3>
                        <p className="text-[11px] text-[#64748B] mt-0.5 truncate max-w-md">
                            {item.articulo_descripcion}
                        </p>
                    </div>
                </div>

                <div className={`
                    shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold
                    ${similarityColor}
                `}>
                    <TrendingUp size={13} />
                    {similitud}%
                </div>
            </div>

            <p className="text-[14px] text-[#334155] leading-relaxed mb-4 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {item.fraccion_descripcion}
            </p>

            <div className="flex items-center gap-3 flex-wrap">
                <span className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold
                    ${classificationColor}
                `}>
                    <Scale size={12} />
                    {item.clasificacion}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F1F5F9] text-[#475569]">
                    <Hash size={12} />
                    {item.monto_umas} UMA
                </span>
            </div>
        </div>
    );
}
