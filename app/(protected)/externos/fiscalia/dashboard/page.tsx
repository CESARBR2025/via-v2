
import TablaFiscalia from "@/features/fiscalia/components/TablaFiscalia";

export default async function FiscaliaPage() {
    const baseUrl =
        process.env.NODE_ENV === 'production'
            ? 'https://via-v2.vercel.app'
            : 'http://localhost:3000';

    const res = await fetch(
        `${baseUrl}/api/fiscalia/listar`,
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
                    Vinculados a Fiscalia
                </h1>
                <p className="text-[14px] text-[#64748B] mt-1 mb-6">
                    Infractores vinculados a proceso interno
                </p>
            </div>

            <div className="flex flex-col flex-1 min-h-0">
                <TablaFiscalia data={data} />
            </div>
        </div>
    );
}
