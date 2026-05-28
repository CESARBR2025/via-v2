"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LogoutButton() {
    const router = useRouter();
    const logoutStore = useAuthStore((s) => s.logout);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });
        } finally {
            logoutStore();
            router.replace("/login");
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="
                flex items-center gap-2
                px-3 py-2.5
                rounded-xl
                text-sm font-medium
                text-[#EF4444]
                hover:bg-[rgba(239,68,68,0.10)]
                transition-all duration-200
                w-full
            "
        >
            <LogOut size={18} className="shrink-0" />
            <span>Cerrar sesión</span>
        </button>
    );
}
