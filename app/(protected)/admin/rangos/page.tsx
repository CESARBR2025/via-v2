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
  ArrowUpDown,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";

interface Rango {
  id: string;
  nombre: string;
  activo: boolean;
}

export default function AdminRangosPage() {
  const router = useRouter();
  const [rangos, setRangos] = useState<Rango[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchRangos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rangos");
      const json = await res.json();
      if (json.ok) setRangos(json.data);
    } catch {
      setError("Error al cargar rangos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRangos(); }, [fetchRangos]);

  const abrirCrear = () => {
    setEditandoId(null);
    setNombre("");
    setError("");
    setModalOpen(true);
  };

  const abrirEditar = (r: Rango) => {
    setEditandoId(r.id);
    setNombre(r.nombre);
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
        const res = await fetch(`/api/admin/rangos/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre }),
        });
        const json = await res.json();
        if (!json.ok) { setError(json.message); return; }
        setSuccessMsg("Rango actualizado");
      } else {
        const res = await fetch("/api/admin/rangos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre }),
        });
        const json = await res.json();
        if (!json.ok) { setError(json.message); return; }
        setSuccessMsg("Rango creado");
      }

      setModalOpen(false);
      fetchRangos();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async (r: Rango) => {
    setError(""); setSuccessMsg("");
    try {
      const res = await fetch(`/api/admin/rangos/${r.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.ok) { setError(json.message); return; }
      setSuccessMsg(json.message);
      fetchRangos();
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
            Rangos
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            {rangos.length} rangos registrados
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Nuevo Rango
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
                  Rango
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
              ) : rangos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-16 text-sm text-[#94A3B8]">
                    No hay rangos registrados
                  </td>
                </tr>
              ) : (
                rangos.map((r) => (
                  <tr key={r.id} className="border-b border-[#F1F5F9] hover:bg-[#FAFBFC] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] flex items-center justify-center shrink-0">
                          <ArrowUpDown size={15} className="text-[#C2410C]" strokeWidth={2} />
                        </div>
                        <div>
                          <span className="text-[13px] font-semibold text-[#0F172A]">{r.nombre}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full ${
                        r.activo
                          ? "bg-[#DCFCE7] text-[#16A34A]"
                          : "bg-[#FEE2E2] text-[#DC2626]"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          r.activo ? "bg-[#16A34A]" : "bg-[#DC2626]"
                        }`} />
                        {r.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-0.5">
                        <button onClick={() => abrirEditar(r)} className="p-1.5 rounded-lg hover:bg-[#FFF7ED] text-[#94A3B8] hover:text-[#C2410C] transition-colors" title="Editar rango">
                          <Pencil size={14} strokeWidth={1.5} />
                        </button>
                        <button onClick={() => toggleActivo(r)} className={`p-1.5 rounded-lg transition-colors ${
                          r.activo
                            ? "hover:bg-[#FEE2E2] text-[#94A3B8] hover:text-[#DC2626]"
                            : "hover:bg-[#DCFCE7] text-[#94A3B8] hover:text-[#16A34A]"
                        }`} title={r.activo ? "Desactivar rango" : "Activar rango"}>
                          {r.activo ? <Trash2 size={14} strokeWidth={1.5} /> : <RotateCcw size={14} strokeWidth={1.5} />}
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E2E8F0]">
              <h2 className="text-[16px] font-semibold text-[#0F172A]">
                {editandoId ? "Editar Rango" : "Nuevo Rango"}
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
                  placeholder="Ej: OFICIAL"
                  className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] focus:outline-none transition-all"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[#64748B] bg-white border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] disabled:bg-[#93C5FD] disabled:opacity-60 transition-colors">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editandoId ? "Guardar" : "Crear Rango"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
