"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Check,
  X,
  AlertCircle,
  Loader2,
  Save,
  Lock,
  Unlock,
  RotateCcw,
  Trash2,
  Plus,
} from "lucide-react";
import { useToastStore } from "@/stores/useToastStore";

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

interface PermisoAgrupado {
  modulo: string;
  permisos: {
    id: string;
    accion: string;
    descripcion: string;
  }[];
}

export default function AdminRolesPermisosPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisosAgrupados, setPermisosAgrupados] = useState<PermisoAgrupado[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [rolePermisos, setRolePermisos] = useState<string[]>([]);
  const [selectedPermisos, setSelectedPermisos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPermisos, setLoadingPermisos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [modalError, setModalError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRol, setNewRol] = useState({ nombre: "", descripcion: "" });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/roles");
      const json = await res.json();
      if (json.ok) setRoles(json.data);
    } catch {
      addToast("Error al cargar roles", "error");
    }
  }, [addToast]);

  const fetchPermisos = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/permisos");
      const json = await res.json();
      if (json.ok) setPermisosAgrupados(json.data);
    } catch {
      addToast("Error al cargar permisos", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchRolePermisos = useCallback(async (roleId: string) => {
    setLoadingPermisos(true);
    try {
      const res = await fetch(`/api/admin/roles/${roleId}`);
      const json = await res.json();
      if (json.ok) {
        setRolePermisos(json.data.permisos);
        setSelectedPermisos(json.data.permisos);
        setDirty(false);
      }
    } catch {
      addToast("Error al cargar permisos del rol", "error");
    } finally {
      setLoadingPermisos(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchRoles();
    fetchPermisos();
  }, [fetchRoles, fetchPermisos]);

  useEffect(() => {
    if (selectedRoleId) {
      fetchRolePermisos(selectedRoleId);
    }
  }, [selectedRoleId, fetchRolePermisos]);

  const togglePermiso = (permisoId: string) => {
    setSelectedPermisos((prev) => {
      const next = prev.includes(permisoId)
        ? prev.filter((id) => id !== permisoId)
        : [...prev, permisoId];
      setDirty(true);
      return next;
    });
  };

  const selectAllInModulo = (modulo: string, checked: boolean) => {
    const modulePermisos = permisosAgrupados
      .find((m) => m.modulo === modulo)
      ?.permisos.map((p) => p.id) || [];

    setSelectedPermisos((prev) => {
      const filtered = prev.filter((id) => !modulePermisos.includes(id));
      const next = checked ? [...filtered, ...modulePermisos] : filtered;
      setDirty(true);
      return next;
    });
  };

  const guardarPermisos = async () => {
    if (!selectedRoleId) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/roles/${selectedRoleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permisos: selectedPermisos }),
      });
      const json = await res.json();
      if (!json.ok) {
        addToast(json.message || "Error al guardar permisos", "error");
        return;
      }
      setRolePermisos(selectedPermisos);
      setDirty(false);
      addToast("Permisos actualizados correctamente", "success");
    } catch {
      addToast("Error de conexión", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActivoRol = async () => {
    if (!selectedRoleId || !selectedRole) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/roles/${selectedRoleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !selectedRole.activo }),
      });
      const json = await res.json();
      if (!json.ok) {
        addToast(json.message || "Error al cambiar estado del rol", "error");
        return;
      }
      addToast(selectedRole.activo ? "Rol desactivado" : "Rol activado", "success");
      fetchRoles();
      setSelectedRoleId(selectedRoleId);
    } catch {
      addToast("Error de conexión", "error");
    } finally {
      setSaving(false);
    }
  };

  const crearRol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRol.nombre.trim()) return;
    setSaving(true);
    setModalError("");

    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRol),
      });
      const json = await res.json();
      if (!json.ok) {
        setModalError(json.message || "Error al crear rol");
        return;
      }
      addToast(`Rol "${json.data.nombre}" creado correctamente`, "success");
      setShowCreateModal(false);
      setNewRol({ nombre: "", descripcion: "" });
      await fetchRoles();
      setSelectedRoleId(json.data.id);
    } catch {
      addToast("Error de conexión", "error");
    } finally {
      setSaving(false);
    }
  };

  const eliminarRol = async () => {
    if (!selectedRoleId || !selectedRole) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/roles/${selectedRoleId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.ok) {
        addToast(json.message || "Error al eliminar rol", "error");
        return;
      }
      addToast(json.message, "success");
      setConfirmDelete(false);
      setSelectedRoleId(null);
      fetchRoles();
    } catch {
      addToast("Error de conexión", "error");
    } finally {
      setSaving(false);
    }
  };

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-medium text-slate-900 tracking-tight">
          Roles y Permisos
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Gestiona la matriz de accesos del sistema
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Roles list */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-slate-700 uppercase tracking-wider">
                  Roles
                </h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus size={12} strokeWidth={2.5} />
                  Nuevo
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {roles.map((rol) => (
                  <button
                    key={rol.id}
                    onClick={() => setSelectedRoleId(rol.id)}
                    className={`w-full text-left px-4 py-3.5 transition-colors ${
                      selectedRoleId === rol.id
                        ? "bg-blue-50 border-l-2 border-blue-700"
                        : "hover:bg-slate-50 border-l-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[13px] font-medium ${
                          selectedRoleId === rol.id
                            ? "text-blue-700"
                            : "text-slate-900"
                        }`}
                      >
                        {rol.nombre}
                      </span>
                      {!rol.activo && (
                        <Lock size={12} className="text-slate-300" strokeWidth={2} />
                      )}
                    </div>
                    {rol.descripcion && (
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                        {rol.descripcion}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Permissions matrix */}
          <div className="lg:col-span-3">
            {!selectedRoleId ? (
              <div className="bg-white border border-slate-200 rounded-xl shadow-card p-12 text-center">
                <Lock size={32} className="mx-auto text-slate-300 mb-3" strokeWidth={1.5} />
                <p className="text-sm text-slate-500">
                  Selecciona un rol para gestionar sus permisos
                </p>
              </div>
            ) : loadingPermisos ? (
              <div className="bg-white border border-slate-200 rounded-xl shadow-card p-12 text-center">
                <Loader2 size={24} className="animate-spin mx-auto text-slate-400" />
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden">
                {/* Selected role header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[15px] font-semibold text-slate-900">
                        {selectedRole?.nombre}
                      </h2>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        selectedRole?.activo
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          selectedRole?.activo ? "bg-green-500" : "bg-red-500"
                        }`} />
                        {selectedRole?.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 mt-0.5 truncate max-w-md">
                      {selectedRole?.descripcion}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={toggleActivoRol}
                      disabled={saving}
                      className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-lg border transition-colors ${
                        selectedRole?.activo
                          ? "bg-white border-red-200 text-red-600 hover:bg-red-50"
                          : "bg-white border-green-200 text-green-600 hover:bg-green-50"
                      }`}
                      title={selectedRole?.activo ? "Desactivar rol" : "Activar rol"}
                    >
                      {selectedRole?.activo ? (
                        <Trash2 size={13} strokeWidth={1.5} />
                      ) : (
                        <RotateCcw size={13} strokeWidth={1.5} />
                      )}
                      {selectedRole?.activo ? "Desactivar" : "Activar"}
                    </button>
                    {!selectedRole?.activo && (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-colors"
                        title="Eliminar rol definitivamente"
                      >
                        <Trash2 size={13} strokeWidth={1.5} />
                        Eliminar
                      </button>
                    )}
                    <button
                      onClick={guardarPermisos}
                      disabled={saving || !dirty || !selectedRole?.activo}
                      className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 active:bg-blue-900 disabled:bg-blue-200 disabled:text-blue-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving && <Loader2 size={14} className="animate-spin" />}
                      <Save size={14} strokeWidth={2} />
                      {dirty ? "Guardar Cambios" : "Guardado"}
                    </button>
                  </div>
                </div>

                {!selectedRole?.activo && (
                  <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-600 shrink-0" />
                    <p className="text-[12px] text-amber-800">
                      Este rol está <strong>inactivo</strong>. Los usuarios con este rol perdieron los accesos. Actívalo para poder modificar sus permisos.
                    </p>
                  </div>
                )}

                <div className="divide-y divide-slate-100">
                  {permisosAgrupados.map((grupo) => {
                    const allSelected = grupo.permisos.every((p) =>
                      selectedPermisos.includes(p.id),
                    );
                    const someSelected = grupo.permisos.some((p) =>
                      selectedPermisos.includes(p.id),
                    );

                    return (
                      <div key={grupo.modulo} className="px-6 py-4">
                        <div className="flex items-center justify-between mb-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              ref={(el) => {
                                if (el) el.indeterminate = someSelected && !allSelected;
                              }}
                              onChange={(e) =>
                                selectAllInModulo(grupo.modulo, e.target.checked)
                              }
                              disabled={!selectedRole?.activo}
                              className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                            <span className={`text-[13px] font-semibold tracking-wider ${
                              selectedRole?.activo ? "text-slate-700" : "text-slate-400"
                            }`}>
                              {grupo.modulo}
                            </span>
                          </label>
                          <span className="text-[11px] text-slate-400">
                            {selectedPermisos.filter((id) =>
                              grupo.permisos.some((p) => p.id === id),
                            ).length}{" "}
                            / {grupo.permisos.length}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {grupo.permisos.map((permiso) => {
                            const isSelected = selectedPermisos.includes(permiso.id);
                            const canToggle = selectedRole?.activo;
                            return (
                              <button
                                key={permiso.id}
                                type="button"
                                onClick={() => canToggle && togglePermiso(permiso.id)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all ${
                                  !canToggle
                                    ? "bg-slate-50 border-slate-100 opacity-60"
                                    : isSelected
                                      ? "bg-blue-50 border-blue-200"
                                      : "bg-white border-slate-200 hover:border-slate-300"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                                    isSelected
                                      ? "bg-blue-700 border-blue-700"
                                      : "border-slate-300"
                                  } ${!canToggle ? "opacity-40" : ""}`}
                                >
                                  {isSelected && (
                                    <Check size={10} className="text-white" strokeWidth={3} />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[12px] font-medium text-slate-900 leading-tight">
                                    {permiso.accion}
                                  </div>
                                  {permiso.descripcion && (
                                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                                      {permiso.descripcion}
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Delete confirmation modal */}
      {confirmDelete && selectedRole && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-sm">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <AlertCircle size={20} className="text-red-500" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-[16px] font-medium text-slate-900">
                    Eliminar rol
                  </h2>
                  <p className="text-[13px] text-slate-500 mt-0.5">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              <p className="text-[13px] text-slate-700 mt-4">
                ¿Estás seguro de eliminar el rol <strong>"{selectedRole.nombre}"</strong>?
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 bg-transparent text-slate-600 text-[13px] font-normal rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={eliminarRol}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 active:bg-red-800 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                <Trash2 size={14} strokeWidth={1.5} />
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200">
              <h2 className="text-[16px] font-medium text-slate-900">
                Nuevo Rol
              </h2>
              <button
                onClick={() => { setShowCreateModal(false); setModalError(""); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={crearRol} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-slate-600 mb-1.5">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newRol.nombre}
                  onChange={(e) => setNewRol({ ...newRol, nombre: e.target.value })}
                  placeholder="ej: supervisor"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Se guardará en minúsculas (snake_case)
                </p>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-600 mb-1.5">
                  Descripción
                </label>
                <textarea
                  value={newRol.descripcion}
                  onChange={(e) => setNewRol({ ...newRol, descripcion: e.target.value })}
                  placeholder="Describe el propósito del rol"
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition-all resize-none"
                />
              </div>

              {modalError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
                  <AlertCircle size={16} />
                  {modalError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setModalError(""); }}
                  className="px-4 py-2 bg-transparent text-slate-600 text-[13px] font-normal rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !newRol.nombre.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 active:bg-blue-900 disabled:bg-blue-200 disabled:text-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Crear Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
