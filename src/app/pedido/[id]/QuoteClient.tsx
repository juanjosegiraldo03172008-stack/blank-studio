"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CartItemThumbnail from "@/components/CartItemThumbnail";
import DeliveryModeSelector from "@/components/DeliveryModeSelector";
import { COLORS, formatCOP, type ColorId } from "@/data/products";
import {
  DEFAULT_CARRIER,
  DELIVERY_MODE_LABELS,
  MAX_CARRIER_PREFERENCE_LENGTH,
  MAX_PICKUP_OFFICE_LENGTH,
  QUOTE_RESPONSE_TIME_COPY,
  type DeliveryMode,
} from "@/data/shipping";
import { INSTAGRAM_DM_URL } from "@/lib/instagramOrder";
import {
  acceptQuoteAction,
  cancelOrderRequestAction,
  rejectQuoteAction,
  requestShippingOptionAction,
} from "@/app/actions/orders";
import type {
  DeliveryFieldErrors,
  OrderForPayment,
  QuoteActionResult,
} from "@/lib/orders/types";

/**
 * P0-B3 — estados del pedido ANTES de poder pagar: cotizando, cotizado,
 * vencido, no aceptado y cancelado. Aquí nunca llegan datos bancarios.
 * Tras cada acción se recarga el estado desde el servidor (router.refresh);
 * si el cliente acepta, la página pasa a PaymentClient.
 */
export default function QuoteClient({
  order,
  quoteExpiresAtLabel,
}: {
  order: OrderForPayment;
  quoteExpiresAtLabel: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showOptionForm, setShowOptionForm] = useState(false);

  async function run(
    action: () => Promise<QuoteActionResult>,
    onDone?: () => void,
  ) {
    if (busy) return;
    setBusy(true);
    setActionError(null);
    const res = await action();
    if (!res.ok) setActionError(res.error);
    if (res.ok) onDone?.();
    // Siempre se vuelve a leer el estado real: si la cotización cambió,
    // venció o ya se había aceptado, la pantalla lo refleja.
    router.refresh();
    setBusy(false);
  }

  const isCancelled = order.orderStatus === "cancelled";
  const status = order.quoteStatus;
  const quotedAndValid = status === "quoted" && !order.quoteExpired;
  const quotedAndExpired = status === "quoted" && order.quoteExpired;

  // ----- Cancelado -----
  if (isCancelled) {
    return (
      <Shell label="Solicitud cancelada" orderNumber={order.orderNumber}>
        <p className="mt-6 text-sm leading-relaxed text-ink/70">
          Esta solicitud fue cancelada.
          {order.paymentStatus === "pending_payment" &&
            " No se realizó ningún cobro."}
        </p>
        <Link
          href="/catalogo"
          className="label mt-8 inline-block border border-ink px-6 py-4 text-center transition hover:bg-ink hover:text-paper"
        >
          Volver a la tienda
        </Link>
        <HelpLink />
      </Shell>
    );
  }

  // ----- Cotización vigente -----
  if (quotedAndValid && order.shippingQuoteAmount !== null) {
    const shipping = order.shippingQuoteAmount;
    return (
      <Shell label="Tu envío está cotizado" orderNumber={order.orderNumber}>
        <Items order={order} />

        <dl className="font-ui mt-5 flex flex-col gap-3 text-sm">
          <Row label="Prendas" value={formatCOP(order.subtotal)} />
          <div>
            <Row label="Envío" value={formatCOP(shipping)} />
            <p className="mt-1 text-xs text-ink/50">
              {order.shippingQuoteCarrier} ·{" "}
              {order.deliveryMode && DELIVERY_MODE_LABELS[order.deliveryMode]} ·{" "}
              <span className="font-medium text-ink/70">
                se paga al recibir
              </span>
            </p>
          </div>
          <div className="border-t border-line pt-3">
            <Row
              label="Total del pedido"
              value={formatCOP(order.subtotal + shipping)}
              strong
            />
          </div>
        </dl>

        {/* Separado a propósito: a VALENCIANO solo se transfieren las prendas. */}
        <div className="mt-6 border border-ink px-5 py-4">
          <div className="flex items-baseline justify-between gap-4">
            <span className="label text-ink/70">A transferir ahora</span>
            <span className="text-2xl font-medium">
              {formatCOP(order.subtotal)}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink/60">
            Solo las prendas, por transferencia a VALENCIANO. El envío (
            {formatCOP(shipping)}) lo pagas a la transportadora cuando recibas
            tu pedido.
          </p>
        </div>

        {order.shippingQuoteNote && (
          <p className="mt-5 border-l-2 border-line pl-3 text-sm leading-relaxed text-ink/70">
            {order.shippingQuoteNote}
          </p>
        )}
        {quoteExpiresAtLabel && (
          <p className="mt-5 text-xs text-ink/50">
            Cotización válida hasta el {quoteExpiresAtLabel} (hora de Colombia).
          </p>
        )}

        <ErrorText message={actionError} />

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              run(() => acceptQuoteAction(order.id, order.quoteVersion))
            }
            className={`label w-full py-4 text-center ${
              busy
                ? "cursor-wait bg-ink/60 text-paper"
                : "bg-ink text-paper hover:bg-ink/85"
            }`}
          >
            {busy ? "Procesando…" : "Aceptar pedido"}
          </button>
          <p className="text-xs leading-relaxed text-ink/50">
            Al aceptar confirmas tu pedido por este total. Después verás los
            datos para transferir el valor de las prendas.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              run(() => rejectQuoteAction(order.id, order.quoteVersion))
            }
            className="label w-full border border-ink py-4 text-center transition hover:bg-ink hover:text-paper disabled:opacity-60"
          >
            No acepto este valor
          </button>
        </div>

        <CancelRequest orderId={order.id} busy={busy} run={run} />
        <HelpLink />
      </Shell>
    );
  }

  // ----- No aceptada o vencida -----
  if (status === "rejected" || quotedAndExpired) {
    const isExpired = quotedAndExpired;
    return (
      <Shell
        label={isExpired ? "Cotización vencida" : "Cotización no aceptada"}
        orderNumber={order.orderNumber}
      >
        <p className="mt-6 text-sm leading-relaxed text-ink/70">
          {isExpired
            ? `La cotización del envío venció${
                quoteExpiresAtLabel ? ` el ${quoteExpiresAtLabel}` : ""
              }.`
            : "No aceptaste la cotización de envío."}{" "}
          Tu pedido sigue guardado y no se realizó ningún cobro.
        </p>

        <ErrorText message={actionError} />

        {showOptionForm ? (
          <ShippingOptionForm
            order={order}
            busy={busy}
            submitLabel={
              isExpired ? "Solicitar nueva cotización" : "Solicitar otra opción de envío"
            }
            onCancel={() => setShowOptionForm(false)}
            onSubmit={(input) =>
              run(() => requestShippingOptionAction(order.id, input))
            }
          />
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => setShowOptionForm(true)}
            className="label mt-8 w-full bg-ink py-4 text-center text-paper hover:bg-ink/85"
          >
            {isExpired
              ? "Solicitar nueva cotización"
              : "Solicitar otra opción de envío"}
          </button>
        )}

        <Items order={order} />
        <CancelRequest orderId={order.id} busy={busy} run={run} />
        <HelpLink />
      </Shell>
    );
  }

  // ----- Pendiente de cotización -----
  return (
    <Shell label="Solicitud recibida" orderNumber={order.orderNumber}>
      <p className="mt-6 text-base font-medium">
        Todavía no realizas ningún pago.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink/70">
        {QUOTE_RESPONSE_TIME_COPY} Guarda este enlace: aquí verás la cotización
        cuando esté lista y puedes volver a él cuando quieras.
      </p>
      <CopyLinkButton />

      <dl className="mt-8 flex flex-col gap-2 border-t border-line pt-6 text-sm">
        <Row
          label="Modalidad"
          value={
            order.deliveryMode ? DELIVERY_MODE_LABELS[order.deliveryMode] : "—"
          }
          small
        />
        <Row label="Ciudad" value={order.city} small />
        {order.deliveryMode === "oficina" && order.pickupOfficePreference && (
          <Row
            label="Oficina preferida"
            value={order.pickupOfficePreference}
            small
          />
        )}
        <Row
          label="Transportadora"
          value={order.carrierPreference ?? `${DEFAULT_CARRIER} (habitual)`}
          small
        />
      </dl>

      <Items order={order} />
      <div className="font-ui mt-5 flex items-center justify-between text-sm">
        <span className="text-ink/60">Prendas</span>
        <span className="font-medium">{formatCOP(order.subtotal)}</span>
      </div>
      <p className="mt-1 text-xs text-ink/40">
        Envío: pendiente de cotización. Se paga al recibir.
      </p>

      <ErrorText message={actionError} />
      <CancelRequest orderId={order.id} busy={busy} run={run} />
      <HelpLink />
    </Shell>
  );
}

// ---------------------------------------------------------------------------

function Shell({
  label,
  orderNumber,
  children,
}: {
  label: string;
  orderNumber: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-lg px-5 py-16 sm:px-8 sm:py-20">
      <p className="label text-ink/40">{label}</p>
      <h1 className="font-display mt-2 text-3xl sm:text-4xl">{orderNumber}</h1>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  small,
}: {
  label: string;
  value: string;
  strong?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={small ? "text-ink/50" : "text-ink/60"}>{label}</dt>
      <dd
        className={`text-right ${
          strong ? "text-lg font-medium" : small ? "text-ink/80" : "font-medium"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function Items({ order }: { order: OrderForPayment }) {
  return (
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
              {COLORS[item.color as ColorId]?.name ?? item.color} · Talla{" "}
              {item.size} · Cant. {item.quantity}
            </p>
          </div>
          <p className="font-ui whitespace-nowrap text-sm text-ink/70">
            {formatCOP(item.lineTotal)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-5 text-sm text-[#b23328]">
      {message}
    </p>
  );
}

function HelpLink() {
  return (
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
  );
}

function CopyLinkButton() {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState("copied");
    } catch {
      setState("failed");
    }
  }
  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={copy}
        className="label w-full border border-ink py-3 text-center transition hover:bg-ink hover:text-paper"
      >
        {state === "copied" ? "Enlace copiado ✓" : "Copiar enlace de mi pedido"}
      </button>
      <p aria-live="polite" className="mt-2 text-xs text-ink/50">
        {state === "failed" &&
          "No pudimos copiarlo automáticamente: copia la dirección de esta página desde tu navegador."}
      </p>
    </div>
  );
}

function CancelRequest({
  orderId,
  busy,
  run,
}: {
  orderId: string;
  busy: boolean;
  run: (action: () => Promise<QuoteActionResult>) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <div className="mt-8 text-center">
        <button
          type="button"
          disabled={busy}
          onClick={() => setConfirming(true)}
          className="text-xs text-ink/50 underline underline-offset-2 hover:text-ink"
        >
          Cancelar solicitud
        </button>
      </div>
    );
  }
  return (
    <div className="mt-8 border border-line p-4 text-sm">
      <p className="text-ink/80">
        ¿Seguro que quieres cancelar esta solicitud? No se puede deshacer.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => cancelOrderRequestAction(orderId))}
          className="label flex-1 border border-[#b23328] py-3 text-center text-[#b23328] transition hover:bg-[#b23328] hover:text-paper disabled:opacity-60"
        >
          Sí, cancelar
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setConfirming(false)}
          className="label flex-1 border border-line py-3 text-center"
        >
          No, volver
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "border border-line bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-ink";

/**
 * "Solicitar otra opción de envío". No muestra la dirección registrada (esta
 * página es accesible con el enlace): en domicilio ofrece conservarla sin
 * mostrarla o escribir una nueva. En oficina no pide dirección.
 */
function ShippingOptionForm({
  order,
  busy,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  order: OrderForPayment;
  busy: boolean;
  submitLabel: string;
  onSubmit: (input: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const canKeepAddress =
    order.deliveryMode === "domicilio" && order.hasRegisteredAddress;
  const [mode, setMode] = useState<DeliveryMode>(
    order.deliveryMode ?? "domicilio",
  );
  const [city, setCity] = useState(order.city);
  const [keepAddress, setKeepAddress] = useState(canKeepAddress);
  const [address, setAddress] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [office, setOffice] = useState(order.pickupOfficePreference ?? "");
  const [carrier, setCarrier] = useState(order.carrierPreference ?? "");
  const [errors, setErrors] = useState<DeliveryFieldErrors>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: DeliveryFieldErrors = {};
    if (!city.trim()) next.city = "Ingresa tu ciudad.";
    const usingKeep = mode === "domicilio" && canKeepAddress && keepAddress;
    if (mode === "domicilio" && !usingKeep && !address.trim()) {
      next.address = "Ingresa tu dirección de envío.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit({
      quoteVersion: order.quoteVersion,
      deliveryMode: mode,
      city,
      keepRegisteredAddress: usingKeep,
      address: mode === "domicilio" && !usingKeep ? address : undefined,
      addressLine2:
        mode === "domicilio" && !usingKeep ? addressLine2 || undefined : undefined,
      pickupOfficePreference: mode === "oficina" ? office || undefined : undefined,
      carrierPreference: carrier || undefined,
    });
  }

  return (
    <form
      noValidate
      onSubmit={submit}
      className="mt-8 flex flex-col gap-5 border border-line p-5"
    >
      <p className="label text-ink/60">Nueva opción de envío</p>
      <DeliveryModeSelector name="newDeliveryMode" value={mode} onChange={setMode} />

      <label className="flex flex-col gap-2">
        <span className="label text-ink/50">Ciudad *</span>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          autoComplete="address-level2"
          className={inputClass}
        />
        {errors.city && (
          <span className="text-xs text-[#b23328]">{errors.city}</span>
        )}
      </label>

      {mode === "domicilio" ? (
        <>
          {canKeepAddress && (
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={keepAddress}
                onChange={(e) => setKeepAddress(e.target.checked)}
                className="accent-ink"
              />
              Mantener la dirección que registré
            </label>
          )}
          {!(canKeepAddress && keepAddress) && (
            <>
              <label className="flex flex-col gap-2">
                <span className="label text-ink/50">Dirección de envío *</span>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  autoComplete="street-address"
                  placeholder="Calle, número, barrio"
                  className={inputClass}
                />
                {errors.address && (
                  <span className="text-xs text-[#b23328]">
                    {errors.address}
                  </span>
                )}
              </label>
              <label className="flex flex-col gap-2">
                <span className="label text-ink/50">
                  Apto / interior (opcional)
                </span>
                <input
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  autoComplete="address-line2"
                  className={inputClass}
                />
              </label>
            </>
          )}
        </>
      ) : (
        <label className="flex flex-col gap-2">
          <span className="label text-ink/50">
            Oficina o sede preferida (opcional)
          </span>
          <input
            value={office}
            maxLength={MAX_PICKUP_OFFICE_LENGTH}
            onChange={(e) => setOffice(e.target.value)}
            placeholder="Barrio o sede de la transportadora"
            className={inputClass}
          />
        </label>
      )}

      <label className="flex flex-col gap-2">
        <span className="label text-ink/50">Transportadora (opcional)</span>
        <span className="-mt-1 text-xs text-ink/50">
          Normalmente enviamos con {DEFAULT_CARRIER}. Si prefieres otra
          transportadora, escríbela aquí.
        </span>
        <input
          value={carrier}
          maxLength={MAX_CARRIER_PREFERENCE_LENGTH}
          onChange={(e) => setCarrier(e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={busy}
          className={`label w-full py-4 text-center ${
            busy
              ? "cursor-wait bg-ink/60 text-paper"
              : "bg-ink text-paper hover:bg-ink/85"
          }`}
        >
          {busy ? "Enviando…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-ink/50 underline underline-offset-2 hover:text-ink"
        >
          Volver
        </button>
      </div>
    </form>
  );
}
