// components/ui/LoaderOverlay.tsx
interface LoaderOverlayProps {
    show: boolean;
    text?: string;
}

export default function LoaderOverlay({ show, text }: LoaderOverlayProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            {/* Fondo */}
            <div className="absolute inset-0 bg-[#0b3b60]/50 backdrop-blur-md animate-fadeIn" />

            {/* Contenido */}
            <div className="relative z-10 flex flex-col items-center gap-5 animate-scaleIn">
                {/* Anillos de pulso concéntricos */}
                <div className="relative flex items-center justify-center w-28 h-28">
                    {/* Anillo exterior — sale más lento y con delay */}
                    <span className="absolute inset-0 rounded-full border border-white/30 animate-pulse-ring-delay" />

                    {/* Anillo interior — sale primero */}
                    <span className="absolute inset-0 rounded-full border border-white/50 animate-pulse-ring" />

                    {/* Imagen — pulso suave de escala */}
                    <img
                        src="/ui/loader.webp"
                        alt="Cargando"
                        className="w-20 h-20 object-contain animate-pulse-soft"
                    />
                </div>

                {/* Texto */}
                {text && (
                    <span className="text-white text-sm font-semibold tracking-wide animate-fadeIn [animation-delay:150ms]">
                        {text}
                    </span>
                )}
            </div>
        </div>
    );
}
