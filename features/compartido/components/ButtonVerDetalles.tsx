'use client';

import { Eye } from 'lucide-react';

interface BotonVerDetalleProps {
    idInfraccion: string;
    onOpenDetalle: (id: string) => void;
}

export function BotonVerDetalle({ idInfraccion, onOpenDetalle }: BotonVerDetalleProps) {
    return (
        <button
            onClick={() => onOpenDetalle(idInfraccion)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
        >
            <Eye size={14} className="text-slate-400" />
            Ver detalle
        </button>
    );
}