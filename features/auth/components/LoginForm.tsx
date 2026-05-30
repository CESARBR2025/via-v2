'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useState } from 'react';
import {
    Mail,
    ArrowUpRight,
    Shield,
    KeyRound,
    Eye,
    EyeOff,
    AlertCircle,
    Lock,
    Loader2,
    ChevronDown,
} from 'lucide-react';

const ACCENT = '#2563EB';

function BackgroundShapes() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#2563EB]/5 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#60A5FA]/5 blur-3xl" />
            <div className="absolute top-1/3 -left-20 w-40 h-40 rounded-full bg-[#2563EB]/5 blur-2xl" />
            <svg
                className="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
                style={{ opacity: 0.025 }}
            >
                <defs>
                    <pattern id="login-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2563EB" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#login-grid)" />
            </svg>
        </div>
    );
}

function FloatingDots() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-[#2563EB]/10 animate-pulse"
                    style={{
                        width: 4 + i * 2,
                        height: 4 + i * 2,
                        top: `${10 + i * 15}%`,
                        left: `${5 + i * 18}%`,
                        animationDelay: `${i * 0.8}s`,
                        animationDuration: '3s',
                    }}
                />
            ))}
        </div>
    );
}

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
        <main className="min-h-screen w-full flex overflow-hidden bg-[#F1F5F9]">
            {/* ─── Left panel ─── */}
            <div className="hidden lg:flex relative w-[45%] overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center scale-105"
                    style={{
                        backgroundImage: "url('/roles/sspm.webp')",
                        filter: 'saturate(1.1)',
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/80 via-[#1E40AF]/60 to-[#2563EB]/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A] via-[#1E3A8A]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A]/60 to-transparent" />

                {/* Animated accent line */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#60A5FA] via-[#93C5FD] to-transparent" />

                {/* Floating decorative blobs */}
                <div className="absolute top-1/4 -right-16 w-64 h-64 rounded-full bg-[#2563EB]/10 blur-3xl" />
                <div className="absolute bottom-1/4 -left-16 w-48 h-48 rounded-full bg-[#60A5FA]/10 blur-3xl" />

                {/* Subtle dots pattern overlay */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #60A5FA 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />

                <div className="relative z-10 flex flex-col justify-between w-full px-16 py-14 text-white">
                    {/* TOP */}
                    <div>
                        <div className="flex items-center gap-4">
                            <div className="relative h-12 w-12 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                                <Image
                                    src="/roles/Estrella-Back.webp"
                                    alt="Estrella"
                                    fill
                                    className="object-contain p-2"
                                    sizes="48px"
                                />
                            </div>
                            <div>
                                <p className="text-xs tracking-[0.25em] uppercase font-bold text-white/90">
                                    SSPM
                                </p>
                                <p className="text-[11px] tracking-wide text-white/50">
                                    Secretaría de Seguridad Pública Municipal
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CENTRO */}
                    <div className="max-w-md">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-[3px] w-10 rounded-full bg-[#60A5FA]" />
                            <div className="h-[3px] w-4 rounded-full bg-[#60A5FA]/40" />
                        </div>
                        <h2 className="text-5xl font-bold tracking-tight leading-none text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                            VIA
                        </h2>
                        <p className="mt-4 text-xl font-medium leading-snug text-white/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">
                            Vinculación Integral
                            <br />
                            Y Administración
                            <br />
                            de Infracciones
                        </p>
                        <div className="my-5 h-px w-16 bg-white/15" />
                        <p className="text-sm leading-relaxed text-white/60 max-w-[280px] drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                            Plataforma institucional para la gestión y seguimiento de
                            infracciones administrativas dentro del marco operativo municipal.
                        </p>
                    </div>

                    {/* BOTTOM */}
                    <div>
                        <div className="mb-6 inline-flex items-center gap-2.5 rounded-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/15">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inset-0 rounded-full bg-[#22C55E] animate-ping" />
                                <span className="relative rounded-full bg-[#22C55E] h-2 w-2" />
                            </span>
                            <span className="text-[11px] font-semibold tracking-widest uppercase text-white/80">
                                Sistema activo
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-5 border-t border-white/10">
                            {[
                                ['Operado por', 'SSPM'],
                                ['Disponibilidad', '24/7'],
                                ['Cifrado', 'TLS'],
                                ['Clasificación', 'Uso Institucional'],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <p className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-1 text-[#93C5FD]/80">
                                        {label}
                                    </p>
                                    <p className="text-sm font-semibold text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                                        {value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Right panel / form ─── */}
            <div className="flex-1 flex flex-col items-center justify-center relative px-8 py-12">
                <BackgroundShapes />
                <FloatingDots />

                {/* Mobile logo */}
                <div className="lg:hidden mb-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB] shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
                        <Shield size={20} color="white" strokeWidth={1.8} />
                    </div>
                    <div>
                        <p className="text-[#0F172A] text-sm font-bold tracking-widest uppercase">
                            SSPM
                        </p>
                        <p className="text-[#64748B] text-[10px] tracking-wider uppercase">
                            Secretaría de Seguridad
                        </p>
                    </div>
                </div>

                {/* Card */}
                <div className="relative z-10 w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_4px_12px_rgba(0,0,0,0.07),0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                        {/* Top accent bar */}
                        <div className="h-1 bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-[#93C5FD]" />

                        <div className="p-8">
                            {/* Header */}
                            <div className="mb-8 text-center">
                                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center mx-auto mb-4 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]">
                                    <Shield size={22} className="text-[#2563EB]" strokeWidth={1.5} />
                                </div>
                                <h1 className="text-[22px] font-bold text-[#0F172A] mb-1">
                                    Iniciar sesión
                                </h1>
                                <p className="text-sm text-[#64748B]">
                                    Ingresa tus credenciales institucionales
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* CURP */}
                                <div>
                                    <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-[0.12em] mb-2">
                                        CURP
                                    </label>
                                    <div className="relative group">
                                        <KeyRound
                                            size={16}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#2563EB] transition-colors duration-200 pointer-events-none"
                                        />
                                        <input
                                            type="text"
                                            value={curp}
                                            onChange={(e) => setCurp(e.target.value.toUpperCase())}
                                            maxLength={18}
                                            required
                                            placeholder="GOML850101HDFNZL02"
                                            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all duration-200 focus:border-[#2563EB] focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] focus:ring-0"
                                            style={{ fontFamily: "'DM Mono', 'Courier New', monospace", letterSpacing: '0.03em' }}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <span className="text-[10px] text-[#CBD5E1] font-mono">{curp.length}/18</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-[0.12em]">
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
                                            className="text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-all duration-200 hover:underline underline-offset-2 cursor-pointer bg-transparent border-none"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <Lock
                                            size={16}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#2563EB] transition-colors duration-200 pointer-events-none"
                                        />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="••••••••••"
                                            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-10 pr-10 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all duration-200 focus:border-[#2563EB] focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] focus:ring-0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#2563EB] transition-colors bg-transparent border-none cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="flex items-start gap-3 rounded-lg px-4 py-3 text-sm bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] animate-in fade-in slide-in-from-top-2 duration-200">
                                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="relative w-full rounded-lg py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] shadow-[0_4px_14px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.5)] overflow-hidden group"
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

                            {/* Footer SSL */}
                            <div className="mt-6 pt-5 border-t border-[#E2E8F0] flex items-center justify-center gap-1.5 text-[11px] text-[#94A3B8]">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="absolute inset-0 rounded-full bg-[#22C55E] animate-ping" />
                                    <span className="relative rounded-full bg-[#22C55E] h-1.5 w-1.5" />
                                </span>
                                <span>Conexión segura · SSL</span>
                                <span className="mx-1.5 text-[#CBD5E1]">·</span>
                                <span>Uso exclusivo institucional</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Support contact */}
                <div className="relative z-10 flex flex-col items-center gap-0 mt-6 w-full max-w-[420px]">
                    <div className="flex items-center gap-2.5">
                        <div className="flex-1 h-px bg-[#E2E8F0]" />
                        <button
                            type="button"
                            onClick={() => setShowSupport(!showSupport)}
                            className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 group shrink-0"
                        >
                            <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider whitespace-nowrap group-hover:text-[#2563EB] transition-colors duration-150">
                                ¿Problemas para acceder?
                            </span>
                            <ChevronDown
                                size={12}
                                className={`text-[#94A3B8] group-hover:text-[#2563EB] transition-all duration-250 ${showSupport ? 'rotate-180' : ''}`}
                                strokeWidth={2.5}
                            />
                        </button>
                        <div className="flex-1 h-px bg-[#E2E8F0]" />
                    </div>

                    <div
                        className={`w-full overflow-hidden transition-all duration-300 ease-in-out
                            ${showSupport ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}
                    >
                        <a
                            href="mailto:sistemas@sanjuandelrio.gob.mx?subject=Solicitud%20de%20soporte%20t%C3%A9cnico%20-%20SSPM&body=Hola%2C%20necesito%20asistencia%20con%20el%20acceso%20al%20sistema."
                            className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-lg transition-all duration-150 active:scale-[0.98] group no-underline shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]"
                        >
                            <div className="w-9 h-9 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0 group-hover:bg-[#DBEAFE] transition-colors">
                                <Mail size={16} className="text-[#2563EB]" strokeWidth={1.8} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] text-[#94A3B8] mb-0.5">
                                    Soporte técnico · responde en 24 h
                                </p>
                                <p className="text-[13px] font-semibold text-[#0F172A] truncate">
                                    sistemas@sanjuandelrio.gob.mx
                                </p>
                            </div>
                            <ArrowUpRight
                                size={14}
                                className="text-[#94A3B8] group-hover:text-[#2563EB] transition-colors shrink-0"
                                strokeWidth={1.8}
                            />
                        </a>
                        <p className="text-[11px] text-[#94A3B8] text-center mt-2 leading-relaxed">
                            Se abrirá tu cliente de correo con el{' '}
                            <span className="text-[#64748B] font-medium">asunto prellenado</span>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
