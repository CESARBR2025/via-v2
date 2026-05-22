/**
 * Este es un Higher-Order Function (una función que recibe otra función).
 * Envolverá tus funciones POST, GET, etc., ejecutándolas dentro de un bloque try/catch.
 *  Si se lanza un error de tipo AppError, devolverá la respuesta estructurada de inmediato;
 *
 */
// src/lib/errors/wrapperError.ts
import { NextResponse } from "next/server";
import { AppError } from "./errors";

// Definimos el tipo de la función que procesa la petición de Next.js
type RouteHandler = (req: Request, ...args: any[]) => Promise<Response>;

/**
 * Wrapper de orden superior para estandarizar las respuestas de error en la API
 */
export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (req: Request, ...args: any[]) => {
    try {
      // Intenta ejecutar el endpoint original
      return await handler(req, ...args);
    } catch (error) {
      // Si el error fue controlado explícitamente por el sistema (AppError)
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            ok: false,
            error: error.message,
            code: error.code,
          },
          { status: error.status },
        );
      }

      // Si es un error desconocido (Crash de base de datos, error de código, etc.)
      console.error("💥 [API_CRITICAL_ERROR]:", error);

      return NextResponse.json(
        {
          ok: false,
          error: "Ocurrió un error interno en el servidor.",
          code: "INTERNAL_SERVER_ERROR",
        },
        { status: 500 },
      );
    }
  };
}
