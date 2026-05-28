'use client';

import { useMemo, useState } from 'react';
import { Eye, Search, X, FileText, Layers } from 'lucide-react';
// IMPORTANTE: Ajusta la ruta de importación según dónde guardaste el archivo del modal
import { ModalDetalleInfraccion } from './ModalDetallesInfraccion';
import CardTable from '@/features/sidebar/components/CardTable';
import { useTableInfracciones } from './hooks/useInfracciones';
import { TablaInfraccionesHeader } from './components/TBInfHeader';
import { TablaInfraccionesSearch } from './components/TbInfSearch';
import { TablaInfracciones } from './components/TbInfracciones';
import { TablaInfraccionesFooter } from './components/TBInfFooter';

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

    const {
        searchGlobal,
        setSearchGlobal,
        filteredRows
    } = useTableInfracciones(rows);

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [detalle, setDetalle] = useState(null);

    async function handleOpenDetalle(id: string) {
        setOpen(true);
        setLoading(true);
        setDetalle(null);

        try {
            const res = await fetch(`/api/depInfracciones/detalleInfraccion/${id}`);
            const json = await res.json();

            setDetalle(json.data);
            console.log(detalle)
        } finally {
            setLoading(false);
        }
    }

    return (
        <CardTable>
            <TablaInfraccionesHeader
                count={filteredRows.length}
                total={data.total}
            />

            <TablaInfraccionesSearch
                value={searchGlobal}
                onChange={setSearchGlobal}
                onClear={() => setSearchGlobal("")}
            />

            <TablaInfracciones
                rows={filteredRows}
                onOpen={handleOpenDetalle}
            />

            <TablaInfraccionesFooter
                count={filteredRows.length}
                page={data.page}
            />

            <ModalDetalleInfraccion
                isOpen={open}
                onClose={() => setOpen(false)}
                loading={loading}
                detalle={detalle}
            />
        </CardTable>
    );
}