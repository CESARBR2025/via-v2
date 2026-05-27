export default function Loading() {
    return (
        <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 max-w-md w-full">

                <div className="flex flex-col items-center text-center">

                    {/* Spinner */}
                    <div className="
            w-14 h-14
            border-4 border-slate-200
            border-t-[#0b3b60]
            rounded-full
            animate-spin
          " />

                    <h2 className="mt-6 text-xl font-black text-slate-800">
                        Consultando infracción
                    </h2>

                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                        Estamos verificando el estado de la orden de pago.
                        Esto puede tardar unos segundos.
                    </p>

                </div>

            </div>

        </main>
    );
}