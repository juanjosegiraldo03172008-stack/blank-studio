"use server";

import { createOrder } from "@/lib/orders/createOrder";
import type { CreateOrderResult } from "@/lib/orders/types";

/**
 * Server Action pública — es la única forma en que el navegador puede
 * llegar a createOrder()/db.ts. No exponer db.ts ni createOrder.ts
 * directamente desde ningún componente "use client".
 */
export async function createOrderAction(
  input: unknown,
): Promise<CreateOrderResult> {
  return createOrder(input);
}
