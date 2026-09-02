"use server";

import { createOrder } from "@/lib/orders/createOrder";
import { reportPayment } from "@/lib/orders/reportPayment";
import type {
  CreateOrderResult,
  ReportPaymentResult,
} from "@/lib/orders/types";

/**
 * Server Actions públicas — la única forma en que el navegador puede llegar
 * a createOrder()/reportPayment()/db.ts. No exponer esos módulos ni db.ts
 * directamente desde ningún componente "use client".
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
