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

const BRAND = {
    accent: '#1D4ED8',
    accentBg: '#EFF6FF',
    accentLight: 'rgba(29,78,216,0.12)',
};

const ROLE_CONFIG: Record<string, {
    label: string;
    description: string;
    Icon: React.ElementType;
    loadingMessage: string;
}> = {
    corralon_mejia: {
        label: 'Corralon Mejía',
        description: 'Gestión de liberaciones y comprobantes de pago',
        Icon: Warehouse,
        loadingMessage: 'Cargando tu panel de infracciones...',
    },
    corralon_mw: {
        label: 'Corralón MW',
        description: 'Consulta de infracciones y generación de acuse',
        Icon: Building2,
        loadingMessage: 'Cargando tu panel de infracciones...',
    },
    fiscalia: {
        label: 'Fiscalía',
        description: 'Inicio de atención y gestión de oficios de infracción',
        Icon: Building2,
        loadingMessage: 'Cargando panel de fiscalía...',
    },
    juzgado_civico: {
        label: 'Juzgado Cívico',
        description: 'Recepción y resolución de casos de infracción',
        Icon: Shield,
        loadingMessage: 'Cargando panel del juzgado...',
    },
    ciudadano: {
        label: 'Ciudadano',
        description: 'Consulta de infracciones y seguimiento de trámites',
        Icon: User,
        loadingMessage: 'Cargando tu perfil ciudadano...',
    },
    oficial: {
        label: 'Oficial de Policía',
        description: 'Captura y registro de órdenes de infracción',
        Icon: ShieldUser,
        loadingMessage: 'Cargando panel operativo...',
    },
    infracciones: {
        label: 'Depto. Infracciones',
        description: 'Seguimiento y validación de registros',
        Icon: FileText,
        loadingMessage: 'Preparando módulo de Infracciones...',
    },
    liberaciones: {
        label: 'Depto. Liberaciones',
        description: 'Gestión de liberaciones de vehículos del corralón',
        Icon: Unlock,
        loadingMessage: 'Preparando módulo de liberaciones...',
    },
    rev_gral: {
        label: 'Dirección',
        description: 'Vista general y métricas de operación',
        Icon: BarChart2,
        loadingMessage: 'Cargando métricas y panel general...',
    },
    admin: {
        label: 'Administrador',
        description: 'Gestión de oficiales y catálogos del sistema',
        Icon: Settings,
        loadingMessage: 'Accediendo a configuración del sistema...',
    },
    super_admin: {
        label: 'Super Administrador',
        description: 'Gestión total del sistema, usuarios y roles',
        Icon: Shield,
        loadingMessage: 'Accediendo al panel de administración...',
    },
};

function Spinner({ className }: { className?: string }) {
    return (
        <svg className={`animate-spin ${className ?? ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" className="stroke-current opacity-25" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" className="stroke-current" strokeWidth="3" strokeLinecap="round" />
        </svg>
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

            <main className="min-h-screen w-full overflow-y-auto bg-slate-50 flex flex-col justify-between relative">
                <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full max-w-5xl grow flex flex-col justify-center">

                    {/* Header */}
                    <div className={`mb-10 sm:mb-12 text-center transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-800/20">
                            <Shield size={26} className="text-white" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight mb-2">
                            Seleccionar perfil
                        </h1>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
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
                                        bg-white border border-slate-200 shadow-card
                                        transition-all duration-300 ease-out
                                        hover:-translate-y-1 active:scale-[0.99]
                                        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/10 focus-visible:border-blue-700
                                        ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                                        ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
                                    `}
                                    onMouseEnter={(e) => {
                                        if (!isDisabled) {
                                            e.currentTarget.style.borderColor = BRAND.accent;
                                            e.currentTarget.style.boxShadow = `0 6px 20px ${BRAND.accentLight}, 0 1px 3px rgba(0,0,0,0.04)`;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isDisabled) {
                                            e.currentTarget.style.borderColor = '';
                                            e.currentTarget.style.boxShadow = '';
                                        }
                                    }}
                                >
                                    {/* Banner */}
                                    <div className="relative flex items-center justify-center h-24 w-full overflow-hidden bg-gradient-to-br from-blue-700/10 to-blue-50">
                                        <Icon
                                            size={64}
                                            strokeWidth={1}
                                            className="text-blue-700/20 transition-all duration-500 group-hover:scale-110 group-hover:text-blue-700/40"
                                            aria-hidden="true"
                                        />
                                    </div>

                                    <div className="p-5 flex flex-col grow justify-between min-h-[140px]">
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-700">
                                                        {isLoading ? (
                                                            <Spinner className="text-blue-700" />
                                                        ) : (
                                                            <Icon size={16} strokeWidth={2} />
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900 leading-tight truncate">
                                                        {label}
                                                    </span>
                                                </div>

                                                {isLastUsed && (
                                                    <span className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap bg-blue-50 text-blue-700 border border-blue-700/10">
                                                        Último usado
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                {description}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-blue-700 opacity-0 -translate-x-1 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0">
                                            <span>Continuar como {label}</span>
                                            <ArrowRight size={12} strokeWidth={2} className="animate-pulse" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <footer className="relative z-10 w-full py-6 text-center text-[10px] text-slate-400 border-t border-slate-200 bg-white/80 backdrop-blur-sm tracking-wide shrink-0">
                    Sistema Integral de Infracciones · SSPM de San Juan del Río
                </footer>
            </main>
        </>
    );
}
