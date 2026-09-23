import { pool } from "@/lib/db";
import type {
  DeliveryMode,
  OrderForPayment,
  OrderForPaymentItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  QuoteStatus,
} from "./types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Busca un pedido por su UUID interno (nunca por order_number secuencial —
 * eso permitiría enumerar VAL-1000, VAL-1001... y ver pedidos de otros).
 * El UUID es el "token" de acceso a esta página: aleatorio e imposible de
 * adivinar, ya existía como id de la fila desde FASE 4A.
 *
 * No devuelve dirección/teléfono/email — la página del pedido no los
 * necesita. De la dirección solo se informa si existe (P0-B3, para "Mantener
 * la dirección registrada" sin mostrarla).
 */
export async function getOrderForPayment(
  id: string,
): Promise<OrderForPayment | null> {
  if (!UUID_RE.test(id)) return null;

  try {
    const orderRes = await pool.query<{
      id: string;
      orderNumber: string;
      subtotal: number;
      paymentStatus: PaymentStatus;
      paymentMethod: PaymentMethod | null;
      orderStatus: OrderStatus;
      quoteStatus: QuoteStatus | null;
      quoteVersion: number;
      deliveryMode: DeliveryMode | null;
      city: string;
      hasRegisteredAddress: boolean;
      pickupOfficePreference: string | null;
      carrierPreference: string | null;
      shippingQuoteAmount: number | null;
      shippingQuoteCarrier: string | null;
      shippingQuoteNote: string | null;
      shippingQuoteExpiresAt: Date | null;
      quoteExpired: boolean;
      acceptedShippingAmount: number | null;
      paidAt: Date | null;
      shippedAt: Date | null;
      shippingCarrierFinal: string | null;
      trackingNumber: string | null;
      shipmentNote: string | null;
    }>(
      `SELECT
         id,
         order_number AS "orderNumber",
         subtotal,
         payment_status AS "paymentStatus",
         payment_method AS "paymentMethod",
         order_status AS "orderStatus",
         quote_status AS "quoteStatus",
         quote_version AS "quoteVersion",
         delivery_mode AS "deliveryMode",
         city,
         (address IS NOT NULL) AS "hasRegisteredAddress",
         pickup_office_preference AS "pickupOfficePreference",
         carrier_preference AS "carrierPreference",
         shipping_quote_amount AS "shippingQuoteAmount",
         shipping_quote_carrier AS "shippingQuoteCarrier",
         shipping_quote_note AS "shippingQuoteNote",
         shipping_quote_expires_at AS "shippingQuoteExpiresAt",
         -- Hora de la base de datos, la misma que usan las acciones.
         COALESCE(shipping_quote_expires_at <= now(), false) AS "quoteExpired",
         accepted_shipping_amount AS "acceptedShippingAmount",
         -- P0-B4a: verificación del pago y despacho (sin datos bancarios).
         paid_at AS "paidAt",
         shipped_at AS "shippedAt",
         shipping_carrier_final AS "shippingCarrierFinal",
         tracking_number AS "trackingNumber",
         shipment_note AS "shipmentNote"
       FROM orders WHERE id = $1`,
      [id],
    );
    const order = orderRes.rows[0];
    if (!order) return null;

    const itemsRes = await pool.query<OrderForPaymentItem>(
      `SELECT
         product_slug AS "productSlug",
         product_name AS "productName",
         color,
         size,
         quantity,
         line_total AS "lineTotal"
       FROM order_items WHERE order_id = $1 ORDER BY id`,
      [id],
    );

    return {
      ...order,
      shippingQuoteExpiresAt: order.shippingQuoteExpiresAt
        ? order.shippingQuoteExpiresAt.toISOString()
        : null,
      paidAt: order.paidAt ? order.paidAt.toISOString() : null,
      shippedAt: order.shippedAt ? order.shippedAt.toISOString() : null,
      items: itemsRes.rows,
    };
  } catch (err) {
    console.error(
      "getOrderForPayment falló:",
      err instanceof Error ? err.message : "error desconocido",
    );
    return null;
  }
}
