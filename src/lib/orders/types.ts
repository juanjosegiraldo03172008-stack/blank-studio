/**
 * Tipos del sistema de pedidos (FASE 4A). Independientes de CustomerInfo en
 * instagramOrder.ts a propósito — ese flujo sigue intacto y no se toca.
 */

export interface CreateOrderItemInput {
  slug: string;
  color: string;
  size: string;
  quantity: number;
}

export interface CreateOrderCustomerInput {
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  addressLine2?: string;
}

export interface CreateOrderInput {
  customer: CreateOrderCustomerInput;
  items: CreateOrderItemInput[];
  /** Generado una vez por intento de checkout (crypto.randomUUID() en el cliente). */
  idempotencyKey: string;
}

export type CreateOrderFieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  items?: string;
};

export type CreateOrderResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: string;
      subtotal: number;
      paymentStatus: "pending_payment";
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: CreateOrderFieldErrors;
    };
