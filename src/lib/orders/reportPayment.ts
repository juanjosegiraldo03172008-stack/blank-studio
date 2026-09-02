import { pool } from "@/lib/db";
import type {
  PaymentMethod,
  PaymentStatus,
  ReportPaymentResult,
} from "./types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_METHODS: PaymentMethod[] = ["nequi", "bancolombia"];

/**
 * El cliente reporta que transfirió — NUNCA marca el pedido como pagado.
 * Solo mueve pending_payment → payment_reported. "paid" se asigna después,
 * manualmente, cuando alguien de VALENCIANO verifica que el dinero llegó.
 *
 * Idempotente: si el pedido ya no está en pending_payment (doble click, o
 * ya fue verificado), no se sobreescribe nada — se devuelve el estado
 * actual tal cual.
 */
export async function reportPayment(
  orderId: unknown,
  paymentMethod: unknown,
): Promise<ReportPaymentResult> {
  if (typeof orderId !== "string" || !UUID_RE.test(orderId)) {
    return { ok: false, error: "Pedido no encontrado." };
  }
  if (
    typeof paymentMethod !== "string" ||
    !VALID_METHODS.includes(paymentMethod as PaymentMethod)
  ) {
    return { ok: false, error: "Selecciona un método de pago válido." };
  }

  try {
    const updateRes = await pool.query<{
      orderId: string;
      orderNumber: string;
      paymentStatus: PaymentStatus;
    }>(
      `UPDATE orders
       SET payment_status = 'payment_reported',
           payment_method = $2,
           payment_reported_at = now(),
           updated_at = now()
       WHERE id = $1 AND payment_status = 'pending_payment'
       RETURNING
         id AS "orderId",
         order_number AS "orderNumber",
         payment_status AS "paymentStatus"`,
      [orderId, paymentMethod],
    );

    if (updateRes.rows.length > 0) {
      return { ok: true, ...updateRes.rows[0] };
    }

    // 0 filas: no existe, o ya no estaba en pending_payment. Se devuelve el
    // estado actual (idempotente) en vez de duplicar o fallar por un
    // segundo click.
    const existingRes = await pool.query<{
      orderId: string;
      orderNumber: string;
      paymentStatus: PaymentStatus;
    }>(
      `SELECT id AS "orderId", order_number AS "orderNumber", payment_status AS "paymentStatus"
       FROM orders WHERE id = $1`,
      [orderId],
    );
    const existing = existingRes.rows[0];
    if (!existing) {
      return { ok: false, error: "Pedido no encontrado." };
    }
    return { ok: true, ...existing };
  } catch (err) {
    console.error(
      "reportPayment falló:",
      err instanceof Error ? err.message : "error desconocido",
    );
    return {
      ok: false,
      error:
        "No pudimos registrar tu reporte. Intenta de nuevo en unos segundos.",
    };
  }
}
