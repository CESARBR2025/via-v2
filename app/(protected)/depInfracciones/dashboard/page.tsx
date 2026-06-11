import { getSession } from "@/features/auth/service";
import TablaCompartida from "@/features/compartido/components/TablaCompartida";
import TablaDepInfracciones from "@/features/depInfracciones/components/TablaDevInfracciones/TablaDepInfracciones";

export default async function DepInfraccionesPage() {
    const session = await getSession();
    const roleString = session?.user?.roles?.[0];

    console.log(roleString)
    const dependenciaClave = "INFRACCIONES";
    const baseUrl =
        process.env.NODE_ENV === 'production'
            ? 'https://via-v2.vercel.app'
            : 'http://localhost:3000';

    const res = await fetch(
        `${baseUrl}/api/depInfracciones/listarInfracciones`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Error cargando infracciones");
    }

    const data = await res.json();
    console.log(data)
    return (
        <div className="flex flex-col h-full">


            <div className="flex flex-col flex-1 min-h-0">
                <TablaCompartida
                    respuestaServidor={data}
                    userRole={roleString}
                />
            </div>
        </div>
    );
}
