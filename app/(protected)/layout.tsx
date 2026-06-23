import { cookies } from "next/headers";

import Header
    from "@/features/sidebar/components/Header";

import Sidebar
    from "@/features/sidebar/components/SideBar";
import MobileSidebar from "@/features/sidebar/components/MobileSideBar";
import { UserRole } from "@/features/sidebar/config/types";
import { getSession } from "@/features/auth/service";
import OfflineBanner from "@/components/OfflineBanner";
import GlobalDetailModal from "@/components/GlobalDetailModal";

const ROLE_LABELS: Record<string, string> = {
    super_admin: "Super Administrador",
    admin: "Administrador",
    oficial: "Oficial",
    infracciones: "Agente de Infracciones",
    liberaciones: "Agente de Liberaciones",
    fiscalia: "Agente de Fiscalia",
    juzgado_civico: "Agente de Juzgado Cívico",
    corralon_mejia: "Agente de Deposito Mejía",
    corralon_mw: "Agente de Deposito MW",
};

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const [cookieStore, session] = await Promise.all([
        cookies(),
        getSession(),
    ]);

    const lastRole = cookieStore.get("last_role")?.value;
    const firstSessionRole = session?.user.roles[0];
    const role = (
        lastRole && session?.user.roles.includes(lastRole)
            ? lastRole
            : firstSessionRole || "oficial"
    ) as UserRole;

    const userName = session
        ? `${session.user.nombres} ${session.user.apellido_p}`
        : "Usuario";

    const userRole =
        session && session.user.roles.length > 0
            ? ROLE_LABELS[session.user.roles[0]] || session.user.roles[0]
            : "Sin rol";

    return (
        <div className="
            flex h-screen
            overflow-hidden
            bg-slate-100
        ">

            {/* DESKTOP */}

            <Sidebar role={role} />

            {/* MOBILE */}

            <MobileSidebar role={role} userName={userName} userRole={userRole} />

            {/* CONTENT */}

            <div className="
                flex flex-col flex-1
                overflow-hidden
            ">

                <Header
                    userName={userName}
                    userRole={userRole}
                    roleKey={role}
                />

                <OfflineBanner />

                <main className="
                    flex-1 overflow-y-auto
                    p-4 md:p-6
                ">
                    {children}
                </main>

                <GlobalDetailModal />

            </div>

        </div>
    );
}
