import { cookies } from "next/headers";

import BottomNav
    from "@/features/sidebar/components/BottomNav";

import Header
    from "@/features/sidebar/components/Header";

import Sidebar
    from "@/features/sidebar/components/SideBar";
import MobileSidebar from "@/features/sidebar/components/MobileSideBar";
import { UserRole } from "@/features/sidebar/types";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const cookieStore = await cookies();

    const role =
        (cookieStore.get("last_role")?.value ||
            "oficial") as UserRole;

    return (
        <div className="
            flex h-screen
            overflow-hidden
            bg-[#ECF0FB]
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

                <Header />

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