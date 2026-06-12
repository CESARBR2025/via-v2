import { NextRequest, NextResponse } from "next/server";
import { procesarSubidaDocumentos } from "@/features/ciudadano/services/subirDocumentos";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const data = await procesarSubidaDocumentos(formData, {
      estatus: "REGISTRADA",
      estatus_dependencia: "MESA_DE_CONTROL_REVISION",
    });

    return NextResponse.json(
      {
        message: "Documentos guardados correctamente",
        data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[CIUDADANO][SUBIR DOCUMENTOS INFRACCION]", error);

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 },
    );
  }
}
