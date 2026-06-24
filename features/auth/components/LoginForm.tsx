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
            } else if (data.action === 'PENDING_APPROVAL') {
                router.push('/pending-approval');
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
        <main className="min-h-dvh w-full overflow-x-hidden flex flex-col md:flex-row bg-slate-50">
            {/* ─── Left Panel — Form ─── */}
            <div className="relative w-full md:w-[55%] lg:w-1/2 bg-slate-50 flex items-center justify-center px-5 py-10 md:py-10 lg:py-0 min-w-0">
                {/* Logo — absolute en md+, oculto en mobile */}
                <div className="hidden md:flex absolute top-8 md:top-8 lg:top-8 left-5 md:left-10 lg:left-16 items-center gap-3 md:gap-4">
                    <Image
                        src="/roles/Estrella.png"
                        alt="SSPM"
                        width={40}
                        height={40}
                        className="md:w-[48px] md:h-[48px] lg:w-[56px] lg:h-[56px] object-contain shrink-0"
                        priority
                    />
                    <div className="hidden sm:block">
                        <span className="text-base md:text-xl font-bold text-slate-900 tracking-tight leading-none block">
                            Secretaría de Seguridad
                        </span>
                        <span className="text-[10px] md:text-xs font-medium text-slate-400 tracking-[0.15em] uppercase leading-none mt-1 md:mt-1.5 block">
                            Pública Municipal
                        </span>
                    </div>
                </div>

                {/* ─── Card del formulario en mobile ─── */}
                <div className="w-full max-w-[420px] md:max-w-[460px] animate-fadeIn mt-16 md:mt-0">
                    {/* En mobile: card blanca con sombra. En md+: sin card, directo sobre fondo */}
                    <div className="md:hidden bg-white border border-slate-200 rounded-xl p-6 shadow-card space-y-5">
                        <MobileFormContent
                            curp={curp}
                            setCurp={setCurp}
                            password={password}
                            setPassword={setPassword}
                            loading={loading}
                            error={error}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                            showSupport={showSupport}
                            setShowSupport={setShowSupport}
                            handleSubmit={handleSubmit}
                        />
                    </div>
                    <div className="hidden md:block space-y-6">
                        <DesktopFormContent
                            curp={curp}
                            setCurp={setCurp}
                            password={password}
                            setPassword={setPassword}
                            loading={loading}
                            error={error}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                            showSupport={showSupport}
                            setShowSupport={setShowSupport}
                            handleSubmit={handleSubmit}
                        />
                    </div>
                </div>
            </div>

            {/* ─── Right Panel — Dark Branding ─── */}
            {/* Oculto en mobile, visible desde md */}
            <div className="hidden md:flex md:w-[45%] lg:w-1/2 p-4 lg:p-5 flex-col">
                <div className="relative flex-1 bg-gradient-to-b from-blue-800 via-blue-900 to-blue-950 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                    {/* Decorative elements */}
                    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-700/8 blur-3xl pointer-events-none" />

                    {/* Subtle dot pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
                            backgroundSize: '32px 32px',
                        }}
                    />

                    {/* Top accent line */}
                    <div className="relative z-10 h-[3px] bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500/20 shrink-0" />

                    <div className="relative z-10 flex-1 flex flex-col justify-between px-8 py-12 lg:px-14 lg:py-20">
                        {/* ─── Collage de imágenes ─── */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                            {/* Tablet collage — images principales */}
                            <div className="lg:hidden">
                                <div
                                    style={{
                                        transform:
                                            'perspective(1300px) rotateY(-20deg) rotateX(10deg) rotate(1deg)',
                                    }}
                                    className="absolute left-[42%] top-[70%] -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[420px] aspect-[16/10] bg-white/[0.08] backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl rotate-[1.8deg] z-[1]"
                                >
                                    <Image
                                        fill
                                        src="/login-preview/01-dashboard.png"
                                        alt="Dashboard oficial"
                                        className="object-cover"
                                        sizes="30vw"
                                    />
                                </div>
                                <div
                                    style={{
                                        transform:
                                            'perspective(1300px) rotateY(-15deg) rotateX(10deg) rotate(0deg)',
                                    }}
                                    className="absolute left-[45%] top-[28%] -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[420px] aspect-[16/10] bg-white/[0.08] backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl rotate-[1.8deg] z-[1]"
                                >
                                    <Image
                                        fill
                                        src="/login-preview/07-dashboard-admin.png"
                                        alt="Dashboard administración"
                                        className="object-cover"
                                        sizes="30vw"
                                    />
                                </div>
                            </div>

                            {/* Desktop collage — todas las imágenes */}
                            <div className="hidden lg:block">
                                <div
                                    style={{
                                        transform:
                                            'perspective(1300px) rotateY(-20deg) rotateX(10deg) rotate(1deg)',
                                    }}
                                    className="absolute left-[40%] top-[80%] -translate-x-1/2 -translate-y-1/2 w-[100%] max-w-[700px] aspect-[16/10] bg-white/[0.08] backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl rotate-[1.8deg] z-[1]"
                                >
                                    <Image
                                        fill
                                        src="/login-preview/01-dashboard.png"
                                        alt="Dashboard oficial"
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 50vw, 25vw"
                                    />
                                </div>

                                <div
                                    style={{
                                        transform:
                                            'perspective(1300px) rotateY(-20deg) rotateX(10deg) rotate(1deg)',
                                    }}
                                    className="absolute left-[80%] top-[80%] -translate-x-1/2 -translate-y-1/2 w-[50%] max-w-[700px] aspect-[16/10] bg-white/[0.08] backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl rotate-[1.8deg] z-[1]"
                                >
                                    <Image
                                        fill
                                        src="/login-preview/02-ubicacion.png"
                                        alt="Mapa ubicación"
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 50vw, 25vw"
                                    />
                                </div>

                                <div
                                    style={{
                                        transform:
                                            'perspective(1300px) rotateY(-20deg) rotateX(10deg) rotate(1deg)',
                                    }}
                                    className="absolute left-[80%] top-[99%] -translate-x-1/2 -translate-y-1/2 w-[50%] max-w-[700px] aspect-[16/10] bg-white/[0.08] backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl rotate-[1.8deg] z-[1]"
                                >
                                    <Image
                                        fill
                                        src="/login-preview/03-orden-pago.png"
                                        alt="Orden de pago"
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 50vw, 25vw"
                                    />
                                </div>

                                <div
                                    style={{
                                        transform:
                                            'perspective(1300px) rotateY(-15deg) rotateX(10deg) rotate(0deg)',
                                    }}
                                    className="absolute left-[45%] top-[30%] -translate-x-1/2 -translate-y-1/2 w-[100%] max-w-[700px] aspect-[16/10] bg-white/[0.08] backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl rotate-[1.8deg] z-[1]"
                                >
                                    <Image
                                        fill
                                        src="/login-preview/07-dashboard-admin.png"
                                        alt="Dashboard administración"
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 50vw, 25vw"
                                    />
                                </div>

                                <div
                                    style={{
                                        transform:
                                            'perspective(1300px) rotateY(-15deg) rotateX(10deg) rotate(0deg)',
                                    }}
                                    className="absolute left-[70%] top-[50%] -translate-x-1/2 -translate-y-1/2 w-[60%] max-w-[700px] aspect-[16/10] bg-white/[0.08] backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl rotate-[1.8deg] z-[1]"
                                >
                                    <Image
                                        fill
                                        src="/login-preview/06-dashboard-admin.png"
                                        alt="Dashboard administración"
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 50vw, 25vw"
                                    />
                                </div>
                            </div>

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-950/5 via-blue-950/40 to-blue-950/95" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

/* ─── Shared form fields ─── */

function FormFields({
    curp,
    setCurp,
    password,
    setPassword,
    loading,
    error,
    showPassword,
    setShowPassword,
    handleSubmit,
}: {
    curp: string;
    setCurp: (v: string) => void;
    password: string;
    setPassword: (v: string) => void;
    loading: boolean;
    error: string | null;
    showPassword: boolean;
    setShowPassword: (v: boolean) => void;
    handleSubmit: (e: React.FormEvent) => void;
}) {
    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* CURP */}
            <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                    CURP
                </label>
                <div className="relative">
                    <KeyRound
                        size={16}
                        strokeWidth={1.5}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        aria-hidden="true"
                    />
                    <input
                        type="text"
                        value={curp}
                        onChange={(e) =>
                            setCurp(e.target.value.toUpperCase())
                        }
                        maxLength={18}
                        required
                        placeholder="GOML850101HDFNZL02"
                        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-10 py-2 text-sm text-slate-900 h-[38px] placeholder:text-slate-400 font-mono tracking-wide focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-shadow duration-150"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-mono pointer-events-none">
                        {curp.length}/18
                    </span>
                </div>
            </div>

            {/* Password */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-600">
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
                        className="text-[11px] font-medium text-blue-700 hover:text-blue-800 transition-colors duration-150 hover:underline underline-offset-2 bg-transparent border-none cursor-pointer"
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>
                <div className="relative">
                    <Lock
                        size={16}
                        strokeWidth={1.5}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        aria-hidden="true"
                    />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••••"
                        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-10 py-2 text-sm text-slate-900 h-[38px] placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-shadow duration-150"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer"
                        aria-label={
                            showPassword
                                ? 'Ocultar contraseña'
                                : 'Mostrar contraseña'
                        }
                    >
                        {showPassword ? (
                            <EyeOff size={16} strokeWidth={1.5} />
                        ) : (
                            <Eye size={16} strokeWidth={1.5} />
                        )}
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm bg-red-50 border border-red-300 text-red-800">
                    <AlertCircle
                        size={16}
                        strokeWidth={1.5}
                        className="mt-0.5 shrink-0"
                        aria-hidden="true"
                    />
                    <span>{error}</span>
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2
                            size={16}
                            className="animate-spin"
                            aria-hidden="true"
                        />
                        Verificando...
                    </>
                ) : (
                    'Iniciar sesión'
                )}
            </button>
        </form>
    );
}

/* ─── Mobile content (inside white card) ─── */

function MobileFormContent({
    curp,
    setCurp,
    password,
    setPassword,
    loading,
    error,
    showPassword,
    setShowPassword,
    showSupport,
    setShowSupport,
    handleSubmit,
}: {
    curp: string;
    setCurp: (v: string) => void;
    password: string;
    setPassword: (v: string) => void;
    loading: boolean;
    error: string | null;
    showPassword: boolean;
    setShowPassword: (v: boolean) => void;
    showSupport: boolean;
    setShowSupport: (v: boolean) => void;
    handleSubmit: (e: React.FormEvent) => void;
}) {
    return (
        <>
            {/* Heading */}
            <div className="text-center">
                <div className="mb-3 flex justify-center">
                    <Image
                        src="/roles/Estrella.png"
                        alt="SSPM"
                        width={40}
                        height={40}
                        className="object-contain"
                        priority
                    />
                </div>
                <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">
                    Iniciar sesión
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Ingresa tus credenciales institucionales
                </p>
            </div>

            <FormFields
                curp={curp}
                setCurp={setCurp}
                password={password}
                setPassword={setPassword}
                loading={loading}
                error={error}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                handleSubmit={handleSubmit}
            />

            <MobileSupportSection
                showSupport={showSupport}
                setShowSupport={setShowSupport}
            />
        </>
    );
}

/* ─── Desktop content (no card, direct on bg) ─── */

function DesktopFormContent({
    curp,
    setCurp,
    password,
    setPassword,
    loading,
    error,
    showPassword,
    setShowPassword,
    showSupport,
    setShowSupport,
    handleSubmit,
}: {
    curp: string;
    setCurp: (v: string) => void;
    password: string;
    setPassword: (v: string) => void;
    loading: boolean;
    error: string | null;
    showPassword: boolean;
    setShowPassword: (v: boolean) => void;
    showSupport: boolean;
    setShowSupport: (v: boolean) => void;
    handleSubmit: (e: React.FormEvent) => void;
}) {
    return (
        <>
            {/* Heading */}
            <div className="text-center">
                <div className="mb-4 flex justify-center">
                    <Image
                        src="/roles/Estrella.png"
                        alt="SSPM"
                        width={48}
                        height={48}
                        className="object-contain"
                        priority
                    />
                </div>
                <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">
                    Iniciar sesión
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Ingresa tus credenciales institucionales
                </p>
            </div>

            <FormFields
                curp={curp}
                setCurp={setCurp}
                password={password}
                setPassword={setPassword}
                loading={loading}
                error={error}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                handleSubmit={handleSubmit}
            />

            {/* Register link */}
            <div className="text-center">
                <a
                    href="https://www.cus.sanjuandelrio.gob.mx/tramites-sjr/public/register.html"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-700 font-medium transition-colors duration-150"
                >
                    ¿No tienes cuenta? Regístrate
                    <ArrowUpRight
                        size={13}
                        strokeWidth={1.5}
                        aria-hidden="true"
                    />
                </a>
            </div>

            <DesktopSupportSection
                showSupport={showSupport}
                setShowSupport={setShowSupport}
            />
        </>
    );
}

/* ─── Support section — mobile ─── */

function MobileSupportSection({
    showSupport,
    setShowSupport,
}: {
    showSupport: boolean;
    setShowSupport: (v: boolean) => void;
}) {
    return (
        <div className="flex flex-col items-center gap-0">
            <div className="flex items-center gap-2.5 w-full">
                <div className="flex-1 h-px bg-slate-200" />
                <button
                    type="button"
                    onClick={() => setShowSupport(!showSupport)}
                    className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 group shrink-0"
                >
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider whitespace-nowrap group-hover:text-slate-600 transition-colors duration-150">
                        ¿Problemas para acceder?
                    </span>
                    <ChevronDown
                        size={11}
                        strokeWidth={2.5}
                        className={`text-slate-400 group-hover:text-slate-600 transition-all duration-250 ${showSupport ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                    />
                </button>
                <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div
                className={`w-full overflow-hidden transition-all duration-300 ease-in-out
                    ${showSupport ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}
            >
                <a
                    href="mailto:sistemas@sanjuandelrio.gob.mx?subject=Solicitud%20de%20soporte%20t%C3%A9cnico%20-%20SSPM&body=Hola%2C%20necesito%20asistencia%20con%20el%20acceso%20al%20sistema."
                    className="flex items-center gap-3 w-full px-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-150 active:scale-[0.99] group no-underline"
                >
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-slate-100 transition-colors">
                        <Mail
                            size={15}
                            strokeWidth={1.5}
                            className="text-slate-500"
                            aria-hidden="true"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-slate-400 mb-0.5">
                            Soporte técnico · responde en 24 h
                        </p>
                        <p className="text-[13px] font-medium text-slate-700 truncate">
                            sistemas@sanjuandelrio.gob.mx
                        </p>
                    </div>
                    <ArrowUpRight
                        size={13}
                        strokeWidth={1.5}
                        className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0"
                        aria-hidden="true"
                    />
                </a>
                <p className="text-[11px] text-slate-400 text-center mt-2 leading-relaxed">
                    Se abrirá tu cliente de correo con el{' '}
                    <span className="text-slate-600 font-medium">
                        asunto prellenado
                    </span>
                </p>
            </div>
        </div>
    );
}

/* ─── Support section — desktop ─── */

function DesktopSupportSection({
    showSupport,
    setShowSupport,
}: {
    showSupport: boolean;
    setShowSupport: (v: boolean) => void;
}) {
    return (
        <div className="flex flex-col items-center gap-0">
            <div className="flex items-center gap-2.5 w-full">
                <div className="flex-1 h-px bg-slate-200" />
                <button
                    type="button"
                    onClick={() => setShowSupport(!showSupport)}
                    className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 group shrink-0"
                >
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider whitespace-nowrap group-hover:text-slate-600 transition-colors duration-150">
                        ¿Problemas para acceder?
                    </span>
                    <ChevronDown
                        size={11}
                        strokeWidth={2.5}
                        className={`text-slate-400 group-hover:text-slate-600 transition-all duration-250 ${showSupport ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                    />
                </button>
                <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div
                className={`w-full overflow-hidden transition-all duration-300 ease-in-out
                    ${showSupport ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}
            >
                <a
                    href="mailto:sistemas@sanjuandelrio.gob.mx?subject=Solicitud%20de%20soporte%20t%C3%A9cnico%20-%20SSPM&body=Hola%2C%20necesito%20asistencia%20con%20el%20acceso%20al%20sistema."
                    className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-150 active:scale-[0.99] group no-underline"
                >
                    <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-slate-100 transition-colors">
                        <Mail
                            size={15}
                            strokeWidth={1.5}
                            className="text-slate-500"
                            aria-hidden="true"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-slate-400 mb-0.5">
                            Soporte técnico · responde en 24 h
                        </p>
                        <p className="text-[13px] font-medium text-slate-700 truncate">
                            sistemas@sanjuandelrio.gob.mx
                        </p>
                    </div>
                    <ArrowUpRight
                        size={13}
                        strokeWidth={1.5}
                        className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0"
                        aria-hidden="true"
                    />
                </a>
                <p className="text-[11px] text-slate-400 text-center mt-2 leading-relaxed">
                    Se abrirá tu cliente de correo con el{' '}
                    <span className="text-slate-600 font-medium">
                        asunto prellenado
                    </span>
                </p>
            </div>
        </div>
    );
}
