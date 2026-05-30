import { Loader2, Sparkles } from 'lucide-react';

interface LoaderOverlayProps {
    show: boolean;
    text?: string;
}

export default function LoaderOverlay({ show, text }: LoaderOverlayProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            <div className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-md" />

            <div className="relative z-10 flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-300">
                {/* Animated icon */}
                <div className="relative flex items-center justify-center w-20 h-20">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#2563EB]/20 to-[#60A5FA]/20 animate-pulse" />
                    <div className="absolute inset-0 rounded-2xl border border-[#2563EB]/30" />
                    <div className="relative flex items-center justify-center">
                        <Loader2 size={36} className="text-[#60A5FA] animate-spin" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Sparkles decoration */}
                <div className="absolute -top-2 -right-2">
                    <Sparkles size={16} className="text-[#60A5FA] animate-pulse" strokeWidth={1.5} />
                </div>

                {/* Progress dots */}
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>

                {/* Text */}
                {text && (
                    <p className="text-white/80 text-sm font-medium tracking-wide text-center max-w-[260px] leading-relaxed">
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
}
