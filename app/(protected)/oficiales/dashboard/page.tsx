import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FilePlus,
  ClipboardCheck,
  User,
  Calendar,
  Car,
  TrendingUp,
} from "lucide-react";
import { getSession } from "@/features/auth/service";

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

function computeStats(infracciones: { created_at: string }[]) {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfWeekStr = startOfWeek.toISOString().split("T")[0];

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfMonthStr = startOfMonth.toISOString().split("T")[0];

  return {
    total: infracciones.length,
    today: infracciones.filter((i) => i.created_at?.startsWith(todayStr)).length,
    thisWeek: infracciones.filter(
      (i) => i.created_at >= startOfWeekStr
    ).length,
    thisMonth: infracciones.filter(
      (i) => i.created_at >= startOfMonthStr
    ).length,
  };
}

export default async function OficialDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://via-v2.vercel.app"
      : "http://localhost:3000";

  const userId = session.user.id;
  const userName = `${session.user.nombres} ${session.user.apellido_p}`;
  const firstName = session.user.nombres;

  let stats = { total: 0, today: 0, thisWeek: 0, thisMonth: 0 };

  try {
    const res = await fetch(
      `${baseUrl}/api/oficiales/obtenerInfracciones?userId=${userId}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      const infracciones = data?.data || [];
      stats = computeStats(infracciones);
    }
  } catch {}

  const greeting = getGreeting();
  const dateStr = formatDate();

  return (
    <div className="max-w-6xl mx-auto space-y-7">
      {/* GREETING */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A] leading-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1.5 capitalize">
            {dateStr}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[13px] font-medium text-[#2563EB]">
            En servicio
          </span>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={Car}
          label="Total infracciones"
          value={stats.total}
          color="primary"
        />
        <StatCard
          icon={Calendar}
          label="Hoy"
          value={stats.today}
          color="primary"
        />
        <StatCard
          icon={TrendingUp}
          label="Esta semana"
          value={stats.thisWeek}
          color="accent"
        />
        <StatCard
          icon={Calendar}
          label="Este mes"
          value={stats.thisMonth}
          color="accent"
        />
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <h2 className="text-[16px] font-semibold text-[#0F172A] mb-3">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ActionCard
            href="/oficiales/captura"
            icon={FilePlus}
            title="Capturar Infracción"
            description="Registra una nueva infracción en campo con datos del vehículo, infractor y ubicación"
            color="primary"
          />
          <ActionCard
            href="/oficiales/realizadas"
            icon={ClipboardCheck}
            title="Infracciones Realizadas"
            description="Consulta el historial de infracciones que has registrado y su estado actual"
            color="accent"
          />
          <ActionCard
            href="/oficiales/perfil"
            icon={User}
            title="Mi Perfil"
            description="Revisa y actualiza tu información personal, patrulla asignada y datos de contacto"
            color="secondary"
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
  color,
}: {
  icon: typeof Car;
  label: string;
  value: number;
  color: "primary" | "accent";
}) {
  const colorMap = {
    primary: { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]" },
    accent: { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]" },
  };
  const c = colorMap[color];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 md:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
      <div
        className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-3`}
      >
        <Icon size={18} className={c.text} strokeWidth={1.5} />
      </div>
      <p className="text-[12px] font-medium uppercase tracking-wide text-[#64748B]">
        {label}
      </p>
      <p className="text-[22px] font-bold text-[#0F172A] mt-0.5">{value}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: typeof FilePlus;
  title: string;
  description: string;
  color: "primary" | "accent" | "secondary";
}) {
  const colorMap = {
    primary: { bg: "bg-[#EFF6FF]", iconText: "text-[#2563EB]", hoverBg: "group-hover:bg-[#2563EB]" },
    accent: { bg: "bg-[#EFF6FF]", iconText: "text-[#60A5FA]", hoverBg: "group-hover:bg-[#60A5FA]" },
    secondary: { bg: "bg-[#EFF6FF]", iconText: "text-[#1E3A8A]", hoverBg: "group-hover:bg-[#1E3A8A]" },
  };
  const c = colorMap[color];

  return (
    <Link
      href={href}
      className="bg-white border border-[#E2E8F0] rounded-xl p-5 md:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.15),0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#2563EB] transition-all group block"
    >
      <div
        className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-4 ${c.hoverBg} transition-colors`}
      >
        <Icon
          size={20}
          className={`${c.iconText} group-hover:text-white transition-colors`}
          strokeWidth={1.5}
        />
      </div>
      <h3 className="text-[16px] font-semibold text-[#0F172A] mb-1">
        {title}
      </h3>
      <p className="text-[13px] text-[#64748B] leading-relaxed">
        {description}
      </p>
    </Link>
  );
}
