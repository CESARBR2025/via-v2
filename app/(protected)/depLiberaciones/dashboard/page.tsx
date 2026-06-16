import LiberacionesTable from "@/features/liberaciones/components/LiberacionesTable";

export default async function LiberacionesPage() {
    const dependenciaClave = "LIBERACIONES";

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
                <LiberacionesTable
                    respuestaServidor={respuestaApi}
                />
            </div>
        </div>
    );
}