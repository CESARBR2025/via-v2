import { getSession } from "@/features/auth/service";
import TablaCompartida from "@/features/compartido/components/TablaCompartida";

export default async function FiscaliaPage() {
    const session = await getSession();
    const roleString = session?.user?.roles?.[0];

    const dependenciaClave = "FISCALIA";

    const baseUrl =
        process.env.NODE_ENV === "production"
            ? "https://via-v2.vercel.app"
            : "http://localhost:3000";

    let respuestaApi = [];

    try {
        const res = await fetch(
            `${baseUrl}/api/dependencias/listarDatos?dependencia=${dependenciaClave}`,
            { cache: "no-store" }
        );

        if (res.ok) {
            respuestaApi = await res.json();
        }
    } catch (error) {
        console.error("Error obteniendo datos:", error);
    }

    console.log(respuestaApi)

    return (
        <div className="flex flex-col h-full">


            <div className="flex flex-col flex-1 min-h-0">
                <TablaCompartida
                    respuestaServidor={respuestaApi}
                    userRole={roleString}
                />
            </div>
        </div>
    );
}