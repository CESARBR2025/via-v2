"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  X,
  Check,
  AlertCircle,
  Loader2,
  RotateCcw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Save,
} from "lucide-react";
import { useToastStore } from "@/stores/useToastStore";

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Usuario {
  id: string;
  cus_id: string;
  curp: string;
  nombres: string;
  apellido_p: string;
  apellido_m: string;
  correo: string;
  correo_sec: string | null;
  activo: boolean;
  creado_en: string;
  roles: Rol[];
}

export default function AdminUsuariosPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filtroActivo, setFiltroActivo] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [rolesDisponibles, setRolesDisponibles] = useState<Rol[]>([]);

  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const limit = 20;

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filtroActivo) params.set("activo", filtroActivo);
      params.set("page", String(page));
      params.set("limit", String(limit));

      const res = await fetch(`/api/admin/usuarios?${params}`);
      const json = await res.json();
      if (json.ok) {
        setUsuarios(json.data);
        setTotal(json.total);
      }
    } catch {
      addToast("Error al cargar usuarios", "error");
    } finally {
      setLoading(false);
    }
  }, [search, filtroActivo, page]);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/roles");
      const json = await res.json();
      if (json.ok) setRolesDisponibles(json.data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const totalPages = Math.ceil(total / limit);

  const abrirAsignarRoles = (user: Usuario) => {
    setSelectedUser(user);
    setSelectedRoleIds(user.roles.map((r) => r.id));
  };

  const toggleRol = (rolId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(rolId)
        ? prev.filter((id) => id !== rolId)
        : [...prev, rolId],
    );
  };

  const guardarRoles = async () => {
    if (!selectedUser) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/usuarios/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: selectedRoleIds }),
      });
      const json = await res.json();
      if (!json.ok) {
        addToast(json.message || "Error al guardar roles", "error");
        return;
      }
      addToast("Roles actualizados correctamente", "success");
      setSelectedUser(null);
      fetchUsuarios();
    } catch {
      addToast("Error de conexión", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async (usuario: Usuario) => {
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: usuario.id, activo: !usuario.activo }),
      });
      const json = await res.json();
      if (!json.ok) {
        addToast(json.message || "Error al cambiar estado", "error");
        return;
      }
      addToast(
        usuario.activo
          ? "Usuario desactivado correctamente"
          : "Usuario activado correctamente",
        "success",
      );
      fetchUsuarios();
    } catch {
      addToast("Error de conexión", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-slate-900 tracking-tight">
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {total} usuarios registrados
          </p>
        </div>
      </div>

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
            placeholder="Buscar por nombre, CURP o correo..."
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
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-slate-600 px-4 py-3.5">Usuario</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-slate-600 px-4 py-3.5">CURP</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-slate-600 px-4 py-3.5">Roles</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-slate-600 px-4 py-3.5">Registro</th>
                <th className="text-center text-[11px] font-medium uppercase tracking-wider text-slate-600 px-4 py-3.5 w-[88px]">Estatus</th>
                <th className="text-center text-[11px] font-medium uppercase tracking-wider text-slate-600 px-4 py-3.5 w-[100px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Loader2 size={24} className="animate-spin mx-auto text-slate-400" />
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-sm text-slate-400">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => {
                  const iniciales = (
                    (usuario.nombres?.[0] ?? "") + (usuario.apellido_p?.[0] ?? "")
                  ).toUpperCase();
                  return (
                    <tr
                      key={usuario.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 ${
                              usuario.activo
                                ? "bg-blue-50 text-blue-700"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {iniciales || "?"}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-medium text-slate-900 leading-tight truncate max-w-[200px]">
                              {usuario.nombres} {usuario.apellido_p} {usuario.apellido_m}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                              {usuario.correo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[12px] text-slate-700">
                          {usuario.curp}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {usuario.roles.length > 0 ? (
                            usuario.roles.map((rol) => (
                              <span
                                key={rol.id}
                                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-blue-200"
                              >
                                {rol.nombre}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400">Sin rol</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[12px] text-slate-500">
                          {new Date(usuario.creado_en).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            usuario.activo
                              ? "bg-green-50 text-green-800"
                              : "bg-red-50 text-red-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              usuario.activo ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          {usuario.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => abrirAsignarRoles(usuario)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-700 transition-colors"
                            title="Asignar roles"
                          >
                            <Shield size={14} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => toggleActivo(usuario)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              usuario.activo
                                ? "hover:bg-red-50 text-slate-400 hover:text-red-600"
                                : "hover:bg-green-50 text-slate-400 hover:text-green-600"
                            }`}
                            title={usuario.activo ? "Desactivar usuario" : "Activar usuario"}
                          >
                            {usuario.activo ? (
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

      {/* Assign Roles Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-[16px] font-medium text-slate-900">
                  Asignar Roles
                </h2>
                <p className="text-[13px] text-slate-500 mt-1">
                  {selectedUser.nombres} {selectedUser.apellido_p} {selectedUser.apellido_m}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-[12px] text-slate-500 font-medium uppercase tracking-wider">
                Roles disponibles
              </p>

              <div className="space-y-2">
                {rolesDisponibles.map((rol) => {
                  const isSelected = selectedRoleIds.includes(rol.id);
                  return (
                    <button
                      key={rol.id}
                      type="button"
                      onClick={() => toggleRol(rol.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        isSelected
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "bg-blue-700 border-blue-700"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected && (
                          <Check size={12} className="text-white" strokeWidth={3} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-slate-900">
                          {rol.nombre}
                        </div>
                        {rol.descripcion && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {rol.descripcion}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-transparent text-slate-600 text-[13px] font-normal rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={guardarRoles}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 active:bg-blue-900 disabled:bg-blue-200 disabled:text-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                  {saving && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  <Save size={14} strokeWidth={2} />
                  Guardar Roles
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
