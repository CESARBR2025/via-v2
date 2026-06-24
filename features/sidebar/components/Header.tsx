"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Plus, Search, FileText, Car, Command, CornerDownLeft, X } from "lucide-react";
import { useSidebarStore } from "@/stores/sideBarStore";
import { useGlobalDetailStore } from "@/stores/useGlobalDetailStore";
import UserAvatarDropdown from "./UserAvatarDropdown";
import Breadcrumbs from "./Breadcrumbs";

const PAGE_TITLES: Record<string, string> = {
  "/oficiales/dashboard": "Dashboard",
  "/oficiales/captura": "Capturar Infracción",
  "/oficiales/capturar": "Capturar Infracción",
  "/oficiales/realizadas": "Infracciones Realizadas",
  "/oficiales/perfil": "Mi Perfil",
  "/depInfracciones/dashboard": "Consultar Infracciones",
  "/dashboard": "Dashboard",
};

const getPageTitle = (path: string): string => {
  if (PAGE_TITLES[path]) return PAGE_TITLES[path];
  const match = Object.entries(PAGE_TITLES).find(([key]) =>
    path.startsWith(key)
  );
  return match ? match[1] : "Panel Principal";
};

type Props = {
  userName: string;
  userRole: string;
  roleKey: string;
  allRoles?: string[];
};

type ContextualAction = {
  label: string;
  href: string;
  icon: typeof Plus;
};

function getContextualAction(role: string, path: string): ContextualAction | null {
  if (role === "oficial" && !path.startsWith("/oficiales/captura")) {
    return { label: "Nueva Infracción", href: "/oficiales/captura", icon: Plus };
  }
  return null;
}

type SearchResult = {
  id: string
  folio: string
  placa: string | null
  nombre_infractor: string | null
}

export default function Header({ userName, userRole, roleKey, allRoles }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const toggleMobile = useSidebarStore((s) => s.toggleMobile);
  const setSelectedInfraccionId = useGlobalDetailStore((s) => s.setSelectedInfraccionId);

  const title = getPageTitle(pathname);
  const action = getContextualAction(roleKey, pathname);

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const fetchIdRef = useRef(0)

  const isMac = typeof navigator !== 'undefined' && navigator.platform.startsWith('Mac')

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (!isOpen) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex(i => Math.min(i + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex(i => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && focusedIndex >= 0 && results[focusedIndex]) {
        e.preventDefault()
        const row = results[focusedIndex]
        setSelectedInfraccionId(row.id)
        setIsOpen(false)
        setQuery('')
        setResults([])
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, results, focusedIndex, setSelectedInfraccionId])

  useEffect(() => {
    const q = query.trim()
    if (!q || q.length < 2) {
      Promise.resolve().then(() => { setResults([]); setFocusedIndex(-1) })
      return
    }

    const id = ++fetchIdRef.current
    Promise.resolve().then(() => setIsFetching(true))

    fetch(`/api/infracciones/buscar?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then((json: any) => {
        if (id !== fetchIdRef.current) return
        const data: SearchResult[] = (json.data ?? []).map((row: any) => ({
          id: row.id,
          folio: row.folio ?? '—',
          placa: row.placa ?? null,
          nombre_infractor: row.nombre_infractor ?? null,
        }))
        setResults(data)
        setFocusedIndex(-1)
        setIsOpen(true)
      })
      .catch(() => {})
      .finally(() => setIsFetching(false))
  }, [query])

  return (
    <header className="
      h-16 border-b border-slate-200
      bg-white
      px-4 md:px-6
      flex items-center justify-between
      gap-4
    ">

      {/* LEFT — mobile: hamburger + title / desktop: breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleMobile}
          className="
            md:hidden
            w-9 h-9 rounded-lg
            hover:bg-slate-50
            flex items-center justify-center
            text-slate-600 hover:text-slate-900
            transition-colors duration-200
          "
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        <div className="md:hidden h-6 w-px bg-slate-200" />

        <h1 className="
          md:hidden
          text-[22px] font-medium leading-tight text-slate-900
          truncate
        ">
          {title}
        </h1>

        <Breadcrumbs />
      </div>

      {/* CENTER — global search (solo roles que gestionan infracciones) */}
      {!['corralon_mw', 'corralon_mejia'].includes(roleKey) && (
      <div ref={searchRef} className="relative hidden sm:block flex-1 max-w-lg mx-4">
        <div
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border bg-white
            transition-all duration-200
            ${isOpen
              ? 'border-blue-700 ring-2 ring-blue-700/10 shadow-sm'
              : 'border-slate-200 hover:border-slate-300'
            }
          `}
        >
          <Search size={15} strokeWidth={1.8} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setFocusedIndex(-1) }}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="Buscar infracción por placa o folio..."
            className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
              className="shrink-0 p-0.5 rounded text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          )}
          {isFetching && (
            <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-200 border-t-blue-700 animate-spin shrink-0" />
          )}
          {!query && !isFetching && (
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 shrink-0">
              {isMac ? <Command size={10} strokeWidth={1.5} /> : 'Ctrl'}
              <span>K</span>
            </kbd>
          )}
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-modal overflow-hidden z-50 animate-[fadeIn_0.15s_ease-out]">
            {results.length === 0 && query.trim().length >= 2 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Search size={22} strokeWidth={1.5} className="text-slate-300" />
                <p className="text-sm font-medium text-slate-400">Sin resultados</p>
                <p className="text-xs text-slate-300">No se encontraron infracciones con &quot;{query.trim()}&quot;</p>
              </div>
            )}

            {results.length > 0 && (
              <>
                <div className="px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                  {results.length} resultado{results.length !== 1 ? 's' : ''}
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {results.map((row, i) => (
                    <button
                      key={row.id}
                      onMouseDown={() => { setSelectedInfraccionId(row.id); setIsOpen(false); setQuery(''); setResults([]) }}
                      onMouseEnter={() => setFocusedIndex(i)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 text-left
                        transition-colors duration-100
                        border-b border-slate-50 last:border-0
                        ${i === focusedIndex ? 'bg-blue-50' : 'hover:bg-slate-50'}
                      `}
                    >
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                        ${i === focusedIndex ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}
                      `}>
                        <FileText size={13} strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900 font-mono tracking-wide">{row.folio}</span>
                          {row.placa && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              <Car size={9} strokeWidth={1.5} />
                              {row.placa}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {row.nombre_infractor || 'Sin nombre registrado'}
                        </p>
                      </div>
                      <div className={`
                        shrink-0 flex items-center gap-1 text-[10px] font-medium
                        ${i === focusedIndex ? 'text-blue-600' : 'text-slate-300'}
                      `}>
                        <span className="hidden sm:inline">Abrir</span>
                        <CornerDownLeft size={11} strokeWidth={1.5} />
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2 text-[10px] text-slate-400 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span>Navega con ↑ ↓</span>
                  <span>Enter para abrir · Esc para cerrar</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      )}

      {/* RIGHT — contextual action + user avatar */}
      <div className="flex items-center gap-1">
        {action && (
          <button
            type="button"
            onClick={() => router.push(action.href)}
            className="
              hidden sm:inline-flex items-center gap-2
              px-4 py-2
              rounded-lg border-none
              bg-blue-700
              text-white text-[13px] font-medium
              hover:bg-blue-800 active:bg-blue-900 active:scale-[0.99]
              transition-colors duration-150
            "
          >
            <action.icon size={16} strokeWidth={2} />
            <span className="hidden lg:inline">{action.label}</span>
          </button>
        )}

        {action && <div className="h-6 w-px bg-slate-200 mx-1" />}

        <UserAvatarDropdown
            userName={userName}
            userRole={userRole}
            allRoles={allRoles ?? [roleKey]}
            activeRole={roleKey}
        />
      </div>

    </header>
  );
}
