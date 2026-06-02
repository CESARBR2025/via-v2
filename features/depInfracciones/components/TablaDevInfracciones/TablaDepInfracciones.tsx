'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileText, SearchX } from 'lucide-react';
import CardTable from '@/features/sidebar/components/CardTable';
import { useTableInfracciones } from './hooks/useInfracciones';
import { TablaInfraccionesHeader } from './components/TBInfHeader';
import { TablaInfraccionesSearch } from './components/TbInfSearch';
import { TablaInfracciones } from './components/TbInfracciones';
import { TablaInfraccionesFooter } from './components/TBInfFooter';
import { InfraccionDetalle, ModalDetalleInfraccionDtoInfracciones } from './ModalDetallesInfraccion';

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
    console.log(detalle)

    async function handleOpenDetalle(id: string) {
        setOpen(true);
        setDetalle(null);
        await refetchDetalle(id);
    }

    useEffect(() => {
        if (detalle) {
            console.log('🔄 El estado detalle se actualizó con éxito:', detalle);
        }
    }, [detalle]);

    return (
        <CardTable className="flex flex-col flex-1 min-h-0 p-0 w-full">
            <TablaInfraccionesHeader count={filteredRows.length} total={data.total} />
            <TablaInfraccionesSearch value={searchGlobal} onChange={setSearchGlobal} onClear={() => setSearchGlobal('')} />

            <div className="flex-1 min-h-0 overflow-y-auto w-full">
                {filteredRows.length > 0 ? (
                    <TablaInfracciones rows={filteredRows} onOpen={handleOpenDetalle} />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1F5F9]">
                            <SearchX size={22} className="text-[#94A3B8]" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-[15px] font-semibold text-[#0F172A]">Sin infracciones encontradas</p>
                            <p className="text-[13px] text-[#64748B] mt-0.5">
                                {searchGlobal ? 'Intenta con otro término de búsqueda.' : 'No hay infracciones pendientes.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <TablaInfraccionesFooter count={filteredRows.length} page={data.page} total={data.total} />

            {open && (
                <ModalDetalleInfraccionDtoInfracciones
                    isOpen={open}
                    onClose={() => {
                        setOpen(false);
                        router.refresh();
                    }}
                    loading={loading}
                    detalle={detalle}
                    onRefresh={detalle ? () => refetchDetalle(detalle.Header.id_infraccion) : undefined}
                />
            )}
        </CardTable>
    );
}
