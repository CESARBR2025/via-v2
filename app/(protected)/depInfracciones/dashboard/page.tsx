import { getSession } from "@/features/auth/service";
import TablaCompartida from "@/features/compartido/components/TablaCompartida";
import TablaDepInfracciones from "@/features/depInfracciones/components/TablaDevInfracciones/TablaDepInfracciones";

export default async function DepInfraccionesPage() {
    const session = await getSession();
    const roleString = session?.user?.roles?.[0];

    console.log(roleString)
    const dependenciaClave = "INFRACCIONES";
    let respuestaApi = [];

    const baseUrl =
        process.env.NODE_ENV === "production"
            ? "https://via-v2.vercel.app"
            : "http://localhost:3000";

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
