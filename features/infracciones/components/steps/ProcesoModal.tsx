export function ProcesoModal({ estado, mensaje }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">

                {estado !== 'completado' && (
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                )}

                {estado === 'completado' && (
                    <div className="text-green-600 text-2xl mb-2">✓</div>
                )}

                <p className="text-gray-700">{mensaje}</p>
            </div>
        </div>
    );
}