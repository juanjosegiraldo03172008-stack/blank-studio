/**
 * Tipos del sistema de pedidos (FASE 4A/4B). Es el único flujo de compra
 * desde P0-A — Instagram queda solo como canal de soporte.
 *
 * P0-B3: el pedido nace como solicitud pendiente de cotización de envío
 * (quote_status = "pending"); solo tras cotizar y aceptar el total se puede
 * pagar. Pedidos anteriores a B3 tienen quote_status = null y conservan el
 * flujo original.
 */

import type { DeliveryMode } from "@/data/shipping";

export type { DeliveryMode };

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
  /** Obligatoria solo para entrega en dirección; se ignora en oficina. */
  address?: string;
  addressLine2?: string;
}

export interface CreateOrderShippingInput {
  deliveryMode: DeliveryMode;
  /** Solo para recogida en oficina — opcional. */
  pickupOfficePreference?: string;
  /** Opcional; vacío = transportadora habitual. */
  carrierPreference?: string;
}

export interface CreateOrderInput {
  customer: CreateOrderCustomerInput;
  shipping: CreateOrderShippingInput;
  items: CreateOrderItemInput[];
  /** Generado una vez por intento de checkout (crypto.randomUUID() en el cliente). */
  idempotencyKey: string;
}

export type DeliveryFieldErrors = {
  deliveryMode?: string;
  city?: string;
  address?: string;
  addressLine2?: string;
  pickupOfficePreference?: string;
  carrierPreference?: string;
};

export type CreateOrderFieldErrors = DeliveryFieldErrors & {
  name?: string;
  email?: string;
  phone?: string;
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

/**
 * FASE 4B — pago manual por transferencia (Nequi/Bancolombia), sin
 * pasarela. "paid" solo se asigna manualmente tras verificar el dinero;
 * nunca automáticamente por una acción del cliente.
 */
export type PaymentStatus =
  | "pending_payment"
  | "payment_reported"
  | "paid"
  | "failed"
  | "refunded";

export type PaymentMethod = "nequi" | "bancolombia";

export type OrderStatus = "received" | "preparing" | "shipped" | "cancelled";

/** P0-B3. "Vencida" no es un estado: es "quoted" con la vigencia pasada. */
export type QuoteStatus = "pending" | "quoted" | "accepted" | "rejected";

export type ReportPaymentResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: string;
      paymentStatus: PaymentStatus;
    }
  | {
      ok: false;
      error: string;
    };

export interface OrderForPaymentItem {
  productSlug: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  lineTotal: number;
}

/**
 * Lo que necesita /pedido/[id]. A propósito NO incluye dirección, teléfono
 * ni email: cualquiera con el enlace puede ver esta página.
 */
export interface OrderForPayment {
  id: string;
  orderNumber: string;
  /** Solo prendas. El envío nunca se suma aquí. */
  subtotal: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  orderStatus: OrderStatus;
  items: OrderForPaymentItem[];

  /** null = pedido anterior a B3 (flujo original, sin cotización). */
  quoteStatus: QuoteStatus | null;
  quoteVersion: number;
  deliveryMode: DeliveryMode | null;
  city: string;
  /** Solo indica si hay una dirección registrada; nunca la dirección. */
  hasRegisteredAddress: boolean;
  pickupOfficePreference: string | null;
  carrierPreference: string | null;
  shippingQuoteAmount: number | null;
  shippingQuoteCarrier: string | null;
  shippingQuoteNote: string | null;
  /** ISO 8601. */
  shippingQuoteExpiresAt: string | null;
  /** Calculado con la hora de la base de datos al cargar la página. */
  quoteExpired: boolean;
  acceptedShippingAmount: number | null;
}

export type QuoteActionFailureReason =
  | "not_found"
  | "not_quote_flow"
  | "cancelled"
  | "quote_changed"
  | "expired"
  | "not_allowed"
  | "invalid"
  | "error";

export type QuoteActionResult =
  | { ok: true; quoteStatus: QuoteStatus; orderStatus: OrderStatus }
  | {
      ok: false;
      reason: QuoteActionFailureReason;
      error: string;
      fieldErrors?: DeliveryFieldErrors;
    };

/** Datos de "Solicitar otra opción de envío". */
export interface ShippingOptionInput {
  /** Versión de la cotización que el cliente estaba viendo. */
  quoteVersion: number;
  deliveryMode: DeliveryMode;
  city: string;
  /** Solo domicilio: conservar la dirección ya registrada (sin mostrarla). */
  keepRegisteredAddress?: boolean;
  address?: string;
  addressLine2?: string;
  pickupOfficePreference?: string;
  carrierPreference?: string;
}
