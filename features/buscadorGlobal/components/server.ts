import { BuscarInfraccionesResponse } from "../types";

export async function buscarInfracciones(
  placa: string,
): Promise<BuscarInfraccionesResponse> {
  const response = await fetch(
    `/api/buscadorGlobal?placa=${encodeURIComponent(placa)}`,
  );

  if (!response.ok) {
    throw new Error("Error al consultar infracciones");
  }

  return response.json();
}
