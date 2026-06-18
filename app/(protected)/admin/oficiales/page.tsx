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
          <h1 className="text-[22px] font-medium text-slate-900 tracking-tight">
            Gestión de Oficiales
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {total} oficiales registrados
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-blue-800 active:bg-blue-900 transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Nuevo Oficial
        </button>
      </div>

      {/* Success/Error messages */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">
          <Check size={16} />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-all"
          />
        </div>
        <select
          value={filtroActivo}
          onChange={(e) => {
            setFiltroActivo(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
        >
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
          <option value="">Todos</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-slate-600 px-4 py-3.5">Oficial</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-slate-600 px-4 py-3.5">Departamento</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-slate-600 px-4 py-3.5">Rango</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-slate-600 px-4 py-3.5">Sector</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-slate-600 px-4 py-3.5">Patrulla</th>
                <th className="text-center text-[11px] font-medium uppercase tracking-wider text-slate-600 px-4 py-3.5 w-[88px]">Estatus</th>
                <th className="text-center text-[11px] font-medium uppercase tracking-wider text-slate-600 px-4 py-3.5 w-[80px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Loader2 size={24} className="animate-spin mx-auto text-slate-400" />
                  </td>
                </tr>
              ) : oficiales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-sm text-slate-400">
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
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 ${
                            oficial.activo
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-400"
                          }`}>
                            {iniciales || "?"}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-medium text-slate-900 leading-tight truncate max-w-[200px]">
                              {oficial.nombres} {oficial.apellidoP} {oficial.apellidoM}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="font-mono">{oficial.curp}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span>{oficial.numeroEmpleado}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {oficial.departamentoNombre ? (
                          <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 text-[12px] font-medium px-2.5 py-1 rounded-md border border-slate-200">
                            {oficial.departamentoNombre}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {oficial.rangoNombre ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[12px] font-medium px-2.5 py-1 rounded-md border border-amber-200">
                            {oficial.rangoNombre}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {oficial.sectorNombre ? (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[12px] font-medium px-2.5 py-1 rounded-md border border-blue-200">
                            {oficial.sectorNombre}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {oficial.patrullaUnidad ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-[12px] font-medium px-2.5 py-1 rounded-md border border-green-200">
                            <Shield size={11} strokeWidth={2.5} />
                            {oficial.patrullaUnidad}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          oficial.activo
                            ? "bg-green-50 text-green-800"
                            : "bg-red-50 text-red-800"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            oficial.activo ? "bg-green-500" : "bg-red-500"
                          }`} />
                          {oficial.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => abrirEditar(oficial)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-700 transition-colors"
                            title="Editar oficial"
                          >
                            <Pencil size={14} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => toggleActivo(oficial)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              oficial.activo
                                ? "hover:bg-red-50 text-slate-400 hover:text-red-600"
                                : "hover:bg-green-50 text-slate-400 hover:text-green-600"
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
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
            <span className="text-[12px] text-slate-600 font-medium">
              Página {page} de {totalPages} &middot; {total} registros
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-slate-600 hover:bg-white hover:border hover:border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                      className={`w-7 h-7 rounded-lg text-[12px] font-medium transition-all ${
                        num === page
                          ? "bg-blue-700 text-white shadow-sm"
                          : "text-slate-600 hover:bg-white hover:border hover:border-slate-200"
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
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-slate-600 hover:bg-white hover:border hover:border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200">
              <h2 className="text-[16px] font-medium text-slate-900">
                {modalMode === "create" ? "Nuevo Oficial" : "Editar Oficial"}
              </h2>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalMode === "create" && (
                <div>
                  <label className="block text-[12px] font-medium text-slate-600 mb-1.5">
                    CURP <span className="text-red-500">*</span>
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
                      className={`flex-1 px-3 py-2 bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 transition-all ${
                        usuarioVerificado
                          ? "border-green-500 bg-green-50 cursor-not-allowed"
                          : curpError
                            ? "border-red-500 ring-2 ring-red-500/10"
                            : "border-slate-200 focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
                      } focus:outline-none`}
                    />
                    {!usuarioVerificado ? (
                      <button
                        type="button"
                        onClick={buscarUsuario}
                        disabled={buscandoUsuario || !formData.curp.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white text-[13px] font-medium rounded-lg hover:bg-blue-800 disabled:bg-blue-200 disabled:text-blue-300 disabled:cursor-not-allowed transition-colors shrink-0"
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
                        className="flex items-center gap-1.5 px-4 py-2 bg-transparent text-slate-600 text-[13px] font-normal rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shrink-0"
                      >
                        <RotateCcw size={14} strokeWidth={2} />
                        Cambiar
                      </button>
                    )}
                  </div>

                  {curpError && (
                    <div className={`flex items-start gap-2 text-sm mt-2 px-3 py-2 rounded-lg ${
                      yaEsOficial
                        ? "bg-amber-50 text-amber-800"
                        : "bg-red-50 text-red-800"
                    }`}>
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      <span>{curpError}</span>
                    </div>
                  )}

                  {usuarioEncontrado && usuarioVerificado && (
                    <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <UserCheck size={16} className="text-green-600" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {usuarioEncontrado.nombreCompleto}
                        </p>
                        <p className="text-[12px] text-slate-600">
                          {usuarioEncontrado.correo}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-slate-600 mb-1.5">
                    N° Empleado <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numeroEmpleado}
                    onChange={(e) =>
                      setFormData({ ...formData, numeroEmpleado: e.target.value })
                    }
                    placeholder="Número de empleado"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-slate-600 mb-1.5">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    placeholder="Teléfono"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-slate-600 mb-1.5">
                    Departamento
                  </label>
                  <select
                    value={formData.departamentoId}
                    onChange={(e) =>
                      setFormData({ ...formData, departamentoId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-all"
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
                  <label className="block text-[12px] font-medium text-slate-600 mb-1.5">
                    Rango
                  </label>
                  <select
                    value={formData.rangoId}
                    onChange={(e) =>
                      setFormData({ ...formData, rangoId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-all"
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
                  <label className="block text-[12px] font-medium text-slate-600 mb-1.5">
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
                  <label className="block text-[12px] font-medium text-slate-600 mb-1.5">
                    Sector
                  </label>
                  <select
                    value={formData.sectorId}
                    onChange={(e) =>
                      setFormData({ ...formData, sectorId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-all"
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
                  <label className="block text-[12px] font-medium text-slate-600 mb-1.5">
                    Fecha de Ingreso
                  </label>
                  <input
                    type="date"
                    value={formData.fechaIngreso}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaIngreso: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 bg-transparent text-slate-600 text-[13px] font-normal rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || (modalMode === "create" && !usuarioVerificado)}
                  className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 active:bg-blue-900 disabled:bg-blue-200 disabled:text-blue-300 disabled:cursor-not-allowed transition-colors"
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
