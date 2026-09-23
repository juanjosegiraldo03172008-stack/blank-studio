import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrderForPayment } from "@/lib/orders/getOrderForPayment";
import { formatDateTimeCO } from "@/data/shipping";
import PaymentClient from "./PaymentClient";
import QuoteClient from "./QuoteClient";

export const metadata: Metadata = {
  title: "Tu pedido",
  robots: { index: false, follow: false },
};

/**
 * Página de un pedido real. El acceso es por el UUID interno del pedido
 * (aleatorio, imposible de adivinar) — nunca por order_number secuencial
 * (VAL-1042), que sí sería enumerable.
 *
 * P0-B3: un pedido con cotización de envío pasa primero por QuoteClient
 * (cotizando → cotizado → aceptar / no acepto / otra opción / cancelar). Los
 * datos de cuenta (Nequi/Bancolombia) SOLO se leen y se envían al navegador
 * cuando el cliente ya aceptó el total (o en pedidos anteriores a B3, que
 * conservan el flujo original). Antes de eso no aparecen ni en el HTML.
 */
export default async function OrderPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderForPayment(id);
  if (!order) notFound();

  const isCancelled = order.orderStatus === "cancelled";
  const isQuoteFlow = order.quoteStatus !== null;
  const canPay =
    !isCancelled && (!isQuoteFlow || order.quoteStatus === "accepted");

  if (!canPay) {
    return (
      <QuoteClient
        order={order}
        quoteExpiresAtLabel={
          order.shippingQuoteExpiresAt
            ? formatDateTimeCO(new Date(order.shippingQuoteExpiresAt))
            : null
        }
      />
    );
  }

  // P0-B4a: los datos de cuenta solo se necesitan mientras falta pagar. Una
  // vez reportado, verificado o despachado, no se envían al navegador.
  const awaitingPayment = order.paymentStatus === "pending_payment";
  const holder = awaitingPayment ? process.env.PAYMENT_ACCOUNT_HOLDER : undefined;
  const nequiNumber = process.env.PAYMENT_NEQUI_NUMBER;
  const bancolombiaAccount = process.env.PAYMENT_BANCOLOMBIA_ACCOUNT;
  const bancolombiaAccountType = process.env.PAYMENT_BANCOLOMBIA_ACCOUNT_TYPE;

  const nequi = holder && nequiNumber ? { holder, number: nequiNumber } : null;
  const bancolombia =
    holder && bancolombiaAccount && bancolombiaAccountType
      ? {
          holder,
          accountNumber: bancolombiaAccount,
          accountType: bancolombiaAccountType,
        }
      : null;

  return (
    <PaymentClient
      order={order}
      nequi={nequi}
      bancolombia={bancolombia}
      paidAtLabel={order.paidAt ? formatDateTimeCO(new Date(order.paidAt)) : null}
      shippedAtLabel={
        order.shippedAt ? formatDateTimeCO(new Date(order.shippedAt)) : null
      }
    />
  );
}
