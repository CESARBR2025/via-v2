"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, Car, FileText, MapPin } from "lucide-react";

import type { InfraccionPublica } from "@/features/buscadorGlobal/types";

export default function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InfraccionPublica[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // ─── ⌘K global shortcut ────────────────────────────────────────

  useEffect(() => {
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // ─── Focus input when opened ────────────────────────────────────

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQuery("");
      setResults([]);
      setError(null);
      setSelectedIndex(-1);
    }
  }, [open]);

  // ─── Close on outside click ─────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // ─── Debounced search ───────────────────────────────────────────

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/buscadorGlobal?placa=${encodeURIComponent(q)}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Error al buscar");
      }
      const data = await res.json();
      setResults(data.infracciones ?? []);
      setSelectedIndex(-1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al buscar");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  // ─── Keyboard navigation ────────────────────────────────────────

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : results.length - 1
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const item = results[selectedIndex];
      handleSelect(item);
    }
  }

  function handleSelect(item: InfraccionPublica) {
    setOpen(false);
    const base =
      typeof window !== "undefined"
        ? window.location.pathname.startsWith("/oficiales")
          ? "/oficiales"
          : "/depInfracciones"
        : "/depInfracciones";
    router.push(`${base}/dashboard?folio=${item.folio}`);
  }

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <>
      {/* TRIGGER */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          flex items-center gap-2
          w-full max-w-[240px] lg:max-w-[320px]
          h-9 px-3
          rounded-lg
          border border-[#E2E8F0]
          bg-white
          text-sm text-[#94A3B8]
          hover:border-[#CBD5E1] hover:text-[#64748B]
          focus-visible:outline-none focus-visible:border-[#2563EB]
          focus-visible:shadow-[0_0_0_3px_rgba(37,99,235,0.15)]
          transition-all duration-150
        "
      >
        <Search size={15} strokeWidth={1.5} className="flex-shrink-0" />
        <span className="flex-1 text-left truncate hidden sm:inline">
          Buscar por placa...
        </span>
        <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#F1F5F9] text-[11px] font-medium text-[#64748B]">
          <span className="text-[10px]">⌘</span>K
        </span>
      </button>

      {/* OVERLAY */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Panel */}
          <div
            ref={overlayRef}
            className="
              relative w-full max-w-[580px] mx-4
              rounded-xl
              bg-white
              border border-[#E2E8F0]
              shadow-[0_20px_60px_rgba(0,0,0,0.15),0_8px_20px_rgba(0,0,0,0.08)]
              overflow-hidden
            "
          >
            {/* INPUT */}
            <div className="flex items-center gap-3 px-4 h-12 border-b border-[#E2E8F0]">
              <Search
                size={18}
                strokeWidth={1.5}
                className="flex-shrink-0 text-[#94A3B8]"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="Buscar por placa... (ej. ABC-123)"
                className="
                  flex-1 text-sm text-[#0F172A] placeholder:text-[#94A3B8]
                  bg-transparent
                  border-none outline-none
                "
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="flex-shrink-0 p-1 rounded-md hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#64748B] transition-colors"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* RESULTS */}
            <div className="max-h-[360px] overflow-y-auto p-2">
              {loading && (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#64748B]">
                  <Loader2
                    size={18}
                    className="animate-spin text-[#2563EB]"
                    strokeWidth={2}
                  />
                  Buscando...
                </div>
              )}

              {error && (
                <div className="py-6 text-center text-sm text-[#EF4444]">
                  {error}
                </div>
              )}

              {!loading && !error && query.length >= 2 && results.length === 0 && (
                <div className="py-6 text-center text-sm text-[#64748B]">
                  No se encontraron resultados para{" "}
                  <span className="font-medium text-[#0F172A]">{query}</span>
                </div>
              )}

              {!loading && !error && results.length > 0 && (
                <ul className="space-y-0.5">
                  {results.map((item, index) => (
                    <li key={item.infraccion_id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`
                          w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left
                          transition-colors duration-100
                          ${
                            index === selectedIndex
                              ? "bg-[#EFF6FF]"
                              : "hover:bg-[#F8FAFC]"
                          }
                        `}
                      >
                        <div
                          className={`
                            flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                            ${
                              index === selectedIndex
                                ? "bg-[#2563EB] text-white"
                                : "bg-[#F1F5F9] text-[#64748B]"
                            }
                            transition-colors duration-100
                          `}
                        >
                          <Car size={15} strokeWidth={1.5} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[14px] text-[#0F172A]">
                              {item.placa}
                            </span>
                            <span className="text-[12px] text-[#64748B] font-mono">
                              #{item.folio}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[12px] text-[#64748B]">
                            <span className="truncate">{item.articulo}</span>
                            {item.calle && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-[#CBD5E1] flex-shrink-0" />
                                <span className="truncate">{item.calle}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!loading && !error && query.length < 2 && (
                <div className="py-6 text-center text-sm text-[#94A3B8]">
                  Escribe al menos 2 caracteres para buscar
                </div>
              )}
            </div>

            {/* FOOTER HINT */}
            <div className="flex items-center justify-between px-4 h-8 border-t border-[#E2E8F0] bg-[#F8FAFC]">
              <span className="text-[11px] text-[#94A3B8]">
                <kbd className="px-1 py-0.5 rounded bg-white border border-[#E2E8F0] text-[10px] font-mono text-[#64748B] mr-1">
                  ↑↓
                </kbd>
                Navegar
                <kbd className="px-1 py-0.5 rounded bg-white border border-[#E2E8F0] text-[10px] font-mono text-[#64748B] mx-1">
                  ↵
                </kbd>
                Abrir
                <kbd className="px-1 py-0.5 rounded bg-white border border-[#E2E8F0] text-[10px] font-mono text-[#64748B] mx-1">
                  Esc
                </kbd>
                Cerrar
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
