/**
 * Datos PÚBLICOS y fijos de la marca, reutilizables en páginas legales,
 * footer, acuse de pedido y PQR (fases P0-B4 a P0-B6).
 *
 * Aquí NO van datos personales del vendedor (nombre legal, NIT, dirección,
 * teléfono, correo): esos viven solo en variables de entorno LEGAL_* y se
 * leen server-side con src/lib/legal/server.ts.
 */

// Instagram ya tiene su fuente única — se reexporta, no se duplica.
export { INSTAGRAM_HANDLE, INSTAGRAM_DM_URL } from "@/lib/instagramOrder";

/** Nombre comercial de la marca (no es el nombre legal del vendedor). */
export const BRAND_NAME = "VALENCIANO";

/**
 * Autoridad colombiana de protección al consumidor. Ley 1480 de 2011, art. 50,
 * parágrafo: el sitio debe tener un enlace visible a su página.
 */
export const CONSUMER_PROTECTION_AUTHORITY = {
  name: "Superintendencia de Industria y Comercio (SIC)",
  url: "https://www.sic.gov.co",
} as const;
