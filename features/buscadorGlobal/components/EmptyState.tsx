export default function EmptyState() {
    return (
        <div
            className="
        w-full
        rounded-3xl
        border
        border-dashed
        border-slate-300
        bg-white
        p-16
        text-center
      "
        >
            <h3 className="text-xl font-semibold">
                No se encontraron infracciones
            </h3>

            <p className="mt-2 text-slate-500">
                Verifica la placa e intenta nuevamente.
            </p>
        </div>
    );
}