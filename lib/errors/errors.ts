// src/lib/errors/errors.ts

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const AuthErrors = {
  MISSING_FIELDS: new AppError(
    "Faltan campos obligatorios en la petición.",
    400,
    "AUTH_MISSING_FIELDS",
  ),
  INVALID_CREDENTIALS: new AppError(
    "La CURP o la contraseña son incorrectas.",
    401,
    "AUTH_INVALID_CREDENTIALS",
  ),
  CUS_UNAVAILABLE: new AppError(
    "El servicio externo de validación (CUS) no está disponible temporalmente.",
    503,
    "AUTH_CUS_UNAVAILABLE",
  ),
  SESSION_EXPIRED: new AppError(
    "Su sesión ha expirado. Por favor, vuelva a iniciar sesión.",
    401,
    "AUTH_SESSION_EXPIRED",
  ),
  FORBIDDEN: new AppError(
    "No tienes los permisos necesarios para realizar esta acción.",
    403,
    "AUTH_FORBIDDEN",
  ),
};
