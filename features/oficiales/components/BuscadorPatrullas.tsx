"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Shield, Loader2 } from "lucide-react";

interface Patrulla {
  id: string;
  numero_unidad: string;
  placas: string;
  num_serie?: string;
  marca?: string;
  modelo?: string;
  color?: string;
  tipo_vehiculo?: string;
  secretaria?: string;
}

interface Props {
  patrullas: Patrulla[];
  patrullasLoaded: boolean;
  value: string;
  onChange: (id: string) => void;
  onManualChange: (data: { numeroUnidad: string; placas: string }) => void;
  manualData: { numeroUnidad: string; placas: string };
  disabled?: boolean;
}

export default function BuscadorPatrullas({
  patrullas,
  patrullasLoaded,
  value,
  onChange,
  onManualChange,
  manualData,
  disabled,
}: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const seleccionada = patrullas.find((p) => p.id === value);

  const filtradas = busqueda.trim()
    ? patrullas.filter(
      (p) =>
        p.numero_unidad.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.placas.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.marca && p.marca.toLowerCase().includes(busqueda.toLowerCase())) ||
        (p.num_serie && p.num_serie.toLowerCase().includes(busqueda.toLowerCase())),
    )
    : patrullas;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setMostrar(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const limpiar = () => {
    onChange("");
    setBusqueda("");
  };

  if (!patrullasLoaded) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#94A3B8]">
        <Loader2 size={14} className="animate-spin" />
        Cargando patrullas...
      </div>
    );
  }

  if (patrullas.length === 0) {
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={manualData.numeroUnidad}
          disabled={disabled}
          onChange={(e) => onManualChange({ ...manualData, numeroUnidad: e.target.value })}
          placeholder="N° de unidad"
          className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition-all"
        />
        <input
          type="text"
          value={manualData.placas}
          disabled={disabled}
          onChange={(e) => onManualChange({ ...manualData, placas: e.target.value })}
          placeholder="Placas (opcional)"
          className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition-all"
        />
        <p className="text-[11px] text-[#94A3B8]">
          Servicio de flota no disponible. Ingresa los datos manualmente.
        </p>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      {seleccionada ? (
        <div>
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F0FDF4] border border-[#22C55E]/40 rounded-lg">
            <Shield size={14} className="text-[#16A34A] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0F172A] truncate">
                {seleccionada.numero_unidad}
              </p>
              <p className="text-[11px] text-[#64748B]">
                {[seleccionada.marca, seleccionada.modelo, seleccionada.tipo_vehiculo]
                  .filter(Boolean)
                  .join(" · ") || seleccionada.placas}
              </p>
            </div>
            <button
              type="button"
              onClick={limpiar}
              className="p-1 rounded hover:bg-[#DCFCE7] text-[#94A3B8] hover:text-[#DC2626] transition-colors"
            >
              <X size={14} />
            </button>
          </div>


        </div>
      ) : (
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
          />
          <input
            type="text"
            value={busqueda}
            disabled={disabled}
            placeholder="Buscar por placa, unidad, marca o serie..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition-all"
            onFocus={() => setMostrar(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIdx((prev) =>
                  prev < filtradas.length - 1 ? prev + 1 : 0,
                );
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIdx((prev) =>
                  prev > 0 ? prev - 1 : filtradas.length - 1,
                );
              } else if (e.key === "Enter" && activeIdx >= 0) {
                e.preventDefault();
                const sel = filtradas[activeIdx];
                if (sel) {
                  onChange(sel.id);
                  setBusqueda("");
                  setMostrar(false);
                }
              } else if (e.key === "Escape") {
                setMostrar(false);
              }
            }}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setMostrar(true);
              setActiveIdx(-1);
            }}
          />

          {mostrar && filtradas.length > 0 && (
            <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white shadow-lg">
              {filtradas.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  ref={
                    i === activeIdx
                      ? (el) => el?.scrollIntoView({ block: "nearest" })
                      : undefined
                  }
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors ${i === activeIdx ? "bg-[#EFF6FF]" : "hover:bg-[#F8FAFC]"
                    }`}
                  onClick={() => {
                    onChange(p.id);
                    setBusqueda("");
                    setMostrar(false);
                  }}
                >
                  <Shield
                    size={14}
                    className="mt-0.5 shrink-0 text-[#94A3B8]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#0F172A] truncate">
                      {p.numero_unidad}
                    </p>
                    <p className="text-[11px] text-[#64748B] truncate">
                      {[p.marca, p.modelo, p.tipo_vehiculo, p.color]
                        .filter(Boolean)
                        .join(" · ")}{" "}
                      {p.placas !== "—" && (
                        <span className="font-mono text-[#2563EB]">
                          ({p.placas})
                        </span>
                      )}
                    </p>
                  </div>
                  {i === activeIdx && (
                    <span className="text-[10px] font-medium text-[#2563EB] shrink-0 mt-0.5">
                      ↵
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {mostrar && busqueda.trim() && filtradas.length === 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white shadow-lg">
              <div className="px-3 py-4 text-center text-sm text-[#94A3B8]">
                No se encontraron patrullas con "{busqueda}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
