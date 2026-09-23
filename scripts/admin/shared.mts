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

// ---------------------------------------------------------------------------
// P0-B4a — utilidades de admin:paid y admin:ship.

export function exitWith(message: string): never {
  console.error(message);
  process.exit(1);
}

/** Espacios normalizados; "" → null. */
export function cleanText(value: string | undefined): string | null {
  const v = (value ?? "").trim().replace(/\s+/g, " ");
  return v === "" ? null : v;
}

/** Para comparar nombres de transportadora sin distinguir mayúsculas/tildes/espacios. */
export function foldText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Heurística anti-datos bancarios en notas: 8 o más dígitos seguidos (con o
 * sin espacios/guiones) parecen un número de cuenta o de tarjeta.
 */
export function looksLikeAccountNumber(text: string): boolean {
  return /\d(?:[\s-]?\d){7,}/.test(text);
}

/**
 * Confirmación fuerte: hay que escribir EXACTAMENTE el número del pedido. Se
 * pide fuera de cualquier transacción (nunca se espera a una persona con un
 * bloqueo abierto).
 */
export async function confirmByTyping(
  orderNumber: string,
  prompt: string,
): Promise<boolean> {
  const { createInterface } = await import("node:readline/promises");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl
    .question(`\n${prompt}\nEscribe exactamente ${orderNumber} para confirmar: `)
    .catch(() => "");
  rl.close();
  return answer.trim() === orderNumber;
}

/** Origen público para el enlace del pedido (SITE_URL); nunca se inventa un dominio. */
export function siteOrigin(): { origin: string | null; warning: string | null } {
  const raw = process.env.SITE_URL?.trim();
  if (!raw) {
    return {
      origin: null,
      warning:
        "SITE_URL no está configurada: se muestra solo la ruta. Configúrala con el origen público del sitio (p. ej. https://tu-dominio).",
    };
  }
  try {
    const u = new URL(raw);
    const okProtocol = u.protocol === "https:" || u.protocol === "http:";
    const bare =
      u.pathname === "/" && !u.search && !u.hash && !u.username && !u.password;
    if (okProtocol && bare) return { origin: u.origin, warning: null };
  } catch {
    // cae al aviso de abajo
  }
  return {
    origin: null,
    warning:
      "SITE_URL no es un origen http(s) válido (solo protocolo y dominio, sin ruta): se muestra solo la ruta.",
  };
}
