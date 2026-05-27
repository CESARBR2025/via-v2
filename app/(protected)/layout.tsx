
import BottomNav from "@/features/sidebar/components/BottomNav";
import Header from "@/features/sidebar/components/Header";
import Sidebar from "@/features/sidebar/components/SideBar";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen  overflow-hidden bg-[#F8FAFC]">
            {/* Sidebar visible en md+ */}
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Header fijo SIEMPRE visible */}
                <Header />

                {/* Contenido con scroll */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 bg-white">
                    {children}
                </main>
            </div>

            {/* Bottom nav SOLO móvil */}
            <BottomNav />
        </div>
    );
}