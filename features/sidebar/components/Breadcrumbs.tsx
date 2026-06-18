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

const VALID_PAGES = new Set([
  "/oficiales/dashboard",
  "/oficiales/captura",
  "/oficiales/realizadas",
  "/oficiales/perfil",
  "/admin/dashboard",
  "/admin/kpis",
  "/admin/oficiales",
  "/admin/configuracion",
  "/admin/sectores",
  "/admin/departamentos",
  "/admin/rangos",
  "/depInfracciones/dashboard",
  "/depLiberaciones/dashboard",
  "/externos/fiscalia/dashboard",
  "/externos/juzgadoCivico/dashboard",
  "/externos/corralonMejia/dashboard",
  "/externos/corralonMW/dashboard",
  "/test/legal",
]);

const PARENT_REDIRECTS: Record<string, string> = {
  "/oficiales": "/oficiales/dashboard",
  "/admin": "/admin/dashboard",
  "/depInfracciones": "/depInfracciones/dashboard",
  "/depLiberaciones": "/depLiberaciones/dashboard",
  "/externos/fiscalia": "/externos/fiscalia/dashboard",
  "/externos/juzgadoCivico": "/externos/juzgadoCivico/dashboard",
  "/externos/corralonMejia": "/externos/corralonMejia/dashboard",
  "/externos/corralonMW": "/externos/corralonMW/dashboard",
};

function getSegmentLabel(segment: string): string {
  return SEGMENT_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}

function resolveHref(segments: string[], index: number): string {
  const href = "/" + segments.slice(0, index + 1).join("/");
  if (VALID_PAGES.has(href)) return href;
  return PARENT_REDIRECTS[href] || href;
}

function isClickable(href: string): boolean {
  return VALID_PAGES.has(href) || !!PARENT_REDIRECTS[href];
}

function getHomeHref(segments: string[]): string {
  if (segments.length === 0) return "/admin/dashboard";
  const parent = "/" + segments[0];
  return PARENT_REDIRECTS[parent] || "/admin/dashboard";
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="hidden md:flex items-center gap-1.5 text-sm min-w-0" aria-label="Breadcrumb">
      <Link
        href={getHomeHref(segments)}
        className="flex-shrink-0 text-slate-600 hover:text-blue-700 transition-colors"
        aria-label="Inicio"
      >
        <Home size={16} strokeWidth={1.5} />
      </Link>

      {segments.map((segment, index) => {
        const href = resolveHref(segments, index);
        const label = getSegmentLabel(segment);
        const isLast = index === segments.length - 1;

        return (
          <span key={href} className="flex items-center gap-1.5 min-w-0">
            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" strokeWidth={1.5} />
            {isLast || !isClickable(href) ? (
              <span className={`
                truncate
                ${isLast ? "font-medium text-slate-900" : "text-slate-600"}
              `}>
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="text-slate-600 hover:text-blue-700 transition-colors truncate whitespace-nowrap"
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
