import TablaDepInfracciones from "@/features/depInfracciones/components/TablaDevInfracciones/TablaDepInfracciones";

export default async function DepInfraccionesPage() {
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
            <div className="shrink-0">
                <h1 className="text-[22px] font-bold text-[#0F172A]">
                    Gestión de infracciones
                </h1>
                <p className="text-[14px] text-[#64748B] mt-1 mb-6">
                    Administra infracciones pendientes de liberación en campo
                </p>
            </div>

            <div className="flex flex-col flex-1 min-h-0">
                <TablaDepInfracciones data={data} />
            </div>
        </div>
    );
}
