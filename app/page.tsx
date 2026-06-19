import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/service";

const roleDashboard: Record<string, string> = {
  super_admin: "/admin/dashboard",
  admin: "/admin/dashboard",
  oficial: "/oficiales/dashboard",
  infracciones: "/depInfracciones/dashboard",
  liberaciones: "/depLiberaciones/dashboard",
  fiscalia: "/externos/fiscalia/dashboard",
  juzgado_civico: "/externos/juzgadoCivico/dashboard",
  corralon_mejia: "/externos/corralonMejia/dashboard",
  corralon_mw: "/externos/corralonMW/dashboard",
  ciudadano: "/consulta",
};

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const cookieStore = await cookies();
  const lastRole = cookieStore.get("last_role")?.value as string | undefined;
  const role = lastRole && session.user.roles.includes(lastRole) ? lastRole : session.user.roles[0];

  const dashboard = roleDashboard[role] || "/login";
  redirect(dashboard);
}
