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
const selectBase = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400";
const selectError = "w-full rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500";

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