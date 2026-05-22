import FormularioInfraccion from "@/features/oficiales/components/FormularioInfraccion";

export default function InfraccionesDashboard() {
    return (
        <section className="flex flex-col h-dvh overflow-hidden  ">
            {/* Tabla */}
            <div className="flex flex-col flex-1 min-h-0 ">
                <FormularioInfraccion />
            </div>
        </section>
    );
}
