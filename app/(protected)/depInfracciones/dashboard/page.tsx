import TablaDepInfracciones from "@/features/depInfracciones/components/TablaDevInfracciones/TablaDepInfracciones";


export default async function DepInfraccionesPage() {
    const baseUrl =
        process.env.NODE_ENV === 'production'
            ? 'https://via-v2.vercel.app'
            : 'http://localhost:3000';


    const res = await fetch(
        `${baseUrl}/api/depInfracciones/listarInfracciones?page=1&limit=50`,
        {
            cache: "no-store", // importante para datos en tiempo real
        }
    );

    if (!res.ok) {
        throw new Error("Error cargando infracciones");
    }

    const data = await res.json();

    console.log(data)


    return (
        <section className="flex flex-col h-dvh px-8  ">
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-3xl font-bold m-0">
                        Gestión de infracciones
                    </h1>
                    <p className="text-md text-gray-400 font-semibold mt-1">
                        Administra infracciones pendientes de liberación en campo
                    </p>
                </div>

                <div className="flex flex-col flex-1  min-h-0 max-w-7xl mx-auto w-full ">
                    <TablaDepInfracciones data={data} />
                </div>
            </div>

        </section>
    );
}
