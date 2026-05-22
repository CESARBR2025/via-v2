// ============================================================
// ROUTE
// app/api/legalidad/articulos/route.ts
// ============================================================

import { NextResponse } from "next/server";

import { ArticulosService } from "@/features/legalidad/articulos/service";

export async function GET() {
  try {
    const articulos = await ArticulosService.obtenerArticulos();

    return NextResponse.json({
      success: true,
      data: articulos,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Error al consultar artículos",
      },
      {
        status: 500,
      },
    );
  }
}
