import { cookies } from "next/headers";

import BottomNav
    from "@/features/sidebar/components/BottomNav";

import Header
    from "@/features/sidebar/components/Header";

import Sidebar
    from "@/features/sidebar/components/SideBar";
import MobileSidebar from "@/features/sidebar/components/MobileSideBar";
import { UserRole } from "@/features/sidebar/config/types";
import { getSession } from "@/features/auth/service";

const ROLE_LABELS: Record<string, string> = {
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

    const role =
        (cookieStore.get("last_role")?.value ||
            "oficial") as UserRole;

    console.log(role)

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
            bg-[#F1F5F9]
        ">

            {/* DESKTOP */}

            <Sidebar role={role} />

            {/* MOBILE */}

            <MobileSidebar role={role} />

            {/* CONTENT */}

            <div className="
                flex flex-col flex-1
                overflow-hidden
            ">

                <Header userName={userName} userRole={userRole} />

                <main className="
                    flex-1 overflow-y-auto
                    p-4 md:p-6
                    pb-20 md:pb-6
                ">
                    {children}
                </main>

            </div>


            {/* MOBILE NAV */}

            <BottomNav role={role} />

        </div>
    );
}
