'use client';

import LoaderOverlay from '@/features/auth/components/LoaderOverlay';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    User,
    FileText,
    Unlock,
    BarChart2,
    Settings,
    ShieldUser,
    ArrowRight,
    Building2,
    Warehouse,
    Shield,
} from 'lucide-react';

const ROLE_CONFIG: Record<string, {
    label: string;
    description: string;
    Icon: React.ElementType;
    accent: string;
    accentBg: string;
    accentLight: string;
    loadingMessage: string;
}> = {
    corralon_mejia: {
        label: 'Corralon Mejia',
        description: 'Consulta de infracciones y generación de acuse',
        Icon: Building2,
        accent: '#22C55E',
        accentBg: '#DCFCE7',
        accentLight: 'rgba(34,197,94,0.12)',
        loadingMessage: 'Cargando tu panel de infracciones...',
    },
    corralon_mw: {
        label: 'Corralon MW',
        description: 'Consulta de infracciones y generación de acuse',
        Icon: Building2,
        accent: '#22C55E',
        accentBg: '#DCFCE7',
        accentLight: 'rgba(34,197,94,0.12)',
        loadingMessage: 'Cargando tu panel de infracciones...',
    },
    fiscalia: {
        label: 'Fiscalía',
        description: 'Consulta de infracciones y generación de acuse',
        Icon: Building2,
        accent: '#22C55E',
        accentBg: '#DCFCE7',
        accentLight: 'rgba(34,197,94,0.12)',
        loadingMessage: 'Cargando tu panel de infracciones...',
    },
    juzgado_civico: {
        label: 'Jusgado Civico',
        description: 'Consulta de infracciones y generación de acuse',
        Icon: Building2,
        accent: '#22C55E',
        accentBg: '#DCFCE7',
        accentLight: 'rgba(34,197,94,0.12)',
        loadingMessage: 'Cargando tu panel de infracciones...',
    },


    ciudadano: {
        label: 'Ciudadano',
        description: 'Consulta de infracciones y generación de acuse',
        Icon: User,
        accent: '#22C55E',
        accentBg: '#DCFCE7',
        accentLight: 'rgba(34,197,94,0.12)',
        loadingMessage: 'Cargando tu panel de infracciones...',
    },
    oficial: {
        label: 'Oficial de Policía',
        description: 'Captura y registro de órdenes de infracción',
        Icon: ShieldUser,
        accent: '#2563EB',
        accentBg: '#EFF6FF',
        accentLight: 'rgba(37,99,235,0.12)',
        loadingMessage: 'Cargando panel operativo...',
    },
    infracciones: {
        label: 'Depto. Infracciones',
        description: 'Seguimiento y validación de registros',
        Icon: FileText,
        accent: '#F59E0B',
        accentBg: '#FEF3C7',
        accentLight: 'rgba(245,158,11,0.12)',
        loadingMessage: 'Preparando módulo de Infracciones...',
    },
    liberaciones: {
        label: 'Depto. Liberaciones',
        description: 'Gestión de liberaciones de vehículos',
        Icon: Unlock,
        accent: '#22C55E',
        accentBg: '#DCFCE7',
        accentLight: 'rgba(34,197,94,0.12)',
        loadingMessage: 'Preparando módulo de liberaciones...',
    },
    rev_gral: {
        label: 'Dirección',
        description: 'Vista general y métricas de operación',
        Icon: BarChart2,
        accent: '#F59E0B',
        accentBg: '#FEF3C7',
        accentLight: 'rgba(245,158,11,0.12)',
        loadingMessage: 'Cargando métricas y panel general...',
    },
    admin: {
        label: 'Super Administrador',
        description: 'Gestión de usuarios y catálogos del sistema',
        Icon: Settings,
        accent: '#8B5CF6',
        accentBg: '#F3E8FF',
        accentLight: 'rgba(139,92,246,0.12)',
        loadingMessage: 'Accediendo a configuración del sistema...',
    },
};

function Spinner({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <svg className={`animate-spin ${className ?? ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={style}>
            <circle cx="12" cy="12" r="10" className="stroke-current opacity-25" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" className="stroke-current" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

function BackgroundDecoration() {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#2563EB]/[0.03] blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#60A5FA]/[0.03] blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#2563EB]/[0.02] blur-3xl" />
            <svg className="absolute inset-0 w-full h-full opacity-[0.015]"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern id="role-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#2563EB" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#role-grid)" />
            </svg>
        </div>
    );
}

interface SeleccionarRolProps {
    rolesIniciales: string[];
    lastRole: string | null;
}

export default function SeleccionarRol({ rolesIniciales, lastRole }: SeleccionarRolProps) {
    const [isClosing, setIsClosing] = useState(false);
    const router = useRouter();
    const [loadingRole, setLoadingRole] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Cargando tu espacio de trabajo...');
    const [roles, setRoles] = useState<string[]>(rolesIniciales);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (roles.length === 0) {
            try {
                const stored = sessionStorage.getItem('available_roles');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setRoles(parsed);
                        sessionStorage.removeItem('available_roles');
                    }
                }
            } catch {
            }
        }
    }, [roles.length]);

    const rolesOrdenados = [...roles];
    if (lastRole && rolesOrdenados.includes(lastRole)) {
        const index = rolesOrdenados.indexOf(lastRole);
        rolesOrdenados.splice(index, 1);
        rolesOrdenados.unshift(lastRole);
    }

    const seleccionarRol = async (rol: string) => {
        if (loadingRole) return;
        const config = ROLE_CONFIG[rol];

        setLoadingMessage(config?.loadingMessage ?? 'Cargando...');
        setIsClosing(true);
        setLoadingRole(rol);

        try {
            const res = await fetch('/api/auth/select-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rol }),
            });

            const data = await res.json();

            if (data.ok && data.redirectTo) {
                document.cookie = `last_role=${rol}; path=/; max-age=2592000; SameSite=Lax`;

                setTimeout(() => {
                    router.replace(data.redirectTo);
                }, 50);
            } else {
                setIsClosing(false);
                setLoadingRole(null);
            }
        } catch (err) {
            console.error(err);
            setIsClosing(false);
            setLoadingRole(null);
        }
    };

    return (
        <>
            <LoaderOverlay show={isClosing} text={loadingMessage} />

            <main className="min-h-screen w-full overflow-y-auto bg-[#F1F5F9] flex flex-col justify-between relative">
                <BackgroundDecoration />

                <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full max-w-5xl grow flex flex-col justify-center">

                    {/* Header */}
                    <div className={`mb-10 sm:mb-12 text-center transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] flex items-center justify-center mx-auto mb-5 shadow-[0_8px_24px_rgba(37,99,235,0.2)]">
                            <Shield size={26} className="text-white" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight mb-2">
                            Seleccionar perfil
                        </h1>
                        <p className="text-sm text-[#64748B] max-w-md mx-auto">
                            Elige el perfil con el que deseas trabajar en esta sesión operativa.
                        </p>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {rolesOrdenados.map((rol, index) => {
                            const isLastUsed = lastRole === rol;
                            const config = ROLE_CONFIG[rol];
                            if (!config) return null;

                            const {
                                label,
                                description,
                                Icon,
                                accent,
                                accentBg,
                                accentLight,
                            } = config;

                            const isLoading = loadingRole === rol;
                            const isDisabled = !!loadingRole && !isLoading;

                            return (
                                <button
                                    key={rol}
                                    onClick={() => seleccionarRol(rol)}
                                    disabled={isLoading || isDisabled}
                                    style={{
                                        animationDelay: `${index * 60}ms`,
                                        transitionDuration: '300ms',
                                    }}
                                    className={`
                                        group w-full text-left rounded-xl overflow-hidden flex flex-col
                                        bg-[#FFFFFF] border border-[#E2E8F0]
                                        shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]
                                        transition-all duration-300 ease-out
                                        hover:-translate-y-1
                                        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB]
                                        ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                                        ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
                                    `}
                                    onMouseEnter={(e) => {
                                        if (!isDisabled) {
                                            e.currentTarget.style.borderColor = accent;
                                            e.currentTarget.style.boxShadow = `0 6px 20px ${accentLight}, 0 1px 3px rgba(0,0,0,0.04)`;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isDisabled) {
                                            e.currentTarget.style.borderColor = '#E2E8F0';
                                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
                                        }
                                    }}
                                >
                                    {/* Banner */}
                                    <div
                                        className="relative flex items-center justify-center h-24 w-full overflow-hidden"
                                        style={{ background: `linear-gradient(135deg, ${accentLight}, ${accentBg})` }}
                                    >
                                        <Icon
                                            size={64}
                                            strokeWidth={1}
                                            className="opacity-[0.15] transition-all duration-500 group-hover:scale-110 group-hover:opacity-[0.25]"
                                            style={{ color: accent }}
                                            aria-hidden="true"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
                                    </div>

                                    <div className="p-5 flex flex-col grow justify-between min-h-[140px]">
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div
                                                        className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200"
                                                        style={{ backgroundColor: accentBg }}
                                                    >
                                                        {isLoading ? (
                                                            <Spinner className="" style={{ color: accent }} />
                                                        ) : (
                                                            <Icon size={16} strokeWidth={2} style={{ color: accent }} />
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-semibold text-[#0F172A] leading-tight truncate">
                                                        {label}
                                                    </span>
                                                </div>

                                                {isLastUsed && (
                                                    <span
                                                        className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
                                                        style={{
                                                            backgroundColor: accentBg,
                                                            color: accent,
                                                            border: `1px solid`,
                                                            borderColor: accentLight,
                                                        }}
                                                    >
                                                        Último usado
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                                                {description}
                                            </p>
                                        </div>

                                        <div
                                            className="mt-4 flex items-center gap-1.5 text-[11px] font-medium opacity-0 -translate-x-1 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0"
                                            style={{ color: accent }}
                                        >
                                            <span>Continuar como {label}</span>
                                            <ArrowRight size={12} strokeWidth={2} className="animate-pulse" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <footer className="relative z-10 w-full py-6 text-center text-[10px] text-[#94A3B8] border-t border-[#E2E8F0] bg-white/80 backdrop-blur-sm tracking-wide shrink-0">
                    Sistema Integral de Infracciones · SSPM de San Juan del Río
                </footer>
            </main>
        </>
    );
}
