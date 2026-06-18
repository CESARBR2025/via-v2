"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  BadgeCheck,
  Loader2,
  Save,
  User,
  Building2,
  MapPin,
  Hash,
  Calendar,
  Phone,
  Mail,
  FileText,
  BadgeInfo,
  ArrowUpDown,
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
}

const dataFields = [
  { key: "numEmpleado", label: "N° Empleado", icon: Hash },
  { key: "curp", label: "CURP", icon: FileText },
  { key: "correo", label: "Correo", icon: Mail },
  { key: "telefono", label: "Teléfono", icon: Phone },
  { key: "departamento", label: "Departamento", icon: Building2 },
  { key: "rango", label: "Rango", icon: ArrowUpDown },
  { key: "sector", label: "Sector", icon: MapPin },
  { key: "fechaIngreso", label: "Fecha Ingreso", icon: Calendar },
];

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-blue-700" />
          <p className="text-sm text-slate-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <BadgeInfo size={32} className="text-slate-400" />
        <p className="text-sm text-slate-400">No se pudo cargar el perfil</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow-lg shadow-blue-700/20 shrink-0">
          <User size={24} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-[22px] font-medium text-slate-900 tracking-tight">
            {perfil.nombres} {perfil.apellidoP} {perfil.apellidoM}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-blue-200">
              <BadgeCheck size={11} strokeWidth={2.5} />
              Oficial
            </span>
            <span className="text-[12px] text-slate-600">
              {perfil.numeroEmpleado}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-center gap-2.5 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg border border-green-200">
          <BadgeCheck size={16} strokeWidth={2} />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
          <BadgeInfo size={16} />
          {error}
        </div>
      )}

      {/* Personal Data */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200 bg-slate-50">
          <FileText size={16} className="text-blue-700" strokeWidth={2} />
          <h2 className="text-[14px] font-medium text-slate-900">
            Datos Personales
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
            {dataFields.map((field) => {
              let value: string;
              switch (field.key) {
                case "numEmpleado":
                  value = perfil.numeroEmpleado;
                  break;
                case "curp":
                  value = perfil.curp;
                  break;
                case "correo":
                  value = perfil.correo;
                  break;
                case "telefono":
                  value = perfil.telefono || "—";
                  break;
                case "departamento":
                  value = perfil.departamentoNombre || "—";
                  break;
                case "rango":
                  value = perfil.rangoNombre || "—";
                  break;
                case "sector":
                  value = perfil.sectorNombre || "—";
                  break;
                case "fechaIngreso":
                  value = perfil.fechaIngreso
                    ? new Date(perfil.fechaIngreso).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—";
                  break;
                default:
                  value = "—";
              }
              const Icon = field.icon;
              return (
                <div key={field.key} className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={12} className="text-slate-400" strokeWidth={2} />
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                      {field.label}
                    </p>
                  </div>
                  {field.key === "curp" ? (
                    <p className="text-[13px] font-medium text-slate-900 font-mono tracking-wide truncate">
                      {value}
                    </p>
                  ) : (
                    <p className="text-[13px] font-medium text-slate-900 truncate">
                      {value}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Patrol Assignment */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-card">
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2 min-w-0">
            <Shield size={16} className="text-blue-700 shrink-0" strokeWidth={2} />
            <h2 className="text-[14px] font-medium text-slate-900">
              Patrulla Asignada
            </h2>
          </div>
          {patrullaId !== (perfil.patrullaId ?? "") && (
            <button
              onClick={guardarPatrulla}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white text-[13px] font-medium rounded-lg hover:bg-blue-800 active:bg-blue-900 disabled:bg-blue-200 disabled:text-blue-300 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} strokeWidth={2} />
              )}
              Guardar
            </button>
          )}
        </div>

        <div className="p-6">
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
  );
}
