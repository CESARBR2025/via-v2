import z from "zod";

export const envSchema = z.object({
  // Base de datos
  DB_HOST: z.string().min(1, "DB_HOST no fue cargado"),
  DB_PORT: z.string().min(1, "DB_PORT no fue cargado"),
  DB_NAME: z.string().min(1, "DB_NAME no fue cargado"),
  DB_USER: z.string().min(1, "DB_USER no fue cargado"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD no fue cargado"),

  // CUS  VALIDA_CUS_URL: z.string().min(1, "VALIDA_CUS_URL no fue cargado"),
  GET_USERINFO_URL: z.string().min(1, "GET_USERINFO_URL no fue cargado"),
  X_API_KEY: z.string().min(1, "X_API_KEY no fue cargado"),

  //Secretos
  JWT_SECRET_COOKIE: z
    .string()
    .min(15, "El secreto de cookies no fue cargado123"),

  // SMTP
  SMTP_HOST: z.string().min(1, "SMTP_HOST no fue cargado"),
  SMTP_PORT: z.string().min(1, "SMTP_PORT no fue cargado"),
  SMTP_USER: z.string().min(1, "SMTP_USER no fue cargado"),
  SMTP_PASS: z.string().min(1, "SMTP_PASS no fue cargado"),
});

// Esto analiza process.env y si falta algo, rompe la app inmediatamente con un error explícito
export const env = envSchema.parse(process.env);

// Tip extra de seguridad:
// Esto asegura que si accidentalmente importas este archivo en el cliente,
// falle inmediatamente en el build avisándote del peligro de filtración.
if (typeof window !== "undefined") {
  throw new Error(
    "¡Seguridad! No puedes importar las variables de entorno del servidor en el cliente.",
  );
}
