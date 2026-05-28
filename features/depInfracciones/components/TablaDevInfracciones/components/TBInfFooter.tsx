export function TablaInfraccionesFooter({ count, page }: any) {
    return (
        <div className="px-6 py-3.5 border-t border-[#EAF1FC] bg-[#FAFBFF] text-[12px] text-[#8A96B0] flex justify-between items-center font-medium">
            <span>Mostrando {count} registros</span>
            <span className="bg-[#EAF1FC] text-[#6B778C] px-2 py-0.5 rounded-md text-[11px]">
                Página {page}
            </span>
        </div>

    );
}