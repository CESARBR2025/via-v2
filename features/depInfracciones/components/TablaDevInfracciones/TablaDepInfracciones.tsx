'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CardTable from '@/features/sidebar/components/CardTable';
import { useTableInfracciones } from './hooks/useInfracciones';
import { TablaInfraccionesHeader } from './components/TBInfHeader';
import { TablaInfraccionesSearch } from './components/TbInfSearch';
import { TablaInfracciones } from './components/TbInfracciones';
import { TablaInfraccionesFooter } from './components/TBInfFooter';
// Asegúrate de que el modal acepte la prop 'onRefresh' en su interfaz de TypeScript
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
    console.log(data)
    const rows = data.data;

    // Hook personalizado para el filtrado y búsqueda en la tabla global
    const {
        searchGlobal,
        setSearchGlobal,
        filteredRows
    } = useTableInfracciones(rows);

    // Estados para controlar el comportamiento del Modal
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [detalle, setDetalle] = useState<InfraccionDetalle | null>(null);

    /**
     * FLUJO DE DATOS PRINCIPAL (Función Unificada):
     * Sirve tanto para abrir el modal por primera vez, como para reactualizar
     * los datos desde el hijo (refetch) cuando este registre cambios en la BD.
     */
    async function refetchDetalle(id: string) {
        console.log(id)
        setLoading(true);
        try {
            const res = await fetch(`/api/depInfracciones/detalleInfraccion/${id}`);
            if (!res.ok) throw new Error('Error al obtener el detalle de la infracción');

            const json = await res.json();
            setDetalle(json.data);
            console.log(detalle)

        } catch (error) {
            console.error("Error en el refetch:", error);
        } finally {
            setLoading(false);
        }
    }

    /**
     * Manejador exclusivo de la acción de la tabla al dar click en "Ver Detalle"
     */
    async function handleOpenDetalle(id: string) {
        console.log(id)
        setOpen(true);       // 1. Abrimos el modal inmediatamente para mejorar UX (muestra esqueleto/spinner)
        setDetalle(null);    // 2. Limpiamos residuo anterior si existiera
        await refetchDetalle(id); // 3. Traemos los datos frescos
    }

    // Efecto de desarrollo para monitorear los cambios de estado
    useEffect(() => {
        if (detalle) {
            console.log("🔄 El estado 'detalle' se actualizó con éxito:", detalle);
        }
    }, [detalle]);

    return (
        <CardTable>
            {/* Cabecera de la tabla */}
            <TablaInfraccionesHeader
                count={filteredRows.length}
                total={data.total}
            />

            {/* Input de Búsqueda */}
            <TablaInfraccionesSearch
                value={searchGlobal}
                onChange={setSearchGlobal}
                onClear={() => setSearchGlobal("")}
            />

            {/* Cuerpo de la Tabla - Al disparar onOpen se ejecuta la apertura y fetch inicial */}
            <TablaInfracciones
                rows={filteredRows}
                onOpen={handleOpenDetalle}
            />

            {/* Paginador / Footer */}
            <TablaInfraccionesFooter
                count={filteredRows.length}
                page={data.page}
            />

            {/* MODAL DE DETALLES (El Hijo) */}
            {/* MODAL DE DETALLES (Solo se renderiza si 'open' es true) */}
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