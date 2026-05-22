'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';

function GridPattern() {
    return (
        <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.035 }}
        >
            <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="#1A2335"
                        strokeWidth="1"
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
    );
}

export default function LoginForm() {
    const router = useRouter();

    const [curp, setCurp] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [, setShakeError] = useState(false);
    const [showSupport, setShowSupport] = useState(false);

    useEffect(() => {
        if (error) {
            setShakeError(true);
            const t = setTimeout(() => setShakeError(false), 400);
            return () => clearTimeout(t);
        }
    }, [error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ curp, password }),
                credentials: 'include', // 🔥 ESTO ES CLAVE
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
        <main
            className="min-h-screen w-full flex overflow-hidden"
            style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
            {/* ─── Left panel ─── */}
            <div className="hidden lg:flex relative w-[45%] overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/roles/sspm.webp')" }}
                />
                <div
                    className="absolute inset-0"
                    style={{ background: 'rgba(10, 25, 45, 0.55)' }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(to top, #0A1929 0%, #0F2E4A 30%, rgba(15,46,74,0.6) 60%, transparent 100%)',
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(to right, rgba(10,25,45,0.5) 0%, transparent 60%)',
                    }}
                />
                <div
                    className="absolute top-0 left-0 right-0 h-0.75"
                    style={{
                        background:
                            'linear-gradient(90deg, #F5C842, rgba(91,184,212,0.6), transparent)',
                    }}
                />

                <div className="relative z-10 flex flex-col justify-between w-full px-16 py-14 text-white">
                    {/* TOP: Marca institucional */}
                    <div className="flex items-center gap-4">
                        <div
                            className="relative h-12 w-12 rounded-xl flex items-center justify-center
                         bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
                        >
                            <Image
                                src="/roles/Estrella-Back.webp"
                                alt="Estrella"
                                fill
                                className="object-contain p-2"
                                sizes="48px"
                            />
                        </div>
                        <div>
                            <p
                                className="text-xs tracking-[0.25em] uppercase font-bold"
                                style={{
                                    color: 'rgba(255,255,255,0.9)',
                                    textShadow: '0 1px 6px rgba(0,0,0,0.5)',
                                }}
                            >
                                SSPM
                            </p>
                            <p
                                className="text-[11px] tracking-wide"
                                style={{
                                    color: 'rgba(255,255,255,0.55)',
                                    textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                                }}
                            >
                                Secretaría de Seguridad Pública Municipal
                            </p>
                        </div>
                    </div>

                    {/* CENTRO: Identidad VIA */}
                    <div className="max-w-md">
                        <div
                            className="h-0.75 w-14 rounded-full mb-6"
                            style={{ background: '#F5C842' }}
                        />
                        <h2
                            className="text-5xl font-bold tracking-tight leading-none"
                            style={{
                                fontFamily: "'DM Serif Display', Georgia, serif",
                                color: 'white',
                                textShadow:
                                    '0 2px 20px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.8)',
                            }}
                        >
                            VIA
                        </h2>
                        <p
                            className="mt-4 text-xl font-medium leading-snug"
                            style={{
                                color: 'rgba(255,255,255,0.88)',
                                textShadow: '0 1px 10px rgba(0,0,0,0.5)',
                            }}
                        >
                            Vinculación Integral
                            <br />
                            Y Administración
                            <br />
                            de Infracciones
                        </p>
                        <div
                            className="my-5 h-px w-20"
                            style={{ background: 'rgba(255,255,255,0.15)' }}
                        />
                        <p
                            className="text-sm leading-relaxed"
                            style={{
                                color: 'rgba(255,255,255,0.65)',
                                textShadow: '0 1px 6px rgba(0,0,0,0.5)',
                                maxWidth: '300px',
                            }}
                        >
                            Plataforma institucional para la gestión y seguimiento de
                            infracciones administrativas dentro del marco operativo municipal.
                        </p>
                    </div>

                    {/* BOTTOM: Metadata */}
                    <div>
                        <div
                            className="mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
                            style={{
                                background: 'rgba(91,184,212,0.15)',
                                border: '1px solid rgba(91,184,212,0.3)',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#5BB8D4] animate-pulse" />
                            <span
                                className="text-[11px] font-semibold tracking-widest uppercase"
                                style={{ color: '#5BB8D4' }}
                            >
                                Sistema activo
                            </span>
                        </div>

                        <div
                            className="grid grid-cols-2 gap-x-8 gap-y-5 pt-6"
                            style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
                        >
                            {[
                                ['Operado por', 'SSPM'],
                                ['Disponibilidad', '24/7'],
                                ['Cifrado', 'TLS'],
                                ['Clasificación', 'Uso Institucional'],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <p
                                        className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-1"
                                        style={{ color: 'rgba(91,184,212,0.8)' }}
                                    >
                                        {label}
                                    </p>
                                    <p
                                        className="text-sm font-semibold"
                                        style={{
                                            color: 'rgba(255,255,255,0.88)',
                                            textShadow: '0 1px 6px rgba(0,0,0,0.4)',
                                        }}
                                    >
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
                <GridPattern />

                {/* Mobile logo */}
                <div className="lg:hidden mb-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2E86AB]">
                        <Shield size={20} color="white" strokeWidth={1.8} />
                    </div>
                    <div>
                        <p className="text-[#1A2335] text-sm font-bold tracking-widest uppercase">
                            SSPM
                        </p>
                        <p className="text-[#6B7A93] text-[10px] tracking-wider uppercase">
                            Secretaría de Seguridad
                        </p>
                    </div>
                </div>

                {/* Card */}
                <div className="relative z-10 w-full max-w-105">
                    <div
                        className="rounded-2xl p-8 shadow-2xl"
                        style={{
                            background: 'white',
                            boxShadow:
                                '0 24px 64px rgba(26,35,53,0.12), 0 2px 8px rgba(26,35,53,0.06)',
                        }}
                    >
                        <div className="mb-8">
                            <h1
                                className="text-2xl font-bold text-[#0D2137] mb-1"
                                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                            >
                                Iniciar sesión - Test v1.4
                            </h1>
                            <p className="text-sm text-[#6B7A93]">
                                Ingresa tus credenciales institucionales
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* CURP */}
                            <div>
                                <label className="block text-[11px] font-bold text-[#6B7A93] uppercase tracking-[0.12em] mb-2">
                                    CURP
                                </label>
                                <div className="relative group">
                                    <KeyRound
                                        size={16}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0AABB] group-focus-within:text-[#2E86AB] transition-colors"
                                    />
                                    <input
                                        type="text"
                                        value={curp}
                                        onChange={(e) => setCurp(e.target.value.toUpperCase())}
                                        maxLength={18}
                                        required
                                        placeholder="GOML850101HDFNZL02"
                                        className="w-full rounded-xl border py-3.5 pl-11 pr-4 text-sm text-[#0D2137] placeholder:text-[#C0C8D4] outline-none transition-all duration-200"
                                        style={{
                                            border: '1.5px solid #E4E8EF',
                                            background: '#F8FAFC',
                                            fontFamily: "'DM Mono', 'Courier New', monospace",
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.border = '1.5px solid #2E86AB';
                                            e.target.style.background = 'white';
                                            e.target.style.boxShadow =
                                                '0 0 0 4px rgba(46,134,171,0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.border = '1.5px solid #E4E8EF';
                                            e.target.style.background = '#F8FAFC';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-[11px] font-bold text-[#6B7A93] uppercase tracking-[0.12em]">
                                        Contraseña
                                    </label>
                                    <a
                                        onClick={() =>
                                            window.open(
                                                'https://www.sanjuandelrio.gob.mx/tramites-sjr/public/forgot-password.html',
                                                '_blank'
                                            )
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] text-[#2E86AB] hover:text-[#1B4F72] font-medium
                               transition-all duration-200 hover:scale-105 cursor-pointer"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>
                                <div className="relative group">
                                    <Lock
                                        size={16}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0AABB] group-focus-within:text-[#2E86AB] transition-colors"
                                    />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••••"
                                        className="w-full rounded-xl border py-3.5 pl-11 pr-12 text-sm text-[#0D2137] placeholder:text-[#C0C8D4] outline-none transition-all duration-200"
                                        style={{
                                            border: '1.5px solid #E4E8EF',
                                            background: '#F8FAFC',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.border = '1.5px solid #2E86AB';
                                            e.target.style.background = 'white';
                                            e.target.style.boxShadow =
                                                '0 0 0 4px rgba(46,134,171,0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.border = '1.5px solid #E4E8EF';
                                            e.target.style.background = '#F8FAFC';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0AABB] hover:text-[#2E86AB] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div
                                    className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
                                    style={{
                                        background: '#FFF8F0',
                                        border: '1.5px solid rgba(232,135,58,0.3)',
                                        color: '#C45E14',
                                    }}
                                >
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                                style={{
                                    background: loading
                                        ? '#2E86AB'
                                        : 'linear-gradient(135deg, #1B4F72 0%, #2E86AB 100%)',
                                    boxShadow: '0 4px 16px rgba(46,134,171,0.35)',
                                    letterSpacing: '0.03em',
                                }}
                                onMouseEnter={(e) =>
                                    !loading &&
                                    (e.currentTarget.style.boxShadow =
                                        '0 6px 24px rgba(46,134,171,0.5)')
                                }
                                onMouseLeave={(e) =>
                                (e.currentTarget.style.boxShadow =
                                    '0 4px 16px rgba(46,134,171,0.35)')
                                }
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        Verificando...
                                    </span>
                                ) : (
                                    'Iniciar sesión'
                                )}
                            </button>
                        </form>

                        {/* Footer SSL */}
                        <div className="mt-6 pt-6 border-t border-[#F0F3F7] flex items-center justify-center gap-1.5 text-[11px] text-[#A0AABB]">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span>Conexión segura · SSL</span>
                            <span className="mx-1.5 text-[#D0D7E0]">·</span>
                            <span>Uso exclusivo institucional</span>
                        </div>
                    </div>
                </div>

                {/* Support contact */}
                <div className="relative z-10 flex flex-col items-center gap-0 mt-8">
                    {/* Trigger row */}
                    <div className="flex items-center gap-2.5 w-full max-w-[360px]">
                        <div className="flex-1 h-px bg-[#E4E8EF]" />
                        <button
                            type="button"
                            onClick={() => setShowSupport(!showSupport)}
                            className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 group"
                        >
                            <span className="text-[10px] text-[#A0AABB] uppercase tracking-wider whitespace-nowrap group-hover:text-[#2E86AB] transition-colors duration-150">
                                ¿Problemas para acceder?
                            </span>
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`text-[#A0AABB] group-hover:text-[#2E86AB] transition-all duration-250
                    ${showSupport ? 'rotate-180' : 'rotate-0'}`}
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
                        <div className="flex-1 h-px bg-[#E4E8EF]" />
                    </div>

                    {/* Expandable panel */}
                    <div
                        className={`w-full max-w-[360px] overflow-hidden transition-all duration-300
                ${showSupport ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}
                    >
                        <a
                            href="mailto:sistemas@sanjuandelrio.gob.mx?subject=Solicitud%20de%20soporte%20t%C3%A9cnico%20-%20SSPM&body=Hola%2C%20necesito%20asistencia%20con%20el%20acceso%20al%20sistema."
                            className="flex items-center gap-3 w-full px-4 py-3 bg-white
                 border-[1.5px] border-[#E4E8EF] hover:border-[#2E86AB]
                 rounded-[14px] transition-all duration-150 active:scale-[0.98] group
                 no-underline"
                            style={{ boxShadow: 'none' }}
                            onMouseEnter={(e) =>
                            (e.currentTarget.style.boxShadow =
                                '0 0 0 4px rgba(46,134,171,0.08)')
                            }
                            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                        >
                            <div className="w-[38px] h-[38px] rounded-full bg-[#EAF4FB] flex items-center justify-center shrink-0">
                                <Mail size={16} className="text-[#2E86AB]" strokeWidth={1.8} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] text-[#A0AABB] mb-0.5">
                                    Soporte técnico · responde en 24 h
                                </p>
                                <p className="text-[13px] font-semibold text-[#0D2137] truncate">
                                    sistemas@sanjuandelrio.gob.mx
                                </p>
                            </div>
                            <ArrowUpRight
                                size={14}
                                className="text-[#C0C8D4] group-hover:text-[#2E86AB] transition-colors shrink-0"
                                strokeWidth={1.8}
                            />
                        </a>
                        <p className="text-[11px] text-[#A0AABB] text-center mt-2 leading-relaxed">
                            Se abrirá tu cliente de correo con el{' '}
                            <span className="text-[#6B7A93] font-medium">
                                asunto prellenado
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
