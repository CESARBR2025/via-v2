import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Settings,
  Shield,
  KeyRound,
  LayoutDashboard,
  UserCheck,
  Activity,
} from "lucide-react";
import { getSession } from "@/features/auth/service";
import { POOL_PG } from "@/lib/db";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

function formatDate(): string {
  return new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const firstName = session.user.nombres;
  const greeting = getGreeting();
  const dateStr = formatDate();

  let stats = {
    usuarios: 0,
    oficiales: 0,
    roles: 0,
    infracciones: 0,
  };

  try {
    const [usuariosRes, oficialesRes, rolesRes, infraccionesRes] =
      await Promise.all([
        POOL_PG.query(`SELECT COUNT(*) as count FROM v2_usuarios WHERE activo = true`),
        POOL_PG.query(
          `SELECT COUNT(*) as count FROM v2_oficiales WHERE activo = true`,
        ),
        POOL_PG.query(
          `SELECT COUNT(*) as count FROM v2_roles WHERE activo = true`,
        ),
        POOL_PG.query(
          `SELECT COUNT(*) as count FROM v2_infracciones`,
        ),
      ]);

    stats = {
      usuarios: parseInt(usuariosRes.rows[0].count, 10),
      oficiales: parseInt(oficialesRes.rows[0].count, 10),
      roles: parseInt(rolesRes.rows[0].count, 10),
      infracciones: parseInt(infraccionesRes.rows[0].count, 10),
    };
  } catch {}

  return (
    <div className="space-y-6">
      {/* GREETING */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-medium text-slate-900 leading-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-[14px] text-slate-600 mt-1.5 capitalize">
            {dateStr}
          </p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] font-medium text-blue-800">
            Administrador
          </span>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={Users}
          label="Usuarios activos"
          value={stats.usuarios}
        />
        <StatCard
          icon={UserCheck}
          label="Oficiales activos"
          value={stats.oficiales}
        />
        <StatCard
          icon={Activity}
          label="Roles activos"
          value={stats.roles}
        />
        <StatCard
          icon={LayoutDashboard}
          label="Infracciones totales"
          value={stats.infracciones}
        />
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <h2 className="text-[17px] font-medium leading-snug text-slate-900 mb-3">
          Accesos rápidos del sistema
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            href="/admin/oficiales"
            icon={Users}
            title="Oficiales"
            description="Administra los oficiales de policía, asigna números de empleado, departamentos y patrullas"
          />
          <ActionCard
            href="/admin/usuarios"
            icon={Shield}
            title="Usuarios"
            description="Gestiona los usuarios del sistema y asigna sus roles de acceso"
          />
          <ActionCard
            href="/admin/roles-permisos"
            icon={KeyRound}
            title="Roles y Permisos"
            description="Administra la matriz de accesos, crea roles y asigna permisos del sistema"
          />
          <ActionCard
            href="/admin/configuracion"
            icon={Settings}
            title="Catálogos"
            description="Sectores, departamentos y rangos de la corporación"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-card">
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
        <Icon size={18} className="text-blue-700" strokeWidth={1.5} />
      </div>
      <p className="text-xs font-medium leading-snug text-slate-600">
        {label}
      </p>
      <p className="text-[22px] font-medium text-slate-900 mt-0.5">{value}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Users;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-card hover:shadow-md hover:border-blue-700 transition-all group block"
    >
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-700 transition-colors">
        <Icon
          size={20}
          className="text-blue-700 group-hover:text-white transition-colors"
          strokeWidth={1.5}
        />
      </div>
      <h3 className="text-[16px] font-medium text-slate-900 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed">
        {description}
      </p>
    </Link>
  );
}
