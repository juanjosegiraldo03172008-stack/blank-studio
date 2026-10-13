/**
 * Límite de frecuencia simple en memoria, sin servicios externos — frena
 * abuso evidente del formulario de pedido (envíos repetidos en poco tiempo
 * desde el mismo origen). No es una defensa exhaustiva: vive por instancia
 * de servidor, así que en un entorno con varias instancias concurrentes el
 * límite real efectivo puede ser más alto que el configurado aquí. Para el
 * riesgo actual (sin evidencia de abuso, tienda pequeña) es proporcional —
 * evita escalar a un servicio externo mientras no haga falta.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

/** @returns true si la solicitud se permite; false si se superó el límite. */
export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);

  // Poda ocasional para no crecer sin límite en una instancia de vida larga.
  if (hits.size > 10_000) {
    for (const [k, timestamps] of hits) {
      if (timestamps.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return true;
}
