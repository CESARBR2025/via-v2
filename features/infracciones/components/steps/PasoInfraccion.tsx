import React from 'react';
import { SeccionGarantia } from './SeccionGarantia';
import { SeccionMotivo } from './SeccionMotivo';





interface PasoInfraccionProps {
    articulos: any[];
    cargandoArticulos: boolean;
    loading: boolean;
    fieldError: (val: any) => boolean;
}

// Clases base reutilizables extraídas del componente anterior
const selectBase = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 disabled:bg-slate-50 disabled:text-slate-400";
const selectError = "w-full rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200/50";

export const PasoInfraccion: React.FC<PasoInfraccionProps> = ({
    articulos,
    cargandoArticulos,
    loading,
    fieldError,
}) => {


    return (
        <div className="space-y-5">
            <SeccionMotivo
                articulos={articulos}
                cargandoArticulos={cargandoArticulos}
                loading={loading}
                fieldError={fieldError}
            />

            <SeccionGarantia
                loading={loading}
                fieldError={fieldError}
                selectBase={selectBase}
                selectError={selectError}
            />
        </div>
    );
};

export default PasoInfraccion;