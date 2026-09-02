"use client";

import { useState } from "react";
import CartItemThumbnail from "@/components/CartItemThumbnail";
import { formatCOP } from "@/data/products";
import type { ColorId } from "@/data/products";
import {
  INSTAGRAM_DM_URL,
  copyOrderAndOpenInstagram,
} from "@/lib/instagramOrder";
import { reportPaymentAction } from "@/app/actions/orders";
import type {
  OrderForPayment,
  PaymentMethod,
  PaymentStatus,
} from "@/lib/orders/types";

interface AccountInfo {
  holder: string;
  number?: string;
  accountNumber?: string;
  accountType?: string;
}

export default function PaymentClient({
  order,
  nequi,
  bancolombia,
}: {
  order: OrderForPayment;
  nequi: { holder: string; number: string } | null;
  bancolombia: {
    holder: string;
    accountNumber: string;
    accountType: string;
  } | null;
}) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    order.paymentStatus,
  );
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [reporting, setReporting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCopy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silencioso — el número sigue visible en pantalla para copiarlo a mano
    }
  }

  async function handleReportPayment() {
    if (reporting || !selectedMethod) return;
    setReporting(true);
    setReportError(null);
    const res = await reportPaymentAction(order.id, selectedMethod);
    if (res.ok) {
      setPaymentStatus(res.paymentStatus);
    } else {
      setReportError(res.error);
    }
    setReporting(false);
  }

  async function handleSendProof() {
    await copyOrderAndOpenInstagram(
      `Hola, realicé la transferencia correspondiente al pedido ${order.orderNumber}.`,
    );
  }

  const orderSummary = (
    <div>
      <p className="label text-ink/40">Pedido</p>
      <h1 className="font-display mt-2 text-3xl sm:text-4xl">
        {order.orderNumber}
      </h1>

      <ul className="mt-8 flex flex-col gap-5 border-y border-line py-6">
        {order.items.map((item, i) => (
          <li key={i} className="flex gap-4">
            <CartItemThumbnail
              slug={item.productSlug}
              color={item.color as ColorId}
              name={item.productName}
              className="h-20 w-16 flex-shrink-0"
            />
            <div className="flex flex-1 flex-col">
              <p className="text-sm font-medium">{item.productName}</p>
              <p className="mt-0.5 text-xs text-ink/50">
                {item.color} · Talla {item.size} · Cant. {item.quantity}
              </p>
            </div>
            <p className="font-ui whitespace-nowrap text-sm text-ink/70">
              {formatCOP(item.lineTotal)}
            </p>
          </li>
        ))}
      </ul>

      <div className="font-ui mt-5 flex items-center justify-between text-sm">
        <span className="text-ink/60">Total de productos</span>
        <span className="font-medium">{formatCOP(order.subtotal)}</span>
      </div>
      <div className="font-ui mt-2 flex items-center justify-between text-sm">
        <span className="text-ink/60">Envío</span>
        <span className="font-medium">Pago contraentrega</span>
      </div>
      <p className="mt-1 text-xs text-ink/40">
        El valor del envío se paga contraentrega al momento de recibir tu
        pedido.
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
        <span className="label text-ink/50">Total a transferir ahora</span>
        <span className="text-xl font-medium">{formatCOP(order.subtotal)}</span>
      </div>
    </div>
  );

  // Ya reportó (o revisita el link más tarde) — nunca mostrar el selector de
  // nuevo, ni decir "pago confirmado" mientras no esté verificado a mano.
  if (paymentStatus === "payment_reported") {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 sm:px-8 sm:py-20">
        <p className="label text-ink/40">Transferencia reportada</p>
        <h1 className="font-display mt-2 text-3xl sm:text-4xl">
          {order.orderNumber}
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-ink/70">
          Hemos recibido tu confirmación de transferencia. Verificaremos el pago
          antes de preparar tu pedido.
        </p>
        <p className="mt-4 text-sm text-ink/60">Envío: pago contraentrega.</p>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-8">
          <button
            onClick={handleSendProof}
            className="label border border-ink px-6 py-4 text-center transition hover:bg-ink hover:text-paper"
          >
            Enviar comprobante por Instagram
          </button>
          <a
            href={INSTAGRAM_DM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="label text-center text-ink/50 underline underline-offset-2 hover:text-ink"
          >
            ¿Necesitas ayuda? Escríbenos por Instagram.
          </a>
        </div>
      </div>
    );
  }

  if (paymentStatus === "paid") {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 sm:px-8 sm:py-20">
        <p className="label text-ink/40">Pago verificado</p>
        <h1 className="font-display mt-2 text-3xl sm:text-4xl">
          {order.orderNumber}
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-ink/70">
          Verificamos tu pago. Ya estamos preparando tu pedido.
        </p>
        <p className="mt-4 text-sm text-ink/60">Envío: pago contraentrega.</p>
      </div>
    );
  }

  if (paymentStatus !== "pending_payment") {
    // failed / refunded — sin panel administrativo todavía, se atiende por Instagram.
    return (
      <div className="mx-auto max-w-lg px-5 py-16 sm:px-8 sm:py-20">
        <p className="label text-ink/40">Pedido {order.orderNumber}</p>
        <p className="mt-6 text-sm leading-relaxed text-ink/70">
          Hay una novedad con este pedido. Escríbenos por Instagram y te
          ayudamos a resolverla.
        </p>
        <a
          href={INSTAGRAM_DM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="label mt-6 inline-block border border-ink px-6 py-4 text-center transition hover:bg-ink hover:text-paper"
        >
          Escribir por Instagram
        </a>
      </div>
    );
  }

  const noMethodsConfigured = !nequi && !bancolombia;

  return (
    <div className="mx-auto max-w-lg px-5 py-16 sm:px-8 sm:py-20">
      {orderSummary}

      {noMethodsConfigured ? (
        <div className="mt-10 border-t border-line pt-8">
          <p className="text-sm leading-relaxed text-ink/70">
            Los métodos de pago se están configurando. Escríbenos por Instagram
            para coordinar tu pago mientras tanto.
          </p>
          <a
            href={INSTAGRAM_DM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="label mt-5 inline-block border border-ink px-6 py-4 text-center transition hover:bg-ink hover:text-paper"
          >
            Escribir por Instagram
          </a>
        </div>
      ) : selectedMethod === null ? (
        <div className="mt-10 border-t border-line pt-8">
          <p className="label text-ink/50">Selecciona cómo deseas pagar</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            {nequi && (
              <button
                onClick={() => setSelectedMethod("nequi")}
                className="label flex-1 border border-ink px-6 py-4 text-center transition hover:bg-ink hover:text-paper"
              >
                Nequi
              </button>
            )}
            {bancolombia && (
              <button
                onClick={() => setSelectedMethod("bancolombia")}
                className="label flex-1 border border-ink px-6 py-4 text-center transition hover:bg-ink hover:text-paper"
              >
                Bancolombia
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-10 border-t border-line pt-8">
          <button
            onClick={() => setSelectedMethod(null)}
            className="text-xs text-ink/50 underline underline-offset-2 hover:text-ink"
          >
            ← Elegir otro método
          </button>

          <PaymentMethodDetails
            method={selectedMethod}
            info={selectedMethod === "nequi" ? nequi! : bancolombia!}
            amount={order.subtotal}
            copied={copied}
            onCopy={handleCopy}
          />

          {reportError && (
            <p className="mt-4 text-sm text-[#b23328]">{reportError}</p>
          )}

          <button
            onClick={handleReportPayment}
            disabled={reporting}
            className={`label mt-6 w-full py-4 text-center ${
              reporting
                ? "cursor-wait bg-ink/60 text-paper"
                : "bg-ink text-paper hover:bg-ink/85"
            }`}
          >
            {reporting ? "Procesando…" : "Ya realicé el pago"}
          </button>
        </div>
      )}

      <div className="mt-10 border-t border-line-soft pt-6 text-center">
        <a
          href={INSTAGRAM_DM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-ink/40 underline underline-offset-2 hover:text-ink"
        >
          ¿Necesitas ayuda? Escríbenos por Instagram.
        </a>
      </div>
    </div>
  );
}

function PaymentMethodDetails({
  method,
  info,
  amount,
  copied,
  onCopy,
}: {
  method: PaymentMethod;
  info: AccountInfo;
  amount: number;
  copied: boolean;
  onCopy: (value: string) => void;
}) {
  const number = method === "nequi" ? info.number! : info.accountNumber!;

  return (
    <div className="mt-6">
      <p className="label text-ink/50">
        {method === "nequi" ? "Nequi" : "Bancolombia"}
      </p>

      <dl className="mt-4 flex flex-col gap-3 text-sm">
        <div className="flex items-baseline justify-between">
          <dt className="text-ink/50">Titular</dt>
          <dd className="font-medium">{info.holder}</dd>
        </div>
        {method === "bancolombia" && (
          <div className="flex items-baseline justify-between">
            <dt className="text-ink/50">Tipo de cuenta</dt>
            <dd className="font-medium">{info.accountType}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between">
          <dt className="text-ink/50">
            {method === "nequi" ? "Número" : "Número de cuenta"}
          </dt>
          <dd className="font-medium">{number}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-line-soft pt-3">
          <dt className="text-ink/50">Valor a transferir</dt>
          <dd className="text-lg font-medium">{formatCOP(amount)}</dd>
        </div>
      </dl>

      <button
        onClick={() => onCopy(number)}
        className="label mt-5 w-full border border-ink py-3 text-center transition hover:bg-ink hover:text-paper"
      >
        {copied
          ? "Copiado ✓"
          : method === "nequi"
            ? "Copiar número"
            : "Copiar número de cuenta"}
      </button>
    </div>
  );
}
