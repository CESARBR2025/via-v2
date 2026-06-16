"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Loader2,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import BuscadorPatrullas from "@/features/oficiales/components/BuscadorPatrullas";

interface Oficial {
  id: string;
  usuarioId: string;
  numeroEmpleado: string;
  nombres: string;
  apellidoP: string;
  apellidoM: string;
  curp: string;
  correo: string;
  telefono: string | null;
  departamentoId: string | null;
  departamentoNombre: string | null;
  rangoId: string | null;
  rangoNombre: string | null;
  patrullaId: string | null;
  patrullaUnidad: string | null;
  sectorId: string | null;
  sectorNombre: string | null;
  fechaIngreso: string | null;
  activo: boolean;
  created_at: string;
}

interface Patrulla {
  id: string;
  numero_unidad: string;
  placas: string;
}

type ModalMode = "create" | "edit" | null;

export default function AdminOficialesPage() {
  const [oficiales, setOficiales] = useState<Oficial[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filtroActivo, setFiltroActivo] = useState<string>("true");
  const [loading, setLoading] = useState(true);
  const [patrullas, setPatrullas] = useState<Patrulla[]>([]);
  const [patrullasLoaded, setPatrullasLoaded] = useState(false);
  const [patrullaManual, setPatrullaManual] = useState({ numeroUnidad: "", placas: "" });
  const [sectores, setSectores] = useState<{ id: string; nombre: string }[]>([]);
  const [departamentos, setDepartamentos] = useState<{ id: string; nombre: string }[]>([]);
  const [rangos, setRangos] = useState<{ id: string; nombre: string }[]>([]);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const hoy = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    curp: "",
    numeroEmpleado: "",
    telefono: "",
    departamentoId: "",
    rangoId: "",
    patrullaId: "",
    sectorId: "",
    fechaIngreso: hoy,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [usuarioEncontrado, setUsuarioEncontrado] = useState<{
    id: string;
    nombreCompleto: string;
    correo: string;
    curp: string;
  } | null>(null);
  const [buscandoUsuario, setBuscandoUsuario] = useState(false);
  const [usuarioVerificado, setUsuarioVerificado] = useState(false);
  const [yaEsOficial, setYaEsOficial] = useState(false);
  const [curpError, setCurpError] = useState("");

  const limit = 20;

  const fetchOficiales = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("activo", filtroActivo);
      params.set("page", String(page));
      params.set("limit", String(limit));

      const res = await fetch(`/api/admin/oficiales?${params}`);
      const json = await res.json();
      if (json.ok) {
        setOficiales(json.data);
        setTotal(json.total);
      }
    } catch {
      setError("Error al cargar oficiales");
    } finally {
      setLoading(false);
    }
  }, [search, filtroActivo, page]);

  const fetchCatalogos = useCallback(async () => {
    try {
      const [pRes, dRes, sRes, rRes] = await Promise.all([
        fetch("/api/admin/oficiales/patrullas"),
        fetch("/api/admin/oficiales/departamentos"),
        fetch("/api/admin/sectores"),
        fetch("/api/admin/oficiales/rangos"),
      ]);
      const pJson = await pRes.json();
      const dJson = await dRes.json();
      const sJson = await sRes.json();
      const rJson = await rRes.json();
      if (pJson.ok) setPatrullas(pJson.data);
      if (dJson.ok) setDepartamentos(dJson.data);
      if (sJson.ok) setSectores(sJson.data.filter((s: any) => s.activo));
      if (rJson.ok) setRangos(rJson.data);
    } catch {
      setPatrullas([]);
    } finally {
      setPatrullasLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchOficiales();
  }, [fetchOficiales]);

  useEffect(() => {
    fetchCatalogos();
  }, [fetchCatalogos]);

  const totalPages = Math.ceil(total / limit);

  const abrirCrear = () => {
    setEditandoId(null);
    const hoy = new Date().toISOString().split("T")[0];
    setFormData({
      curp: "",
      numeroEmpleado: "",
      telefono: "",
      departamentoId: "",
      rangoId: "",
      patrullaId: "",
      sectorId: "",
      fechaIngreso: hoy,
    });
    setError("");
    setCurpError("");
    setUsuarioEncontrado(null);
    setUsuarioVerificado(false);
    setYaEsOficial(false);
    setPatrullaManual({ numeroUnidad: "", placas: "" });
    setModalMode("create");
  };

  const abrirEditar = (oficial: Oficial) => {
    setEditandoId(oficial.id);
    setFormData({
      curp: "",
      numeroEmpleado: oficial.numeroEmpleado,
      telefono: oficial.telefono ?? "",
      departamentoId: oficial.departamentoId ?? "",
      rangoId: oficial.rangoId ?? "",
      patrullaId: oficial.patrullaId ?? "",
      sectorId: oficial.sectorId ?? "",
      fechaIngreso: oficial.fechaIngreso ?? "",
    });
    setError("");
    setModalMode("edit");
  };

  const buscarUsuario = async () => {
    const curp = formData.curp.trim().toUpperCase();
    if (!curp) {
      setCurpError("Ingresa una CURP para buscar");
      return;
    }

    setBuscandoUsuario(true);
    setCurpError("");
    setError("");
    setUsuarioEncontrado(null);
    setUsuarioVerificado(false);
    setYaEsOficial(false);

    try {
      const res = await fetch(`/api/admin/oficiales/buscar-usuario?curp=${encodeURIComponent(curp)}`);
      const json = await res.json();

      if (!json.ok) {
        setCurpError(json.message || "Usuario no encontrado");
        return;
      }

      if (json.yaEsOficial) {
        setCurpError("Este usuario ya está registrado como oficial");
        setYaEsOficial(true);
        setUsuarioEncontrado(json.data);
        return;
      }

      setUsuarioEncontrado(json.data);
      setUsuarioVerificado(true);
    } catch {
      setCurpError("Error al buscar usuario");
    } finally {
      setBuscandoUsuario(false);
    }
  };

  const handleBuscarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscarUsuario();
    }
  };

  const resetBusqueda = () => {
    setUsuarioEncontrado(null);
    setUsuarioVerificado(false);
    setYaEsOficial(false);
    setCurpError("");
    setFormData((prev) => ({ ...prev, curp: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      let patrullaId = formData.patrullaId;

      if (!patrullaId && patrullaManual.numeroUnidad) {
        const pRes = await fetch("/api/admin/oficiales/patrullas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            numero_unidad: patrullaManual.numeroUnidad,
            placas: patrullaManual.placas,
          }),
        });
        const pJson = await pRes.json();
        if (!pJson.ok) {
          setError(pJson.message || "Error al crear la patrulla");
          return;
        }
        patrullaId = pJson.data.id;
      }

      if (modalMode === "create") {
        const res = await fetch("/api/admin/oficiales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, patrullaId }),
        });
        const json = await res.json();
        if (!json.ok) {
          setError(json.message || "Error al crear oficial");
          return;
        }
        setSuccessMsg("Oficial creado correctamente");
      } else if (modalMode === "edit" && editandoId) {
        const payload: Record<string, any> = {};
        if (formData.numeroEmpleado) payload.numeroEmpleado = formData.numeroEmpleado;
        if (formData.telefono) payload.telefono = formData.telefono;
        if (formData.departamentoId) payload.departamentoId = formData.departamentoId;
        payload.rangoId = formData.rangoId || null;
        payload.patrullaId = patrullaId || null;
        payload.sectorId = formData.sectorId || null;
        if (formData.fechaIngreso) payload.fechaIngreso = formData.fechaIngreso;
        payload.activo = undefined;

        const res = await fetch(`/api/admin/oficiales/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.ok) {
          setError(json.message || "Error al actualizar oficial");
          return;
        }
        setSuccessMsg("Oficial actualizado correctamente");
      }

      setModalMode(null);
      fetchOficiales();
      fetchCatalogos();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async (oficial: Oficial) => {
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/admin/oficiales/${oficial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !oficial.activo }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.message || "Error al cambiar estado");
        return;
      }
      setSuccessMsg(
        oficial.activo
          ? "Oficial desactivado correctamente"
          : "Oficial activado correctamente",
      );
      fetchOficiales();
    } catch {
      setError("Error de conexión");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">
            Gestión de Oficiales
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            {total} oficiales registrados
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Nuevo Oficial
        </button>
      </div>

      {/* Success/Error messages */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-[#DCFCE7] text-[#16A34A] text-sm px-4 py-3 rounded-lg">
          <Check size={16} />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-[#FEE2E2] text-[#DC2626] text-sm px-4 py-3 rounded-lg">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Buscar por nombre, CURP o número de empleado..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition-all"
          />
        </div>
        <select
          value={filtroActivo}
          onChange={(e) => {
            setFiltroActivo(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none"
        >
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
          <option value="">Todos</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B] px-4 py-3.5">Oficial</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B] px-4 py-3.5">Departamento</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B] px-4 py-3.5">Rango</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B] px-4 py-3.5">Sector</th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B] px-4 py-3.5">Patrulla</th>
                <th className="text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B] px-4 py-3.5 w-[88px]">Estatus</th>
                <th className="text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B] px-4 py-3.5 w-[80px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Loader2 size={24} className="animate-spin mx-auto text-[#94A3B8]" />
                  </td>
                </tr>
              ) : oficiales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-sm text-[#94A3B8]">
                    No se encontraron oficiales
                  </td>
                </tr>
              ) : (
                oficiales.map((oficial) => {
                  const iniciales = (
                    (oficial.nombres?.[0] ?? "") + (oficial.apellidoP?.[0] ?? "")
                  ).toUpperCase();
                  return (
                    <tr
                      key={oficial.id}
                      className="border-b border-[#F1F5F9] hover:bg-[#FAFBFC] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0 ${
                            oficial.activo
                              ? "bg-[#EFF6FF] text-[#2563EB]"
                              : "bg-[#F1F5F9] text-[#94A3B8]"
                          }`}>
                            {iniciales || "?"}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-[#0F172A] leading-tight truncate max-w-[200px]">
                              {oficial.nombres} {oficial.apellidoP} {oficial.apellidoM}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#94A3B8] mt-0.5">
                              <span className="font-mono">{oficial.curp}</span>
                              <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                              <span>{oficial.numeroEmpleado}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {oficial.departamentoNombre ? (
                          <span className="inline-flex items-center gap-1.5 bg-[#F8FAFC] text-[#475569] text-[12px] font-medium px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                            {oficial.departamentoNombre}
                          </span>
                        ) : (
                          <span className="text-[#CBD5E1]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {oficial.rangoNombre ? (
                          <span className="inline-flex items-center gap-1 bg-[#FFF7ED] text-[#C2410C] text-[12px] font-medium px-2.5 py-1 rounded-md border border-[#FFEDD5]">
                            {oficial.rangoNombre}
                          </span>
                        ) : (
                          <span className="text-[#CBD5E1]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {oficial.sectorNombre ? (
                          <span className="inline-flex items-center gap-1 bg-[#EFF6FF] text-[#2563EB] text-[12px] font-medium px-2.5 py-1 rounded-md border border-[#DBEAFE]">
                            {oficial.sectorNombre}
                          </span>
                        ) : (
                          <span className="text-[#CBD5E1]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {oficial.patrullaUnidad ? (
                          <span className="inline-flex items-center gap-1.5 bg-[#F0FDF4] text-[#16A34A] text-[12px] font-medium px-2.5 py-1 rounded-md border border-[#DCFCE7]">
                            <Shield size={11} strokeWidth={2.5} />
                            {oficial.patrullaUnidad}
                          </span>
                        ) : (
                          <span className="text-[#CBD5E1]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full ${
                          oficial.activo
                            ? "bg-[#DCFCE7] text-[#16A34A]"
                            : "bg-[#FEE2E2] text-[#DC2626]"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            oficial.activo ? "bg-[#16A34A]" : "bg-[#DC2626]"
                          }`} />
                          {oficial.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => abrirEditar(oficial)}
                            className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-[#94A3B8] hover:text-[#2563EB] transition-colors"
                            title="Editar oficial"
                          >
                            <Pencil size={14} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => toggleActivo(oficial)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              oficial.activo
                                ? "hover:bg-[#FEE2E2] text-[#94A3B8] hover:text-[#DC2626]"
                                : "hover:bg-[#DCFCE7] text-[#94A3B8] hover:text-[#16A34A]"
                            }`}
                            title={oficial.activo ? "Desactivar oficial" : "Activar oficial"}
                          >
                            {oficial.activo ? (
                              <Trash2 size={14} strokeWidth={1.5} />
                            ) : (
                              <RotateCcw size={14} strokeWidth={1.5} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            <span className="text-[12px] text-[#64748B] font-medium">
              Página {page} de {totalPages} &middot; {total} registros
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-[#64748B] hover:bg-white hover:border hover:border-[#E2E8F0] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={13} strokeWidth={2} />
                Anterior
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, page - 2);
                  const num = start + i;
                  if (num > totalPages) return null;
                  return (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`w-7 h-7 rounded-lg text-[12px] font-semibold transition-all ${
                        num === page
                          ? "bg-[#2563EB] text-white shadow-sm"
                          : "text-[#64748B] hover:bg-white hover:border hover:border-[#E2E8F0]"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-[#64748B] hover:bg-white hover:border hover:border-[#E2E8F0] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Siguiente
                <ChevronRight size={13} strokeWidth={2} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15),0_8px_20px_rgba(0,0,0,0.08)] w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E2E8F0]">
              <h2 className="text-[16px] font-semibold text-[#0F172A]">
                {modalMode === "create" ? "Nuevo Oficial" : "Editar Oficial"}
              </h2>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#94A3B8] transition-colors"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalMode === "create" && (
                <div>
                  <label className="block text-[12px] font-medium text-[#64748B] mb-1.5">
                    CURP <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      disabled={usuarioVerificado}
                      value={formData.curp}
                      onChange={(e) => {
                        setFormData({ ...formData, curp: e.target.value.toUpperCase() });
                        setCurpError("");
                      }}
                      onKeyDown={handleBuscarKeyDown}
                      placeholder="CURP del oficial"
                      className={`flex-1 px-3 py-2 bg-white border rounded-lg text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-all ${
                        usuarioVerificado
                          ? "border-[#22C55E] bg-[#F0FDF4] cursor-not-allowed"
                          : curpError
                            ? "border-[#EF4444] shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
                            : "border-[#E2E8F0] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)]"
                      } focus:outline-none`}
                    />
                    {!usuarioVerificado ? (
                      <button
                        type="button"
                        onClick={buscarUsuario}
                        disabled={buscandoUsuario || !formData.curp.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] disabled:bg-[#93C5FD] disabled:opacity-60 transition-colors shrink-0"
                      >
                        {buscandoUsuario ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Search size={14} strokeWidth={2} />
                        )}
                        Buscar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={resetBusqueda}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E2E8F0] text-[#64748B] rounded-lg text-sm font-medium hover:bg-[#F8FAFC] transition-colors shrink-0"
                      >
                        <RotateCcw size={14} strokeWidth={2} />
                        Cambiar
                      </button>
                    )}
                  </div>

                  {curpError && (
                    <div className={`flex items-start gap-2 text-sm mt-2 px-3 py-2 rounded-lg ${
                      yaEsOficial
                        ? "bg-[#FEF3C7] text-[#D97706]"
                        : "bg-[#FEE2E2] text-[#DC2626]"
                    }`}>
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      <span>{curpError}</span>
                    </div>
                  )}

                  {usuarioEncontrado && usuarioVerificado && (
                    <div className="flex items-start gap-3 bg-[#F0FDF4] border border-[#22C55E]/30 rounded-lg p-3 mt-2">
                      <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                        <UserCheck size={16} className="text-[#16A34A]" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#0F172A]">
                          {usuarioEncontrado.nombreCompleto}
                        </p>
                        <p className="text-[12px] text-[#64748B]">
                          {usuarioEncontrado.correo}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#64748B] mb-1.5">
                    N° Empleado <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numeroEmpleado}
                    onChange={(e) =>
                      setFormData({ ...formData, numeroEmpleado: e.target.value })
                    }
                    placeholder="Número de empleado"
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#64748B] mb-1.5">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    placeholder="Teléfono"
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#64748B] mb-1.5">
                    Departamento
                  </label>
                  <select
                    value={formData.departamentoId}
                    onChange={(e) =>
                      setFormData({ ...formData, departamentoId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition-all"
                  >
                    <option value="">Seleccionar departamento</option>
                    {departamentos.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#64748B] mb-1.5">
                    Rango
                  </label>
                  <select
                    value={formData.rangoId}
                    onChange={(e) =>
                      setFormData({ ...formData, rangoId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition-all"
                  >
                    <option value="">Seleccionar rango</option>
                    {rangos.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[12px] font-medium text-[#64748B] mb-1.5">
                    Patrulla Asignada
                  </label>
                  <BuscadorPatrullas
                    patrullas={patrullas}
                    patrullasLoaded={patrullasLoaded}
                    value={formData.patrullaId}
                    onChange={(id) => {
                      setFormData({ ...formData, patrullaId: id });
                      setPatrullaManual({ numeroUnidad: "", placas: "" });
                    }}
                    onManualChange={(data) => setPatrullaManual(data)}
                    manualData={patrullaManual}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#64748B] mb-1.5">
                    Sector
                  </label>
                  <select
                    value={formData.sectorId}
                    onChange={(e) =>
                      setFormData({ ...formData, sectorId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition-all"
                  >
                    <option value="">Sin sector</option>
                    {sectores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-[12px] font-medium text-[#64748B] mb-1.5">
                    Fecha de Ingreso
                  </label>
                  <input
                    type="date"
                    value={formData.fechaIngreso}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaIngreso: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-sm font-medium text-[#64748B] bg-white border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || (modalMode === "create" && !usuarioVerificado)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] active:bg-[#1E40AF] disabled:bg-[#93C5FD] disabled:opacity-60 transition-colors"
                >
                  {saving && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  {modalMode === "create" ? "Crear Oficial" : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
