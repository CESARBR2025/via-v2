"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  BadgeCheck,
  Loader2,
  Save,
  Building2,
  MapPin,
  Calendar,
  Phone,
  Mail,
  FileText,
  BadgeInfo,
  User,
} from "lucide-react";
import BuscadorPatrullas from "@/features/oficiales/components/BuscadorPatrullas";

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

interface Perfil {
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
  patrullaPlacas: string | null;
  sectorId: string | null;
  sectorNombre: string | null;
  fechaIngreso: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  infraccionesCount?: number;
}

export default function MiPerfilPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [patrullas, setPatrullas] = useState<Patrulla[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [patrullaId, setPatrullaId] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [pRes, patRes] = await Promise.all([
          fetch("/api/oficiales/perfil"),
          fetch("/api/oficiales/patrullas"),
        ]);
        const pJson = await pRes.json();
        const patJson = await patRes.json();
        if (pJson.ok) {
          setPerfil(pJson.data);
          setPatrullaId(pJson.data.patrullaId ?? "");
        }
        if (patJson.ok) setPatrullas(patJson.data);
      } catch {
        setError("Error al cargar perfil");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const guardarPatrulla = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/oficiales/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patrullaId: patrullaId || null }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.message || "Error al guardar");
        return;
      }
      setPerfil(json.data);
      setSuccess("Patrulla actualizada correctamente");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-700 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-900">Cargando perfil</p>
          <p className="text-xs text-slate-500 mt-1">Obteniendo información del oficial…</p>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
          <BadgeInfo size={24} className="text-slate-400" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-900">No se encontró información</p>
          <p className="text-xs text-slate-500 mt-1">No se pudo cargar el perfil del oficial.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow-lg shadow-blue-700/20 shrink-0">
            <span className="text-lg font-medium text-white">
              {(perfil.nombres ?? ' ').charAt(0).toUpperCase()}{(perfil.apellidoP ?? ' ').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[22px] font-medium leading-tight text-slate-900">
              {perfil.nombres} {perfil.apellidoP} {perfil.apellidoM}
            </h1>
            <div className="flex items-center flex-wrap gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-200">
                <BadgeCheck size={11} strokeWidth={2} />
                Oficial
              </span>
              <span className="text-[13px] text-slate-500 font-mono">
                #{perfil.numeroEmpleado}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="shrink-0 mt-5 grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-card p-4">
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
            <Calendar size={12} className="text-slate-400 shrink-0" strokeWidth={1.5} />
            Años de servicio
          </p>
          <p className="text-xl font-medium text-slate-900">
            {perfil.fechaIngreso
              ? Math.max(0, new Date().getFullYear() - new Date(perfil.fechaIngreso).getFullYear())
              : '—'}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-card p-4">
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
            <FileText size={12} className="text-slate-400 shrink-0" strokeWidth={1.5} />
            Infracciones registradas
          </p>
          <p className="text-xl font-medium text-slate-900">
            {perfil.infraccionesCount != null ? perfil.infraccionesCount.toLocaleString() : '—'}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-card p-4">
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
            <Shield size={12} className="text-slate-400 shrink-0" strokeWidth={1.5} />
            Estado
          </p>
          <p className={`text-xl font-medium flex items-center gap-2 ${perfil.activo ? 'text-green-700' : 'text-red-700'}`}>
            <span className={`w-2 h-2 rounded-full ${perfil.activo ? 'bg-green-500' : 'bg-red-500'}`} />
            {perfil.activo ? 'En servicio' : 'Dado de baja'}
          </p>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="shrink-0 mt-4">
          <div className="flex items-center gap-2.5 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg border border-green-200">
            <BadgeCheck size={16} strokeWidth={1.5} />
            {success}
          </div>
        </div>
      )}
      {error && (
        <div className="shrink-0 mt-4">
          <div className="flex items-center gap-2.5 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
            <BadgeInfo size={16} strokeWidth={1.5} />
            {error}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 mt-6 space-y-6">
        {/* Información General */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-card">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200">
            <FileText size={15} className="text-blue-700 shrink-0" strokeWidth={1.5} />
            <h2 className="text-[15px] font-medium text-slate-900">
              Información General
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <ProfileField icon={FileText} label="CURP" value={perfil.curp} mono />
              <ProfileField icon={Mail} label="Correo electrónico" value={perfil.correo} />
              <ProfileField icon={Phone} label="Teléfono" value={perfil.telefono ?? '—'} />
              <ProfileField
                icon={Calendar}
                label="Fecha de ingreso"
                value={perfil.fechaIngreso
                  ? new Date(perfil.fechaIngreso).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              />
            </div>
          </div>
        </div>

        {/* Asignación */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-card">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200">
            <Building2 size={15} className="text-blue-700 shrink-0" strokeWidth={1.5} />
            <h2 className="text-[15px] font-medium text-slate-900">
              Asignación
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-5">
              <ProfileField icon={Building2} label="Departamento" value={perfil.departamentoNombre ?? '—'} />
              <ProfileField icon={BadgeCheck} label="Rango" value={perfil.rangoNombre ?? '—'} />
              <ProfileField icon={MapPin} label="Sector" value={perfil.sectorNombre ?? '—'} />
            </div>

            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Shield size={15} className="text-blue-700 shrink-0" strokeWidth={1.5} />
                  <h3 className="text-[14px] font-medium text-slate-900">
                    Patrulla Asignada
                  </h3>
                </div>
                {patrullaId !== (perfil.patrullaId ?? '') && (
                  <button
                    onClick={guardarPatrulla}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white text-[13px] font-medium rounded-lg border-none hover:bg-blue-800 active:bg-blue-900 active:scale-[0.99] disabled:bg-blue-200 disabled:text-blue-300 disabled:cursor-not-allowed transition-all duration-150"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} strokeWidth={1.5} />
                    )}
                    Guardar
                  </button>
                )}
              </div>
              <BuscadorPatrullas
                patrullas={patrullas}
                patrullasLoaded={true}
                value={patrullaId}
                onChange={setPatrullaId}
                onManualChange={() => {}}
                manualData={{ numeroUnidad: "", placas: "" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof User;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1">
        <Icon size={12} className="text-slate-400 shrink-0" strokeWidth={1.5} />
        {label}
      </p>
      <p className={`text-sm text-slate-900 leading-snug truncate ${mono ? 'font-mono tracking-wide' : ''}`}>
        {value}
      </p>
    </div>
  );
}
