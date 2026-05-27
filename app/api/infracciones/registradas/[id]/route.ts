import { NextRequest, NextResponse } from "next/server";
import { InfraccionesService } from "@/features/infracciones/service";
import { actualizarOrdenPago } from "@/features/saSiete/services";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  console.log("entro");
  console.log(id);
  try {
    let infraccion = await InfraccionesService.obtenerPorId(id);
    console.log(infraccion);

    // =====================================================
    // VALIDAR FECHA
    // =====================================================

    const fechaActual = new Date();

    if (!infraccion.fecha_vencimiento) {
      throw new Error("La infracción no tiene fecha de vencimiento");
    }

    const fechaVencimiento = new Date(infraccion.fecha_vencimiento);

    const ordenVencida = fechaVencimiento < fechaActual;
    console.log(ordenVencida);

    // =====================================================
    // REGENERAR ORDEN
    // =====================================================

    if (ordenVencida && infraccion.estatus !== "P") {
      console.log("⚠️ Orden vencida, regenerando...");

      console.log(infraccion.id);
      console.log(infraccion.nombreInfractor);
      console.log(infraccion.concepto_id);
      console.log(infraccion.folio);
      const responseActualizarOrden = await actualizarOrdenPago({
        infraccion_id: infraccion.id,

        nombre_usuario: infraccion.nombreInfractor!,

        apellidos_usuario:
          `${infraccion.apellidoPaternoInfractor} ${infraccion.apellidoMaternoInfractor}`.trim(),

        concepto_id: infraccion.concepto_id,

        folio: infraccion.folio,
      });

      console.log(responseActualizarOrden);

      // =========================================
      // SOBRESCRIBIR CAMPOS ACTUALES
      // =========================================
      console.log("Add new data into infraccion object...");

      infraccion = {
        ...infraccion,

        orden_pago_id: responseActualizarOrden.data.orden_pago_id,

        url_pago: responseActualizarOrden.data.url_pago,

        fecha_vencimiento: responseActualizarOrden.data.fecha_vencimiento,

        total_pesos: responseActualizarOrden.data.total_pesos,

        total_umas: responseActualizarOrden.data.total_umas,
      };
    }

    console.log("done");

    // =====================================================
    // RESPONSE NORMAL
    // =====================================================

    return NextResponse.json({
      ok: true,
      data: infraccion,
    });
  } catch (error) {
    console.error("[API][INFRACCIONES][GET]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al obtener infracción",
      },
      { status: 500 },
    );
  }
}
