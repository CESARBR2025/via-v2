import BottomNav from "@/features/sidebar/components/BottomNav";
import Header from "@/features/sidebar/components/Header";

import Sidebar from "@/features/sidebar/components/SideBar";
import MobileSidebar from "@/features/sidebar/components/MobileSideBar";


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <div className="
            flex h-screen
            overflow-hidden
            bg-[#F8FAFC]
        ">

            {/* DESKTOP */}

            <Sidebar />

            {/* MOBILE */}

            <MobileSidebar />

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

            {/* MOBILE TABBAR */}

            <BottomNav />

        </div>
    );
}