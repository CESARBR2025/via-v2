'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useState } from 'react';
import {
    Mail,
    ArrowUpRight,
    KeyRound,
    Eye,
    EyeOff,
    AlertCircle,
    Lock,
    Loader2,
    ChevronDown,
} from 'lucide-react';

export default function LoginForm() {
    const router = useRouter();

    const [curp, setCurp] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showSupport, setShowSupport] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ curp, password }),
                credentials: 'include',
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Error al iniciar sesión');
                return;
            }

            if (data.action === 'SELECT_ROLE') {
                sessionStorage.setItem('available_roles', JSON.stringify(data.roles));
                router.push('/seleccionar-rol');
            } else if (data.action === 'REDIRECT') {
                router.push(data.redirectTo);
            }
        } catch {
            setError('Error de conexión al servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen w-full relative flex items-center justify-center overflow-y-auto">
            {/* Background */}
            <Image
                src="/roles/via-wallpaper.png"
                alt=""
                fill
                className="object-cover blur-[3px]"
                priority
                sizes="100vw"
            />

            {/* Gradient overlay — matches sidebar slate-900 */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-800/50 to-slate-700/10" />

            {/* Decorative lights */}
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-slate-900/30 blur-3xl pointer-events-none" />

            {/* Card */}
            <div className="relative z-10 w-full max-w-[400px] px-4 py-6 md:py-0 animate-fadeIn">
                <div className="bg-slate-900 rounded-2xl border border-white/10 shadow-modal overflow-hidden">
                    {/* Top accent line */}
                    <div className="h-[3px] bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600/20" />

                    <div className="p-8 sm:p-10">
                        {/* Logo + branding */}
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <Image
                                    src="/roles/Estrella.png"
                                    alt="SSPM"
                                    width={72}
                                    height={72}
                                    className="object-contain shrink-0"
                                    priority
                                />
                                <div className="text-left">
                                    <p className="text-[32px] font-bold text-white tracking-tight leading-none">
                                        SSPM
                                    </p>
                                    <p className="text-xs font-medium text-white/50 tracking-wide mt-1">
                                        San Juan del Río
                                    </p>
                                </div>
                            </div>
                            <h1 className="text-xl font-medium text-white tracking-tight">
                                Iniciar sesión
                            </h1>
                            <p className="text-sm text-white/40 mt-1">
                                Ingresa tus credenciales institucionales
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                            {/* CURP */}
                            <div>
                                <label className="block text-[11px] font-medium text-white/50 uppercase tracking-[0.1em] mb-2">
                                    CURP
                                </label>
                                <div className="relative group">
                                    <KeyRound
                                        size={15}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-200 pointer-events-none"
                                    />
                                    <input
                                        type="text"
                                        value={curp}
                                        onChange={(e) => setCurp(e.target.value.toUpperCase())}
                                        maxLength={18}
                                        required
                                        placeholder="GOML850101HDFNZL02"
                                        className="w-full rounded-xl border border-slate-700/60 bg-slate-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-blue-500/50 focus:bg-slate-800/80 focus:ring-2 focus:ring-blue-600/15 font-mono tracking-wide"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                                        <span className="text-[10px] text-slate-600 font-mono">{curp.length}/18</span>
                                    </div>
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-[11px] font-medium text-white/50 uppercase tracking-[0.1em]">
                                        Contraseña
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            window.open(
                                                'https://www.sanjuandelrio.gob.mx/tramites-sjr/public/forgot-password.html',
                                                '_blank'
                                            )
                                        }
                                        className="text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-all duration-200 hover:underline underline-offset-2 bg-transparent border-none cursor-pointer"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <Lock
                                        size={15}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-200 pointer-events-none"
                                    />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••••"
                                        className="w-full rounded-xl border border-slate-700/60 bg-slate-800/50 py-3 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-blue-500/50 focus:bg-slate-800/80 focus:ring-2 focus:ring-blue-600/15"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm bg-red-500/10 border border-red-500/20 text-red-400 animate-fadeIn">
                                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="relative w-full rounded-xl py-3 text-sm font-medium text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 overflow-hidden group"
                            >
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                {loading ? (
                                    <span className="relative flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        Verificando...
                                    </span>
                                ) : (
                                    <span className="relative">Iniciar sesión</span>
                                )}
                            </button>
                        </form>

                        {/* Register link */}
                        <div className="mt-5 text-center">
                            <a
                                href="https://www.cus.sanjuandelrio.gob.mx/tramites-sjr/public/register.html"
                                target="_blank"
                                className="inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-blue-400 font-medium transition-colors duration-200"
                            >
                                ¿No tienes cuenta? Regístrate
                                <ArrowUpRight size={12} strokeWidth={1.8} />
                            </a>
                        </div>

                        {/* Footer */}
                        <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-white/25">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inset-0 rounded-full bg-green-400 animate-ping" />
                                <span className="relative rounded-full bg-green-400 h-1.5 w-1.5" />
                            </span>
                            <span>Conexión segura · SSL</span>
                        </div>
                    </div>
                </div>

                {/* Support section — below card, dark themed */}
                <div className="flex flex-col items-center gap-0 mt-5">
                    <div className="flex items-center gap-2.5 w-full">
                        <div className="flex-1 h-px bg-white/5" />
                        <button
                            type="button"
                            onClick={() => setShowSupport(!showSupport)}
                            className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 group shrink-0"
                        >
                            <span className="text-[10px] text-white/30 uppercase tracking-wider whitespace-nowrap group-hover:text-white/60 transition-colors duration-150">
                                ¿Problemas para acceder?
                            </span>
                            <ChevronDown
                                size={11}
                                className={`text-white/30 group-hover:text-white/60 transition-all duration-250 ${showSupport ? 'rotate-180' : ''}`}
                                strokeWidth={2.5}
                            />
                        </button>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>

                    <div
                        className={`w-full overflow-hidden transition-all duration-300 ease-in-out
                            ${showSupport ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}
                    >
                        <a
                            href="mailto:sistemas@sanjuandelrio.gob.mx?subject=Solicitud%20de%20soporte%20t%C3%A9cnico%20-%20SSPM&body=Hola%2C%20necesito%20asistencia%20con%20el%20acceso%20al%20sistema."
                            className="flex items-center gap-3 w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-xl transition-all duration-150 active:scale-[0.99] group no-underline"
                        >
                            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                                <Mail size={15} className="text-white/50" strokeWidth={1.8} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] text-white/30 mb-0.5">
                                    Soporte técnico · responde en 24 h
                                </p>
                                <p className="text-[13px] font-medium text-white/70 truncate">
                                    sistemas@sanjuandelrio.gob.mx
                                </p>
                            </div>
                            <ArrowUpRight
                                size={13}
                                className="text-white/30 group-hover:text-white/50 transition-colors shrink-0"
                                strokeWidth={1.8}
                            />
                        </a>
                        <p className="text-[11px] text-white/25 text-center mt-2 leading-relaxed">
                            Se abrirá tu cliente de correo con el{' '}
                            <span className="text-white/40 font-medium">asunto prellenado</span>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
