"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

const SEGMENT_LABELS: Record<string, string> = {
  oficiales: "Oficiales",
  captura: "Capturar",
  realizadas: "Realizadas",
  perfil: "Perfil",
  depInfracciones: "Dep. Infracciones",
  depLiberaciones: "Dep. Liberaciones",
  dashboard: "Dashboard",
  admin: "Administración",
  kpis: "KPIs",
  configuracion: "Configuración",
  sectores: "Sectores",
  departamentos: "Departamentos",
  rangos: "Rangos",
  externos: "Externos",
  fiscalia: "Fiscalía",
  juzgadoCivico: "Juzgado Cívico",
  corralonMejia: "Corralón Mejía",
  corralonMW: "Corralón MW",
  test: "Pruebas",
  legal: "Búsqueda Legal",
};

function getSegmentLabel(segment: string): string {
  return SEGMENT_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="hidden md:flex items-center gap-1.5 text-sm min-w-0" aria-label="Breadcrumb">
      <Link
        href="/dashboard"
        className="flex-shrink-0 text-[#64748B] hover:text-[#2563EB] transition-colors"
        aria-label="Inicio"
      >
        <Home size={16} strokeWidth={1.5} />
      </Link>

      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label = getSegmentLabel(segment);
        const isLast = index === segments.length - 1;

        return (
          <span key={href} className="flex items-center gap-1.5 min-w-0">
            <ChevronRight size={14} className="text-[#94A3B8] flex-shrink-0" strokeWidth={1.5} />
            {isLast ? (
              <span className="font-semibold text-[#0F172A] truncate">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="text-[#64748B] hover:text-[#2563EB] transition-colors truncate whitespace-nowrap"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
