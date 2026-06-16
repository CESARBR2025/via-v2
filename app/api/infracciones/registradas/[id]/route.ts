import { NextRequest, NextResponse } from "next/server";
import { InfraccionesService } from "@/features/infracciones/service";
import { actualizarOrdenPago } from "@/features/saSiete/services";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  console.log(id);

  try {
    let infraccion = await InfraccionesService.obtenerPorId(id);
    console.log(infraccion);

    if (!infraccion) {
      return NextResponse.json(
        {
          ok: false,
          message: "Infracción no encontrada",
        },
        { status: 404 },
      );
    }

    // =====================================================
    // FECHAS
    // =====================================================

    const fechaActual = new Date();
    const fechaLimiteDescuento = infraccion.fecha_limite_descuento
      ? new Date(infraccion.fecha_limite_descuento)
      : null;
    const fechaVencimientoOrden = infraccion.fecha_vencimiento
      ? new Date(infraccion.fecha_vencimiento)
      : null;

    // =====================================================
    // REGENERAR ORDEN
    // =====================================================

    const regenerarOrden = async (sinDescuento: boolean) => {
      const response = await actualizarOrdenPago({
        infraccion_id: infraccion.id,

        nombre_usuario: infraccion.nombreInfractor!,

        apellidos_usuario: `${infraccion.apellidoPaternoInfractor ?? ""} ${
          infraccion.apellidoMaternoInfractor ?? ""
        }`.trim(),

        concepto_id: infraccion.concepto_id,

        folio: infraccion.folio,

        ...(sinDescuento && {
          cantidad: 1,
        }),
      });

      infraccion = {
        ...infraccion,

        orden_pago_id: response.data.orden_pago_id,

        url_pago: response.data.url_pago,

        fecha_vencimiento: response.data.fecha_vencimiento,

        total_pesos: response.data.total_pesos,

        total_umas: response.data.total_umas,
      };
    };

    // =====================================================
    // LOGICA DE NEGOCIO
    // =====================================================

    if (fechaVencimientoOrden && infraccion.estatusPago !== "P") {
      const descuentoVencido = fechaLimiteDescuento
        ? fechaActual > fechaLimiteDescuento
        : false;
      const ordenVencida = fechaActual > fechaVencimientoOrden;

      // Prioridad 1:
      // Si el descuento venció, la orden actual deja de servir.
      // Debe generarse una nueva SIN descuento.
      if (descuentoVencido) {
        console.log("⚠️ Descuento vencido, regenerando orden sin descuento...");

        await regenerarOrden(true);
      }

      // Prioridad 2:
      // Sólo si el descuento sigue vigente,
      // validar la vigencia de la orden.
      else if (ordenVencida) {
        console.log(
          "⚠️ Orden vencida, regenerando orden conservando descuento...",
        );

        await regenerarOrden(false);
      }
    }

    // =====================================================
    // RESPONSE
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
