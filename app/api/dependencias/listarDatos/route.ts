import { NextResponse } from "next/server";
import { DepInfraccionesService } from "@/features/depInfracciones/service";

export async function GET(req: Request) {
  try {
    console.log("=== API: Entró al endpoint unificado ===");

    // 1. Extraemos los Query Parms usando la URL de la petición (req.url)
    const { searchParams } = new URL(req.url);
    console.log(searchParams);
    // 2. Obtenemos el valor de 'dependencia' y lo casteamos al tipo estricto
    const dependencia = searchParams.get("dependencia") as
      | "FISCALIA"
      | "JUZGADO"
      | "LIBERACIONES"
      | "MW"
      | "MEJIA"
      | "INFRACCIONES";

    console.log(dependencia);
    // Opcionales: por si mandas filtros de fechas en el futuro
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    // 3. Validación de seguridad: si no mandan la dependencia, devolvemos error 400
    if (!dependencia) {
      return NextResponse.json(
        { error: "El parámetro 'dependencia' es requerido." },
        { status: 400 },
      );
    }

    console.log(`Buscando datos para la dependencia: ${dependencia}`);

    // 4. Adaptamos tu servicio para que acepte los parámetros y los herede al repositorio
    const result =
      await DepInfraccionesService.listarInfraccionesGenerica(dependencia);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error en el endpoint GET dependencias:", error);
    console.log("error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
