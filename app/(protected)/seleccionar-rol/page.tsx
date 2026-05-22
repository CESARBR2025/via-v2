// app/select-role/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import SeleccionarRol from "@/features/auth/components/SeleccionarRol";

import { verifyPreSession } from "@/features/auth/service";

export default async function SelectRolePage() {
    const cookieStore = await cookies();

    // 1. Leer cookie temporal
    const preSessionToken = cookieStore.get("pre_session")?.value;

    // Si no existe sesión temporal → fuera
    if (!preSessionToken) {
        redirect("/login");
    }

    // 2. Verificar y decodificar JWT temporal
    let rolesDisponibles: string[] = [];

    try {
        const preSession = await verifyPreSession(preSessionToken);

        rolesDisponibles = preSession.roles || [];
        console.log("Roles disponibles en pre-session:", rolesDisponibles); // Debug: Ver qué roles se obtienen
    } catch (error) {
        console.error("Error verificando pre-session:", error);

        redirect("/login");
    }

    // Seguridad adicional
    if (rolesDisponibles.length < 1) {
        redirect("/login");
    }

    // 3. Último rol usado (UX)
    const lastRole = cookieStore.get("last_role")?.value || null;

    // 4. Render
    return (
        <SeleccionarRol
            rolesIniciales={rolesDisponibles}
            lastRole={lastRole}
        />
    );
}