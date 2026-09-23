"use server";

import { createOrder } from "@/lib/orders/createOrder";
import { reportPayment } from "@/lib/orders/reportPayment";
import {
  acceptQuote,
  cancelOrderRequest,
  rejectQuote,
  requestShippingOption,
} from "@/lib/orders/quote";
import type {
  CreateOrderResult,
  QuoteActionResult,
  ReportPaymentResult,
} from "@/lib/orders/types";

/**
 * Server Actions públicas — la única forma en que el navegador puede llegar
 * a createOrder()/reportPayment()/quote.ts/db.ts. No exponer esos módulos ni
 * db.ts directamente desde ningún componente "use client". Todo lo que llega
 * aquí se valida de nuevo server-side (tipos incluidos).
 */
export async function createOrderAction(
  input: unknown,
): Promise<CreateOrderResult> {
  return createOrder(input);
}

export async function reportPaymentAction(
  orderId: unknown,
  paymentMethod: unknown,
): Promise<ReportPaymentResult> {
  return reportPayment(orderId, paymentMethod);
}

/** P0-B3: el cliente acepta el total (prendas + envío cotizado). */
export async function acceptQuoteAction(
  orderId: unknown,
  quoteVersion: unknown,
): Promise<QuoteActionResult> {
  return acceptQuote(orderId, quoteVersion);
}

/** P0-B3: "No acepto este valor" — no cancela el pedido. */
export async function rejectQuoteAction(
  orderId: unknown,
  quoteVersion: unknown,
): Promise<QuoteActionResult> {
  return rejectQuote(orderId, quoteVersion);
}

/** P0-B3: "Solicitar otra opción de envío" — vuelve a pendiente de cotizar. */
export async function requestShippingOptionAction(
  orderId: unknown,
  input: unknown,
): Promise<QuoteActionResult> {
  return requestShippingOption(orderId, input);
}

/** P0-B3: "Cancelar solicitud" — única acción que cancela el pedido. */
export async function cancelOrderRequestAction(
  orderId: unknown,
): Promise<QuoteActionResult> {
  return cancelOrderRequest(orderId);
}
