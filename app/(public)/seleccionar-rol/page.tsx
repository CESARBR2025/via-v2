// app/select-role/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SeleccionarRol from "@/features/auth/components/SeleccionarRol";
import { verifyPreSession } from "@/features/auth/service";


export default async function SelectRolePage() {
    const cookieStore = await cookies();

    const preSessionToken = cookieStore.get("pre_session")?.value;

    if (!preSessionToken) {
        redirect("/login");
    }

    let rolesDisponibles: string[] = [];
    let lastRole: string | null = null;

    try {
        const preSession = await verifyPreSession(preSessionToken);

        if (!preSession?.roles?.length) {
            redirect("/login");
        }

        rolesDisponibles = preSession.roles;

        lastRole = cookieStore.get("last_role")?.value || null;
    } catch (error) {
        console.error("Error verificando pre-session:", error);
        redirect("/login");
    }

    return (
        <SeleccionarRol
            rolesIniciales={rolesDisponibles}
            lastRole={lastRole}
        />
    );
}