// Utilidades de los scripts administrativos (P0-B3). Se ejecutan con Node
// >= 22.6 sin compilar (npm run admin:*), desde un entorno seguro con
// DATABASE_URL como secret. Nunca imprimen DATABASE_URL.

import { existsSync } from "node:fs";
import pg from "pg";

/** Carga .env* sin sobrescribir variables ya definidas (mismo orden que Next en producción). */
export function loadEnv(): void {
  for (const file of [
    ".env.production.local",
    ".env.local",
    ".env.production",
    ".env",
  ]) {
    if (existsSync(file)) process.loadEnvFile(file);
  }
}

export function createPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error(
      "Falta DATABASE_URL en el entorno. Configúrala como secret (no se muestra ni se guarda en el repositorio).",
    );
    process.exit(1);
  }
  return new pg.Pool({ connectionString, max: 2 });
}

export function formatCOP(value: number): string {
  return `$${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value)}`;
}

/**
 * Describe un error sin filtrar datos de conexión: solo el código y, si
 * aplica, la restricción de la base de datos que lo rechazó.
 */
export function describeError(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as { code?: string; constraint?: string };
    if (e.constraint) return `rechazado por la restricción ${e.constraint} (código ${e.code})`;
    if (e.code) return `código ${e.code}`;
  }
  return "error desconocido";
}

export function hoursSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 3_600_000);
}
