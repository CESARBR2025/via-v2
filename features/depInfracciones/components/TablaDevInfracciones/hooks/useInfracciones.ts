import { useMemo, useState } from "react";

export function useTableInfracciones(rows: any[]) {
  const [searchGlobal, setSearchGlobal] = useState("");

  const filteredRows = useMemo(() => {
    if (!searchGlobal.trim()) return rows;

    const q = searchGlobal.toLowerCase();

    return rows.filter(
      (r) =>
        r.folio.toLowerCase().includes(q) ||
        r.placa?.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q),
    );
  }, [rows, searchGlobal]);

  return {
    searchGlobal,
    setSearchGlobal,
    filteredRows,
  };
}
