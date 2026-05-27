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
            logoutStore(); // limpia Zustand

            router.replace("/login");
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full"
        >
            <LogOut size={18} />
            <span>Cerrar sesión</span>
        </button>
    );
}