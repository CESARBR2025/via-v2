import CorralonMejiaTable from "@/features/corralon-mejia/components/CorralonMejiaTable";

export default async function MejiaPage() {
    const dependenciaClave = "MEJIA";

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
                <CorralonMejiaTable respuestaServidor={respuestaApi} />
            </div>
        </div>
    );
}
