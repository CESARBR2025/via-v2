import React from 'react';
import { SeccionGarantia } from './SeccionGarantia';
import { SeccionMotivo } from './SeccionMotivo';





interface PasoInfraccionProps {
    articulos: any[];
    cargandoArticulos: boolean;
    loading: boolean;
    fieldError: (val: any) => boolean;
}

const selectBase = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15 disabled:bg-slate-50 disabled:text-slate-400";
const selectError = "w-full rounded-lg border border-red-400 bg-red-50 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/15";

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