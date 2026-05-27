import TablaDepInfracciones from "@/features/depInfracciones/components/TablaDepInfracciones";


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
        <section className="flex flex-col h-dvh overflow-hidden px-8 ">

            {/* Tabla */}
            <div
                className="flex flex-col flex-1 overflow-hidden 
                          min-h-0  max-w-7xl mx-auto w-full pb-8"
            >
                <TablaDepInfracciones data={data} />
            </div>
        </section>
    );
}
