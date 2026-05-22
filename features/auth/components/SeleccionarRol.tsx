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
    ArrowRight
} from 'lucide-react';

interface RoleConfig {
    label: string;
    description: string;
    Icon: React.ElementType;
    bannerClass: string;
    bannerIconClass: string;
    iconBgClass: string;
    iconColorClass: string;
    ctaColorClass: string;
    hoverBorderClass: string;
    badgeClass?: string;
    loadingMessage: string;
}

const ROLE_CONFIG: Record<string, RoleConfig> = {

    dependencia_externa: {
        label: 'Fiscalia',
        description: 'Consulta de infracciones y generación de acuse',
        Icon: User,
        bannerClass: 'bg-gradient-to-br from-[#00ae6f]/10 to-[#00ae6f]/30',
        bannerIconClass: 'text-[#00ae6f]/80',
        iconBgClass: 'bg-[#00ae6f]/10',
        iconColorClass: 'text-[#00ae6f]/70',
        ctaColorClass: 'text-[#00ae6f]/70',
        hoverBorderClass: 'hover:border-[#00ae6f]/30',
        badgeClass: 'bg-[#00ae6f]/10 text-[#00ae6f]/70 border border-[#00ae6f]/20',
        loadingMessage: 'Cargando tu panel de infracciones...',
    },

    corralon: {
        label: 'Corralon',
        description: 'Consulta de infracciones y generación de acuse',
        Icon: User,
        bannerClass: 'bg-gradient-to-br from-[#00ae6f]/10 to-[#00ae6f]/30',
        bannerIconClass: 'text-[#00ae6f]/80',
        iconBgClass: 'bg-[#00ae6f]/10',
        iconColorClass: 'text-[#00ae6f]/70',
        ctaColorClass: 'text-[#00ae6f]/70',
        hoverBorderClass: 'hover:border-[#00ae6f]/30',
        badgeClass: 'bg-[#00ae6f]/10 text-[#00ae6f]/70 border border-[#00ae6f]/20',
        loadingMessage: 'Cargando tu panel de infracciones...',
    },
    ciudadano: {
        label: 'Ciudadano',
        description: 'Consulta de infracciones y generación de acuse',
        Icon: User,
        bannerClass: 'bg-gradient-to-br from-[#00ae6f]/10 to-[#00ae6f]/30',
        bannerIconClass: 'text-[#00ae6f]/80',
        iconBgClass: 'bg-[#00ae6f]/10',
        iconColorClass: 'text-[#00ae6f]/70',
        ctaColorClass: 'text-[#00ae6f]/70',
        hoverBorderClass: 'hover:border-[#00ae6f]/30',
        badgeClass: 'bg-[#00ae6f]/10 text-[#00ae6f]/70 border border-[#00ae6f]/20',
        loadingMessage: 'Cargando tu panel de infracciones...',
    },
    oficial: {
        label: 'Oficial de Policía',
        description: 'Captura y registro de órdenes',
        Icon: ShieldUser,
        bannerClass: 'bg-gradient-to-br from-[#0076aa]/10 to-[#0076aa]/30',
        bannerIconClass: 'text-[#0076aa]/80',
        iconBgClass: 'bg-[#0076aa]/10',
        iconColorClass: 'text-[#0076aa]/70',
        ctaColorClass: 'text-[#0076aa]/70',
        hoverBorderClass: 'hover:border-[#0076aa]/30',
        loadingMessage: 'Cargando panel operativo...',
    },
    infracciones: {
        label: 'Depto. Infracciones',
        description: 'Seguimiento y validación de registros',
        Icon: FileText,
        bannerClass: 'bg-gradient-to-br from-[#faa21b]/10 to-[#faa21b]/30',
        bannerIconClass: 'text-[#faa21b]/80',
        iconBgClass: 'bg-[#faa21b]/10',
        iconColorClass: 'text-[#faa21b]/70',
        ctaColorClass: 'text-[#faa21b]/70',
        hoverBorderClass: 'hover:border-[#faa21b]/30',
        loadingMessage: 'Preparando módulo de Infracciones...',
    },
    liberaciones: {
        label: 'Depto. Liberaciones',
        description: 'Gestión de liberaciones',
        Icon: Unlock,
        bannerClass: 'bg-gradient-to-br from-[#408740]/10 to-[#408740]/30',
        bannerIconClass: 'text-[#408740]/80',
        iconBgClass: 'bg-[#408740]/10',
        iconColorClass: 'text-[#408740]/70',
        ctaColorClass: 'text-[#408740]/70',
        hoverBorderClass: 'hover:border-[#408740]/30',
        loadingMessage: 'Preparando módulo de liberaciones...',
    },
    rev_gral: {
        label: 'Dirección',
        description: 'Vista general y métricas de operación',
        Icon: BarChart2,
        bannerClass: 'bg-gradient-to-br from-[#e67425]/10 to-[#e67425]/30',
        bannerIconClass: 'text-[#e67425]/80',
        iconBgClass: 'bg-[#e67425]/10',
        iconColorClass: 'text-[#e67425]/70',
        ctaColorClass: 'text-[#e67425]/70',
        hoverBorderClass: 'hover:border-[#e67425]/30',
        loadingMessage: 'Cargando métricas y panel general...',
    },
    admin: {
        label: 'Super Administrador',
        description: 'Gestión de usuarios y catálogos del sistema',
        Icon: Settings,
        bannerClass: 'bg-gradient-to-br from-[#df1783]/10 to-[#df1783]/30',
        bannerIconClass: 'text-[#df1783]/80',
        iconBgClass: 'bg-[#df1783]/10',
        iconColorClass: 'text-[#df1783]/70',
        ctaColorClass: 'text-[#df1783]/70',
        hoverBorderClass: 'hover:border-[#df1783]/30',
        loadingMessage: 'Accediendo a configuración del sistema...',
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

// Interfaz para recibir la data directo del Servidor
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
                // Seteamos la cookie local de experiencia de usuario para recordar la selección
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

            <main className="min-h-screen w-full overflow-y-auto bg-slate-50 flex flex-col justify-between">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full max-w-5xl grow flex flex-col justify-center">

                    {/* Header */}
                    <div className={`mb-10 sm:mb-12 text-left transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                            Seleccionar perfil
                        </h1>
                        <p className="text-sm text-slate-500 max-w-md">
                            Elige el perfil con el que deseas trabajar en esta sesión operativa.
                        </p>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {rolesOrdenados.map((rol) => {
                            const isLastUsed = lastRole === rol;
                            const config = ROLE_CONFIG[rol];
                            if (!config) return null;

                            const {
                                label,
                                description,
                                Icon,
                                bannerClass,
                                bannerIconClass,
                                iconBgClass,
                                iconColorClass,
                                ctaColorClass,
                                hoverBorderClass,
                            } = config;

                            const isLoading = loadingRole === rol;
                            const isDisabled = !!loadingRole && !isLoading;

                            return (
                                <button
                                    key={rol}
                                    onClick={() => seleccionarRol(rol)}
                                    disabled={isLoading || isDisabled}
                                    className={`
                                        group w-full text-left rounded-2xl overflow-hidden flex flex-col
                                        bg-white border border-slate-200 shadow-sm
                                        transition-all duration-300 ease-out
                                        hover:-translate-y-1 hover:shadow-md
                                        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400
                                        ${hoverBorderClass}
                                        ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                                        ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                                    `}
                                >
                                    <div className={`relative flex items-center justify-center h-24 w-full overflow-hidden ${bannerClass}`}>
                                        <Icon size={64} strokeWidth={1} className={`${bannerIconClass} opacity-40 transition-transform duration-500 group-hover:scale-105`} aria-hidden="true" />
                                    </div>

                                    <div className="p-5 flex flex-col grow justify-between min-h-[140px]">
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg ${iconBgClass}`}>
                                                        {isLoading ? <Spinner className={iconColorClass} /> : <Icon size={16} strokeWidth={2} className={iconColorClass} />}
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-900 leading-tight truncate">
                                                        {label}
                                                    </span>
                                                </div>

                                                {isLastUsed && (
                                                    <span className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                                                        Último usado
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                {description}
                                            </p>
                                        </div>

                                        <div className={`mt-4 flex items-center gap-1.5 text-[11px] font-medium ${ctaColorClass} opacity-0 -translate-x-1 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0`}>
                                            <span>Continuar como {label}</span>
                                            <ArrowRight size={12} strokeWidth={2} className="animate-pulse" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <footer className="w-full py-6 text-center text-[10px] text-slate-400 border-t border-slate-200/60 bg-white/50 backdrop-blur-sm tracking-wide shrink-0">
                    Sistema Integral de Infracciones · SSPM de San Juan del Río
                </footer>
            </main>
        </>
    );
}