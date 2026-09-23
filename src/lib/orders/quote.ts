import { pool } from "@/lib/db";
import { validateDelivery } from "./delivery";
import type {
  OrderStatus,
  QuoteActionFailureReason,
  QuoteActionResult,
  QuoteStatus,
} from "./types";

/**
 * P0-B3 — acciones del cliente sobre la cotización de envío. Cada acción es
 * UN solo UPDATE condicionado al estado esperado (mismo patrón que
 * reportPayment): dos clics, dos pestañas o una cotización nueva en paralelo
 * nunca producen una transición doble ni inconsistente. Si el UPDATE no
 * aplica, se lee el estado actual para responder el motivo exacto — o éxito
 * idempotente si la acción ya estaba hecha.
 *
 * Transiciones (quote_status):
 *   quoted  → accepted  (aceptar: misma versión, vigente, no cancelado)
 *   quoted  → rejected  (no acepto: misma versión, no cancelado)
 *   rejected | quoted vencida → pending  (solicitar otra opción de envío)
 *   pending | quoted | rejected → order_status = cancelled  (cancelar)
 * Desde accepted no hay cancelación autoservicio (el cliente podría haber
 * transferido sin reportarlo aún): se atiende por soporte.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MESSAGES: Record<QuoteActionFailureReason, string> = {
  not_found: "Pedido no encontrado.",
  not_quote_flow: "Este pedido no usa cotización de envío.",
  cancelled: "Esta solicitud fue cancelada.",
  quote_changed:
    "La cotización cambió mientras la revisabas. Revisa la información actualizada.",
  expired: "La cotización venció. Solicita una nueva cotización.",
  not_allowed:
    "Esta acción ya no está disponible para el estado actual del pedido.",
  invalid: "Revisa los campos marcados.",
  error: "No pudimos completar la acción. Intenta de nuevo en unos segundos.",
};

function fail(
  reason: QuoteActionFailureReason,
  error: string = MESSAGES[reason],
): QuoteActionResult {
  return { ok: false, reason, error };
}

interface CurrentState {
  quoteStatus: QuoteStatus | null;
  quoteVersion: number;
  orderStatus: OrderStatus;
  paymentStatus: string;
  expired: boolean;
  acceptedQuoteVersion: number | null;
  hasAddress: boolean;
}

async function readState(orderId: string): Promise<CurrentState | null> {
  const res = await pool.query<CurrentState>(
    `SELECT quote_status AS "quoteStatus",
            quote_version AS "quoteVersion",
            order_status AS "orderStatus",
            payment_status AS "paymentStatus",
            COALESCE(shipping_quote_expires_at <= now(), false) AS expired,
            accepted_quote_version AS "acceptedQuoteVersion",
            (address IS NOT NULL) AS "hasAddress"
     FROM orders WHERE id = $1`,
    [orderId],
  );
  return res.rows[0] ?? null;
}

function validIds(orderId: unknown, quoteVersion?: unknown): boolean {
  if (typeof orderId !== "string" || !UUID_RE.test(orderId)) return false;
  if (quoteVersion === undefined) return true;
  return (
    typeof quoteVersion === "number" &&
    Number.isInteger(quoteVersion) &&
    quoteVersion >= 0
  );
}

function logError(action: string, err: unknown) {
  // Nunca datos del cliente — solo el mensaje técnico, server-side.
  console.error(
    `${action} falló:`,
    err instanceof Error ? err.message : "error desconocido",
  );
}

/** quoted → accepted. Guarda la evidencia: hora, versión y valor aceptado. */
export async function acceptQuote(
  orderId: unknown,
  quoteVersion: unknown,
): Promise<QuoteActionResult> {
  if (!validIds(orderId, quoteVersion)) return fail("not_found");
  const id = orderId as string;
  const version = quoteVersion as number;
  try {
    const res = await pool.query<{
      quoteStatus: QuoteStatus;
      orderStatus: OrderStatus;
    }>(
      `UPDATE orders
       SET quote_status = 'accepted',
           accepted_at = now(),
           accepted_quote_version = quote_version,
           accepted_shipping_amount = shipping_quote_amount,
           updated_at = now()
       WHERE id = $1
         AND quote_status = 'quoted'
         AND quote_version = $2
         AND shipping_quote_expires_at > now()
         AND order_status <> 'cancelled'
       RETURNING quote_status AS "quoteStatus", order_status AS "orderStatus"`,
      [id, version],
    );
    if (res.rows[0]) return { ok: true, ...res.rows[0] };

    const s = await readState(id);
    if (!s) return fail("not_found");
    if (s.quoteStatus === null) return fail("not_quote_flow");
    if (s.orderStatus === "cancelled") return fail("cancelled");
    if (s.quoteStatus === "accepted" && s.acceptedQuoteVersion === version) {
      return { ok: true, quoteStatus: "accepted", orderStatus: s.orderStatus };
    }
    if (s.quoteVersion !== version) return fail("quote_changed");
    if (s.quoteStatus === "quoted" && s.expired) return fail("expired");
    return fail("not_allowed");
  } catch (err) {
    logError("acceptQuote", err);
    return fail("error");
  }
}

/** quoted → rejected. NO cancela el pedido. */
export async function rejectQuote(
  orderId: unknown,
  quoteVersion: unknown,
): Promise<QuoteActionResult> {
  if (!validIds(orderId, quoteVersion)) return fail("not_found");
  const id = orderId as string;
  const version = quoteVersion as number;
  try {
    const res = await pool.query<{
      quoteStatus: QuoteStatus;
      orderStatus: OrderStatus;
    }>(
      `UPDATE orders
       SET quote_status = 'rejected', updated_at = now()
       WHERE id = $1
         AND quote_status = 'quoted'
         AND quote_version = $2
         AND order_status <> 'cancelled'
       RETURNING quote_status AS "quoteStatus", order_status AS "orderStatus"`,
      [id, version],
    );
    if (res.rows[0]) return { ok: true, ...res.rows[0] };

    const s = await readState(id);
    if (!s) return fail("not_found");
    if (s.quoteStatus === null) return fail("not_quote_flow");
    if (s.orderStatus === "cancelled") return fail("cancelled");
    if (s.quoteVersion !== version) return fail("quote_changed");
    if (s.quoteStatus === "rejected") {
      return { ok: true, quoteStatus: "rejected", orderStatus: s.orderStatus };
    }
    return fail("not_allowed");
  } catch (err) {
    logError("rejectQuote", err);
    return fail("error");
  }
}

/**
 * rejected | quoted vencida → pending, con los datos de envío que el cliente
 * quiera cambiar. Limpia la cotización anterior; la siguiente cotización
 * sube quote_version e invalida cualquier versión vieja.
 */
export async function requestShippingOption(
  orderId: unknown,
  input: unknown,
): Promise<QuoteActionResult> {
  if (typeof input !== "object" || input === null) return fail("invalid");
  const raw = input as Record<string, unknown>;
  if (!validIds(orderId, raw.quoteVersion)) return fail("not_found");
  const id = orderId as string;
  const version = raw.quoteVersion as number;

  const validation = validateDelivery(
    {
      deliveryMode: raw.deliveryMode,
      city: raw.city,
      address: raw.address,
      addressLine2: raw.addressLine2,
      pickupOfficePreference: raw.pickupOfficePreference,
      carrierPreference: raw.carrierPreference,
      keepRegisteredAddress: raw.keepRegisteredAddress,
    },
    { allowKeepRegisteredAddress: true },
  );
  if (!validation.ok) {
    return {
      ok: false,
      reason: "invalid",
      error: MESSAGES.invalid,
      fieldErrors: validation.fieldErrors,
    };
  }
  const d = validation.value;

  try {
    const res = await pool.query<{
      quoteStatus: QuoteStatus;
      orderStatus: OrderStatus;
    }>(
      `UPDATE orders
       SET quote_status = 'pending',
           delivery_mode = $3,
           city = $4,
           address = CASE
             WHEN $3 = 'oficina' THEN NULL
             WHEN $5::boolean THEN address
             ELSE $6::text END,
           address_line2 = CASE
             WHEN $3 = 'oficina' THEN NULL
             WHEN $5::boolean THEN address_line2
             ELSE $7::text END,
           pickup_office_preference = CASE WHEN $3 = 'oficina' THEN $8::text ELSE NULL END,
           carrier_preference = $9::text,
           shipping_quote_amount = NULL,
           shipping_quote_carrier = NULL,
           shipping_quote_note = NULL,
           shipping_quoted_at = NULL,
           shipping_quote_expires_at = NULL,
           updated_at = now()
       WHERE id = $1
         AND quote_version = $2
         AND order_status <> 'cancelled'
         AND (quote_status = 'rejected'
              OR (quote_status = 'quoted' AND shipping_quote_expires_at <= now()))
         AND (NOT $5::boolean OR address IS NOT NULL)
       RETURNING quote_status AS "quoteStatus", order_status AS "orderStatus"`,
      [
        id,
        version,
        d.deliveryMode,
        d.city,
        d.keepRegisteredAddress,
        d.address,
        d.addressLine2,
        d.pickupOfficePreference,
        d.carrierPreference,
      ],
    );
    if (res.rows[0]) return { ok: true, ...res.rows[0] };

    const s = await readState(id);
    if (!s) return fail("not_found");
    if (s.quoteStatus === null) return fail("not_quote_flow");
    if (s.orderStatus === "cancelled") return fail("cancelled");
    if (s.quoteVersion !== version) return fail("quote_changed");
    // Doble envío del mismo formulario: ya quedó pendiente con esta versión.
    if (s.quoteStatus === "pending") {
      return { ok: true, quoteStatus: "pending", orderStatus: s.orderStatus };
    }
    if (d.keepRegisteredAddress && !s.hasAddress) {
      return {
        ok: false,
        reason: "invalid",
        error: MESSAGES.invalid,
        fieldErrors: { address: "Ingresa tu dirección de envío." },
      };
    }
    return fail("not_allowed");
  } catch (err) {
    logError("requestShippingOption", err);
    return fail("error");
  }
}

/**
 * "Cancelar solicitud": única acción que deja order_status = cancelled.
 * Solo pedidos B3 en pending/quoted/rejected y sin pago reportado.
 */
export async function cancelOrderRequest(
  orderId: unknown,
): Promise<QuoteActionResult> {
  if (!validIds(orderId)) return fail("not_found");
  const id = orderId as string;
  try {
    const res = await pool.query<{
      quoteStatus: QuoteStatus;
      orderStatus: OrderStatus;
    }>(
      `UPDATE orders
       SET order_status = 'cancelled', updated_at = now()
       WHERE id = $1
         AND quote_status IN ('pending', 'quoted', 'rejected')
         AND payment_status = 'pending_payment'
         AND order_status <> 'cancelled'
       RETURNING quote_status AS "quoteStatus", order_status AS "orderStatus"`,
      [id],
    );
    if (res.rows[0]) return { ok: true, ...res.rows[0] };

    const s = await readState(id);
    if (!s) return fail("not_found");
    if (s.quoteStatus === null) return fail("not_quote_flow");
    if (s.orderStatus === "cancelled") {
      return {
        ok: true,
        quoteStatus: s.quoteStatus,
        orderStatus: "cancelled",
      };
    }
    if (s.quoteStatus === "accepted") {
      return fail(
        "not_allowed",
        "Este pedido ya fue aceptado. Si necesitas cancelarlo, escríbenos por Instagram.",
      );
    }
    return fail("not_allowed");
  } catch (err) {
    logError("cancelOrderRequest", err);
    return fail("error");
  }
}
