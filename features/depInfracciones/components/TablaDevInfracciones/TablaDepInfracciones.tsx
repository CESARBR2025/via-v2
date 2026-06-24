'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SearchX } from 'lucide-react';
import { useTableInfracciones } from './hooks/useInfracciones';
import { TablaInfraccionesSearch } from './components/TbInfSearch';
import { TablaInfracciones } from './components/TbInfracciones';
import { TablaInfraccionesFooter } from './components/TBInfFooter';
import { DetalleInfraccionModal, type InfraccionDetalle } from './DetalleInfraccionModal';

type Infraccion = {
    id: string;
    folio: string;
    estatus: string;
    placa: string | null;
    created_at: string;
};

type Props = {
    data: {
        data: Infraccion[];
        page: number;
        limit: number;
        total: number;
    };
};

export default function TablaDepInfracciones({ data }: Props) {
    const rows = data.data;

    const { searchGlobal, setSearchGlobal, filteredRows } = useTableInfracciones(rows);

    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [detalle, setDetalle] = useState<InfraccionDetalle | null>(null);

    async function refetchDetalle(id: string) {
        setLoading(true);
        try {
            const res = await fetch(`/api/depInfracciones/detalleInfraccion/${id}`);
            if (!res.ok) throw new Error('Error al obtener el detalle de la infracción');
            const json = await res.json();
            setDetalle(json.data);
        } catch (error) {
            console.error('Error en el refetch:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleOpenDetalle(id: string) {
        setOpen(true);
        setDetalle(null);
        await refetchDetalle(id);
    }

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-white border border-slate-200 rounded-xl shadow-card">
            <TablaInfraccionesSearch value={searchGlobal} onChange={setSearchGlobal} onClear={() => setSearchGlobal('')} />

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full">
                {filteredRows.length > 0 ? (
                    <TablaInfracciones rows={filteredRows} onOpen={handleOpenDetalle} />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                            <SearchX size={22} className="text-slate-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900">Sin infracciones encontradas</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {searchGlobal ? 'Intenta con otro término de búsqueda.' : 'No hay infracciones pendientes.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <TablaInfraccionesFooter count={filteredRows.length} page={data.page} total={data.total} />

            <DetalleInfraccionModal
                isOpen={open}
                onClose={() => {
                    setOpen(false)
                    router.refresh()
                }}
                loading={loading}
                detalle={detalle}
            />
        </div>
    );
}
