import { Pool } from "pg";

/**
 * SOLO SERVIDOR. Nunca importar este archivo desde un componente "use
 * client" ni desde código que termine en el bundle del navegador — DATABASE_URL
 * (y la conexión misma) debe permanecer exclusivamente server-side.
 */

declare global {
  var __valencianoPgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL no está definida. Ver README para configurarla en desarrollo (.env.local) o en Vercel.",
    );
  }
  return new Pool({ connectionString, max: 5 });
}

// Next.js recarga módulos en caliente en dev — cachear el pool en globalThis
// evita abrir una conexión nueva por cada recarga y agotar el límite de la DB.
export const pool = globalThis.__valencianoPgPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  globalThis.__valencianoPgPool = pool;
}
