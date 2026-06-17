"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2,
  MapPin,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";

interface Sector {
  id: string;
  nombre: string;
  activo: boolean;
}

export default function AdminSectoresPage() {
  const router = useRouter();
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchSectores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sectores");
      const json = await res.json();
      if (json.ok) setSectores(json.data);
    } catch {
      setError("Error al cargar sectores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSectores(); }, [fetchSectores]);

  const abrirCrear = () => {
    setEditandoId(null);
    setNombre("");
    setError("");
    setModalOpen(true);
  };

  const abrirEditar = (s: Sector) => {
    setEditandoId(s.id);
    setNombre(s.nombre);
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      if (editandoId) {
        const res = await fetch(`/api/admin/sectores/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre }),
        });
        const json = await res.json();
        if (!json.ok) { setError(json.message); return; }
        setSuccessMsg("Sector actualizado");
      } else {
        const res = await fetch("/api/admin/sectores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre }),
        });
        const json = await res.json();
        if (!json.ok) { setError(json.message); return; }
        setSuccessMsg("Sector creado");
      }

      setModalOpen(false);
      fetchSectores();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async (s: Sector) => {
    setError(""); setSuccessMsg("");
    try {
      const res = await fetch(`/api/admin/sectores/${s.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.ok) { setError(json.message); return; }
      setSuccessMsg(json.message);
      fetchSectores();
    } catch {
      setError("Error de conexión");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Regresar
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">
            Sectores
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            {sectores.length} sectores registrados
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Nuevo Sector
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 bg-[#DCFCE7] text-[#16A34A] text-sm px-4 py-3 rounded-lg">
          <Check size={16} /> {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-[#FEE2E2] text-[#DC2626] text-sm px-4 py-3 rounded-lg">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B] px-4 py-3.5">
                  Sector
                </th>
                <th className="text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B] px-4 py-3.5 w-[100px]">
                  Estatus
                </th>
                <th className="text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B] px-4 py-3.5 w-[90px]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-16">
                    <Loader2 size={24} className="animate-spin mx-auto text-[#94A3B8]" />
                  </td>
                </tr>
              ) : sectores.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-16 text-sm text-[#94A3B8]">
                    No hay sectores registrados
                  </td>
                </tr>
              ) : (
                sectores.map((s) => (
                  <tr key={s.id} className="border-b border-[#F1F5F9] hover:bg-[#FAFBFC] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] flex items-center justify-center shrink-0">
                          <MapPin size={15} className="text-[#2563EB]" strokeWidth={2} />
                        </div>
                        <div>
                          <span className="text-[13px] font-semibold text-[#0F172A]">{s.nombre}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full ${
                        s.activo
                          ? "bg-[#DCFCE7] text-[#16A34A]"
                          : "bg-[#FEE2E2] text-[#DC2626]"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          s.activo ? "bg-[#16A34A]" : "bg-[#DC2626]"
                        }`} />
                        {s.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-0.5">
                        <button onClick={() => abrirEditar(s)} className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-[#94A3B8] hover:text-[#2563EB] transition-colors" title="Editar sector">
                          <Pencil size={14} strokeWidth={1.5} />
                        </button>
                        <button onClick={() => toggleActivo(s)} className={`p-1.5 rounded-lg transition-colors ${
                          s.activo
                            ? "hover:bg-[#FEE2E2] text-[#94A3B8] hover:text-[#DC2626]"
                            : "hover:bg-[#DCFCE7] text-[#94A3B8] hover:text-[#16A34A]"
                        }`} title={s.activo ? "Desactivar sector" : "Activar sector"}>
                          {s.activo ? <Trash2 size={14} strokeWidth={1.5} /> : <RotateCcw size={14} strokeWidth={1.5} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E2E8F0]">
              <h2 className="text-[16px] font-semibold text-[#0F172A]">
                {editandoId ? "Editar Sector" : "Nuevo Sector"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#94A3B8] transition-colors">
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#64748B] mb-1.5">
                  Nombre <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value.toUpperCase())}
                  placeholder="Ej: PONIENTE"
                  className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition-all"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[#64748B] bg-white border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] disabled:bg-[#93C5FD] disabled:opacity-60 transition-colors">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editandoId ? "Guardar" : "Crear Sector"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
