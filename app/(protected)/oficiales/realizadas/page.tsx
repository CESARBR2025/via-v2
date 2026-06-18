import TablaDepInfracciones from "@/features/depInfracciones/components/TablaDevInfracciones/TablaDepInfracciones";
import { getSession } from "@/features/auth/service";


export default async function DepInfraccionesPage() {
    const baseUrl =
        process.env.NODE_ENV === 'production'
            ? 'https://via-v2.vercel.app'
            : 'http://localhost:3000';


    const session = await getSession()
    console.log(session?.user.id)

    const userId = session?.user.id
    const res = await fetch(
        `${baseUrl}/api/oficiales/obtenerInfracciones?userId=${userId}`,
        {
            cache: "no-store",

        },

    );

    if (!res.ok) {
        throw new Error("Error cargando infracciones");
    }

    const data = await res.json();
    console.log(data)

    return (
        <div className="flex flex-col h-full">
            <div className="shrink-0">
                <h1 className="text-[22px] font-medium text-slate-900">
                    Infracciones realizadas en campo
                </h1>
                <p className="text-[14px] text-slate-600 mt-1 mb-6">
                    Administra las infracciones que realizas en campo
                </p>
            </div>

            <div className="flex flex-col flex-1 min-h-0">
                <TablaDepInfracciones data={data} />
            </div>
        </div>
    );
}
