/**
 * Reglas y textos fijos del envío cotizado (P0-B3). Sin tarifas: el valor de
 * cada envío lo cotiza VALENCIANO manualmente con la transportadora
 * (npm run admin:quote) y el cliente lo acepta antes de pagar.
 *
 * Sin imports a propósito: también lo usan los scripts de scripts/admin/,
 * que Node ejecuta sin compilar.
 */

export type DeliveryMode = "domicilio" | "oficina";

export const DELIVERY_MODES: readonly DeliveryMode[] = ["domicilio", "oficina"];

export const DELIVERY_MODE_LABELS: Record<DeliveryMode, string> = {
  domicilio: "Entrega en tu dirección",
  oficina: "Recoger en oficina de la transportadora",
};

/** Transportadora habitual — no obligatoria: el cliente puede pedir otra. */
export const DEFAULT_CARRIER = "Inter Rapidísimo";

/** Vigencia de cada cotización, contada desde shipping_quoted_at. */
export const QUOTE_VALIDITY_HOURS = 48;

/** Plazo comprometido para cotizar (texto; no hay horario formalizado). */
export const QUOTE_RESPONSE_TIME_COPY =
  "Te confirmaremos el valor del envío en máximo 1 día hábil.";

export const MAX_CARRIER_PREFERENCE_LENGTH = 60;
export const MAX_PICKUP_OFFICE_LENGTH = 120;
export const MAX_QUOTE_NOTE_LENGTH = 300;

/** Zona horaria en la que se muestran fechas al cliente y en los scripts. */
export const DISPLAY_TIME_ZONE = "America/Bogota";

export function formatDateTimeCO(date: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: DISPLAY_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
