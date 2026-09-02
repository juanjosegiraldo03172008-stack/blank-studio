import { pool } from "@/lib/db";
import { validateCreateOrderInput } from "./validate";
import type { CreateOrderInput, CreateOrderResult } from "./types";

/**
 * Crea un pedido real en base de datos — SIN pasarela de pago (FASE 4A).
 *
 * Todo lo que puede decidir el navegador es slug/color/size/quantity por
 * item, más los datos de contacto/envío. Precio, nombre de producto y
 * totales SIEMPRE se recalculan aquí desde products.ts; nada de eso se lee
 * del payload del cliente.
 *
 * Idempotencia: el cliente genera un idempotencyKey una vez por intento de
 * checkout (crypto.randomUUID()). Si la misma clave llega dos veces (doble
 * click, reintento de red), se devuelve el pedido ya creado en vez de
 * duplicarlo — vía UNIQUE(idempotency_key) + ON CONFLICT.
 *
 * Atomicidad: el pedido y sus items se crean en una sola transacción — si
 * falla un item, no queda un pedido a medias.
 */
export async function createOrder(input: unknown): Promise<CreateOrderResult> {
  const validation = validateCreateOrderInput(input);
  if (!validation.ok) {
    return {
      ok: false,
      error: validation.error,
      fieldErrors: validation.fieldErrors,
    };
  }
  const { customer, items, subtotal } = validation;
  const idempotencyKey = (input as CreateOrderInput).idempotencyKey;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Inventario: bloquea solo si existe una fila con stock insuficiente.
    // La ausencia de fila significa "combinación aún sin control de stock",
    // no "agotado" — todavía no cargamos inventario real (ver informe).
    for (const item of items) {
      const stockRes = await client.query<{ stock: number }>(
        `SELECT stock FROM inventory WHERE product_slug = $1 AND color = $2 AND size = $3`,
        [item.product.slug, item.color, item.size],
      );
      const row = stockRes.rows[0];
      if (row && row.stock < item.quantity) {
        await client.query("ROLLBACK");
        return {
          ok: false,
          error: `No hay stock suficiente de ${item.product.name} (${item.color}, talla ${item.size}).`,
        };
      }
    }

    // (xmax = 0) es una forma estándar en Postgres de saber si esta fila
    // fue insertada de nuevo o si ON CONFLICT devolvió una ya existente.
    const orderRes = await client.query<{
      orderId: string;
      orderNumber: string;
      subtotal: number;
      paymentStatus: string;
      inserted: boolean;
    }>(
      `INSERT INTO orders
         (customer_name, customer_email, customer_phone, city, address, address_line2, subtotal, idempotency_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (idempotency_key) DO UPDATE SET updated_at = orders.updated_at
       RETURNING
         id AS "orderId",
         order_number AS "orderNumber",
         subtotal,
         payment_status AS "paymentStatus",
         (xmax = 0) AS inserted`,
      [
        customer.name,
        customer.email,
        customer.phone,
        customer.city,
        customer.address,
        customer.addressLine2,
        subtotal,
        idempotencyKey,
      ],
    );
    const order = orderRes.rows[0];

    if (order.inserted) {
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items
             (order_id, product_slug, product_line, product_name, fit, color, size, quantity, unit_price_at_purchase, line_total)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            order.orderId,
            item.product.slug,
            item.product.line,
            item.product.name,
            item.product.fit,
            item.color,
            item.size,
            item.quantity,
            item.unitPrice,
            item.lineTotal,
          ],
        );
      }
    }

    await client.query("COMMIT");

    return {
      ok: true,
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      subtotal: order.subtotal,
      paymentStatus: order.paymentStatus as "pending_payment",
    };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    // Nunca loguear datos personales del cliente ni el error crudo hacia
    // afuera — solo el mensaje técnico, server-side.
    console.error(
      "createOrder falló:",
      err instanceof Error ? err.message : "error desconocido",
    );
    return {
      ok: false,
      error: "No pudimos crear tu pedido. Intenta de nuevo en unos segundos.",
    };
  } finally {
    client.release();
  }
}
