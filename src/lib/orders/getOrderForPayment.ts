import { pool } from "@/lib/db";
import type {
  OrderForPayment,
  OrderForPaymentItem,
  PaymentStatus,
} from "./types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Busca un pedido por su UUID interno (nunca por order_number secuencial —
 * eso permitiría enumerar VAL-1000, VAL-1001... y ver pedidos de otros).
 * El UUID es el "token" de acceso a esta página: aleatorio e imposible de
 * adivinar, ya existía como id de la fila desde FASE 4A.
 *
 * No devuelve dirección/teléfono/email — la página de pago no los necesita.
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
      paymentMethod: OrderForPayment["paymentMethod"];
    }>(
      `SELECT
         id,
         order_number AS "orderNumber",
         subtotal,
         payment_status AS "paymentStatus",
         payment_method AS "paymentMethod"
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

    return { ...order, items: itemsRes.rows };
  } catch (err) {
    console.error(
      "getOrderForPayment falló:",
      err instanceof Error ? err.message : "error desconocido",
    );
    return null;
  }
}
