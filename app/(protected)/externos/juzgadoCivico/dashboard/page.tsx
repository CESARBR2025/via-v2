import { getSession } from "@/features/auth/service";
import TablaCompartida from "@/features/compartido/components/TablaCompartida";

export default async function JuzgadoCivicoPage() {
    // 1. Resolvemos la sesión en el Servidor
    // 1. Resolvemos la sesión en el Servidor
    const session = await getSession();
    const roleString = session?.user?.roles?.[0];
    const dependenciaClave = 'JUZGADO'

    // 2. Determinamos la URL base según el entorno
    const baseUrl =
        process.env.NODE_ENV === "production"
            ? "https://via-v2.vercel.app"
            : "http://localhost:3000";

    // 3. Hacemos el fetch a tu API de la fiscalía
    const res = await fetch(
        `${baseUrl}/api/dependencias/listarDatos?dependencia=${dependenciaClave}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Error cargando infracciones de Juzgado");
    }


    const respuestaApi = await res.json();
    console.log(respuestaApi)
    return (
        <div className="flex flex-col h-full">
            <div className="shrink-0">
                <h1 className="text-[22px] font-bold text-[#0F172A]">
                    Vinculados a Juzgado Civico
                </h1>
                <p className="text-[14px] text-[#64748B] mt-1 mb-6">
                    Infractores vinculados a proceso interno
                </p>
            </div>

            <div className="flex flex-col flex-1 min-h-0">
                {/* 4. Pasamos los datos estructurados y el rol del usuario */}
                <TablaCompartida
                    respuestaServidor={respuestaApi}
                    userRole={roleString}
                />
            </div>
        </div>
    );
}