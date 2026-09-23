import {
  DELIVERY_MODES,
  MAX_CARRIER_PREFERENCE_LENGTH,
  MAX_PICKUP_OFFICE_LENGTH,
  type DeliveryMode,
} from "@/data/shipping";
import type { DeliveryFieldErrors } from "./types";

export interface ValidatedDelivery {
  deliveryMode: DeliveryMode;
  city: string;
  /** null en oficina (nunca una dirección de relleno) o si se conserva la registrada. */
  address: string | null;
  addressLine2: string | null;
  pickupOfficePreference: string | null;
  carrierPreference: string | null;
  /** Solo domicilio: conservar la dirección ya guardada en el pedido. */
  keepRegisteredAddress: boolean;
}

function optionalText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\s+/g, " ");
  return trimmed === "" ? null : trimmed;
}

/**
 * Valida los datos de envío según la modalidad — server-side, compartido por
 * createOrder y "Solicitar otra opción de envío".
 *
 * - domicilio: ciudad y dirección obligatorias; apto opcional.
 * - oficina: ciudad obligatoria; oficina/sede preferida opcional; dirección y
 *   apto se descartan (se guardan como NULL).
 */
export function validateDelivery(
  raw: {
    deliveryMode: unknown;
    city: unknown;
    address?: unknown;
    addressLine2?: unknown;
    pickupOfficePreference?: unknown;
    carrierPreference?: unknown;
    keepRegisteredAddress?: unknown;
  },
  opts: { allowKeepRegisteredAddress?: boolean } = {},
):
  | { ok: true; value: ValidatedDelivery }
  | { ok: false; fieldErrors: DeliveryFieldErrors } {
  const fieldErrors: DeliveryFieldErrors = {};

  const deliveryMode = DELIVERY_MODES.includes(raw.deliveryMode as DeliveryMode)
    ? (raw.deliveryMode as DeliveryMode)
    : null;
  if (!deliveryMode) fieldErrors.deliveryMode = "Elige cómo quieres recibir tu pedido.";

  const city = optionalText(raw.city);
  if (!city) fieldErrors.city = "Ingresa tu ciudad.";

  const carrierPreference = optionalText(raw.carrierPreference);
  if (
    carrierPreference &&
    carrierPreference.length > MAX_CARRIER_PREFERENCE_LENGTH
  ) {
    fieldErrors.carrierPreference = `Máximo ${MAX_CARRIER_PREFERENCE_LENGTH} caracteres.`;
  }

  let address: string | null = null;
  let addressLine2: string | null = null;
  let pickupOfficePreference: string | null = null;
  let keepRegisteredAddress = false;

  if (deliveryMode === "domicilio") {
    keepRegisteredAddress =
      opts.allowKeepRegisteredAddress === true &&
      raw.keepRegisteredAddress === true;
    if (!keepRegisteredAddress) {
      address = optionalText(raw.address);
      addressLine2 = optionalText(raw.addressLine2);
      if (!address) fieldErrors.address = "Ingresa tu dirección de envío.";
    }
  } else if (deliveryMode === "oficina") {
    pickupOfficePreference = optionalText(raw.pickupOfficePreference);
    if (
      pickupOfficePreference &&
      pickupOfficePreference.length > MAX_PICKUP_OFFICE_LENGTH
    ) {
      fieldErrors.pickupOfficePreference = `Máximo ${MAX_PICKUP_OFFICE_LENGTH} caracteres.`;
    }
  }

  if (Object.keys(fieldErrors).length > 0 || !deliveryMode || !city) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    value: {
      deliveryMode,
      city,
      address,
      addressLine2,
      pickupOfficePreference,
      carrierPreference,
      keepRegisteredAddress,
    },
  };
}
