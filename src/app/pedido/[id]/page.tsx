import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrderForPayment } from "@/lib/orders/getOrderForPayment";
import PaymentClient from "./PaymentClient";

export const metadata: Metadata = {
  title: "Tu pedido",
  robots: { index: false, follow: false },
};

/**
 * Página de pago por transferencia de un pedido real (FASE 4B). El acceso
 * es por el UUID interno del pedido (aleatorio, imposible de adivinar) —
 * nunca por order_number secuencial (VAL-1042), que sí sería enumerable.
 *
 * Los datos de cuenta (Nequi/Bancolombia) viven en variables de entorno
 * server-side — se leen aquí y se pasan como props ya resueltas; nunca se
 * hardcodean ni se exponen fuera de esta página server-rendered.
 */
export default async function OrderPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderForPayment(id);
  if (!order) notFound();

  const holder = process.env.PAYMENT_ACCOUNT_HOLDER;
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
    <PaymentClient order={order} nequi={nequi} bancolombia={bancolombia} />
  );
}
