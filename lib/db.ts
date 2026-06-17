// 1. CARGAR VARIABLES DE ENTORNO MANUALMENTE ANTES DE QUE SE INICIALICE EL POOL
import * as dotenv from "dotenv";
import * as path from "path";

// Esto busca tu archivo .env.local en la raíz y carga las variables en process.env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import { Pool } from "pg";

declare global {
  // Evita duplicación en dev
  var pgPool: Pool | undefined;
}

export const POOL_PG =
  global.pgPool ??
  new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false,
    max: 10, // opcional pero recomendable
  });

if (process.env.NODE_ENV !== "production") {
  global.pgPool = POOL_PG;
}
