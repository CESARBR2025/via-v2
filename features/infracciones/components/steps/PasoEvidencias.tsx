import React from 'react';
import { Card } from '../ui/Card';
import { CardTitle } from '../ui/CardTitle';
import { useInfraccionStore } from '@/stores/useInfraccionStore';

interface PasoEvidenciasProps {
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    loading?: boolean;
}

export const PasoEvidencias: React.FC<PasoEvidenciasProps> = ({
    files,
    setFiles,
    loading = false,
}) => {
    // normalización segura (evita null)
    const datos = useInfraccionStore((s) => s.datos);
    const actualizarDatos = useInfraccionStore((s) => s.actualizarDatos);

    const agregarEvidencia = datos.agregarEvidencia === true;

    return (
        <Card>
            <CardTitle>Evidencias fotográficas</CardTitle>

            <p className="text-sm text-slate-500 mb-5">
                Las fotografías son opcionales pero fortalecen el expediente de infracción.
            </p>

            {/* Toggle */}
            <label
                className={`
                    flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 w-fit
                    ${agregarEvidencia ? 'border-[#3071E7] bg-blue-50' : 'border-slate-200 hover:border-slate-300'}
                `}
            >
                <div
                    className={`
                        w-10 h-6 rounded-full relative transition-all duration-300
                        ${agregarEvidencia ? 'bg-[#3071E7]' : 'bg-slate-300'}
                    `}
                >
                    <div
                        className={`
                            absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300
                            ${agregarEvidencia ? 'left-5' : 'left-1'}
                        `}
                    />
                </div>

                <input
                    type="checkbox"
                    checked={agregarEvidencia}
                    onChange={(e) =>
                        actualizarDatos({
                            agregarEvidencia: e.target.checked,
                        })
                    }

                    className="sr-only"
                />

                <span className="text-sm font-medium text-slate-700">
                    Agregar evidencia fotográfica
                </span>
            </label>

            {/* Upload */}
            {agregarEvidencia && (
                <div className="mt-5 animate-fadeIn">
                    <label
                        className="
                            flex flex-col items-center justify-center gap-3 p-8
                            border-2 border-dashed border-slate-300 rounded-xl
                            hover:border-[#0076aa] hover:bg-blue-50/30
                            cursor-pointer transition-all duration-200
                        "
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-[#0076aa]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                                />
                            </svg>
                        </div>

                        <div className="text-center">
                            <p className="text-sm font-semibold text-[#0076aa]">
                                Seleccionar fotografías
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                PNG, JPG o HEIC · Múltiples archivos permitidos
                            </p>
                        </div>

                        <input
                            disabled={loading}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files) {
                                    setFiles(Array.from(e.target.files));
                                }
                            }}
                            className="sr-only"
                        />
                    </label>

                    {/* Files */}
                    {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                {files.length} archivo(s) seleccionado(s)
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {files.map((f, i) => (
                                    <span
                                        key={`${f.name}-${i}`}
                                        className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-[#0076aa] border border-blue-200 px-3 py-1.5 rounded-full"
                                    >
                                        {f.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

export default PasoEvidencias;