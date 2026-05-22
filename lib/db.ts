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
