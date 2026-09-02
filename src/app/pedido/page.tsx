"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { COLORS, formatCOP } from "@/data/products";
import CartItemThumbnail from "@/components/CartItemThumbnail";
import {
  buildOrderMessage,
  copyOrderAndOpenInstagram,
  INSTAGRAM_HANDLE,
  type CustomerInfo,
} from "@/lib/instagramOrder";

type Step = "form" | "confirm";
type FieldName = "name" | "city" | "address" | "phone";

function validate(customer: CustomerInfo): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  if (!customer.name.trim()) errors.name = "Ingresa tu nombre completo.";
  if (!customer.city.trim()) errors.city = "Ingresa tu ciudad.";
  if (!customer.address.trim())
    errors.address = "Ingresa tu dirección de envío.";
  const phoneDigits = customer.phone.replace(/\D/g, "");
  if (!customer.phone.trim()) errors.phone = "Ingresa tu teléfono.";
  else if (phoneDigits.length < 7) errors.phone = "Ingresa un teléfono válido.";
  return errors;
}

/** Label + control + mensaje de error, con el cableado aria correspondiente. */
function Field({
  label,
  htmlFor,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="flex flex-col gap-2">
        <span className="label text-ink/50">{label}</span>
        {children}
      </label>
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-xs text-[#b23328]">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "border bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-ink";

export default function PedidoPage() {
  const {
    itemsWithPrice: items,
    totalPrice,
    updateQuantity,
    removeItem,
  } = useCart();
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    city: "",
    address: "",
    addressLine2: "",
    phone: "",
    notes: "",
  });
  const [step, setStep] = useState<Step>("form");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const fieldRefs: Record<
    FieldName,
    React.RefObject<HTMLInputElement | null>
  > = {
    name: nameRef,
    city: cityRef,
    address: addressRef,
    phone: phoneRef,
  };

  const message = useMemo(
    () => buildOrderMessage(items, customer),
    [items, customer],
  );

  const errors = useMemo(() => validate(customer), [customer]);
  const canSubmit = items.length > 0 && Object.keys(errors).length === 0;

  function errorFor(field: FieldName) {
    return touched[field] || submitAttempted ? errors[field] : undefined;
  }

  function markTouched(field: FieldName) {
    setTouched((t) => (t[field] ? t : { ...t, [field]: true }));
  }

  async function handleSend() {
    if (isSubmitting) return;
    if (!canSubmit) {
      setSubmitAttempted(true);
      const firstInvalid = (
        ["name", "city", "address", "phone"] as FieldName[]
      ).find((f) => errors[f]);
      if (firstInvalid) fieldRefs[firstInvalid].current?.focus();
      return;
    }
    setIsSubmitting(true);
    const success = await copyOrderAndOpenInstagram(message);
    setCopied(success);
    setStep("confirm");
    setIsSubmitting(false);
  }

  async function handleCopyAgain() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (items.length === 0 && step === "form") {
    return (
      <div className="mx-auto max-w-lg px-5 py-32 text-center sm:px-8">
        <h1 className="font-display text-2xl">Tu carrito está vacío.</h1>
        <p className="mt-3 text-sm text-ink/60">
          Explora el catálogo y agrega las prendas que quieras pedir.
        </p>
        <Link
          href="/catalogo"
          className="label mt-8 inline-block bg-ink px-8 py-3 text-paper"
        >
          Seguir explorando
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="label text-ink/50">Pedido</p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">
        {step === "form" ? "Confirma tu pedido" : "Casi listo"}
      </h1>

      {step === "form" && (
        <>
          <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
            {/* Resumen — primero en mobile, columna derecha en desktop */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-24">
              <p className="label text-ink/40">Tu pedido</p>
              <ul className="mt-4 flex flex-col gap-5 border-y border-line py-6">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    <CartItemThumbnail
                      slug={item.slug}
                      color={item.color}
                      name={item.name}
                      className="h-20 w-16 flex-shrink-0"
                    />
                    <div className="flex flex-1 flex-col">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="mt-0.5 text-xs text-ink/50">
                        {COLORS[item.color].name} · Talla {item.size}
                      </p>
                      <div className="mt-2.5 flex items-center gap-4">
                        <div className="font-ui flex items-center border border-line">
                          <button
                            type="button"
                            className="flex h-8 w-7 items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            aria-label={`Reducir cantidad de ${item.name}`}
                          >
                            −
                          </button>
                          <span
                            className="w-6 text-center text-sm"
                            aria-live="polite"
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="flex h-8 w-7 items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            aria-label={`Aumentar cantidad de ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="font-ui text-xs text-ink/40 underline underline-offset-2 hover:text-ink focus-visible:outline-none focus-visible:text-ink"
                          onClick={() => removeItem(item.id)}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                    <p className="font-ui whitespace-nowrap text-sm text-ink/70">
                      {formatCOP(item.lineTotal)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="font-ui mt-1 flex items-center justify-between pt-5 text-sm">
                <span className="text-ink/60">Subtotal</span>
                <span className="text-lg font-medium">
                  {formatCOP(totalPrice)}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink/40">
                El envío se confirma por Instagram antes de despachar el pedido.
              </p>
            </div>

            {/* Formulario */}
            <div className="order-2 lg:order-1">
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2"
              >
                <Field
                  label="Nombre completo *"
                  htmlFor="name"
                  error={errorFor("name")}
                  className="sm:col-span-2"
                >
                  <input
                    id="name"
                    ref={nameRef}
                    required
                    autoComplete="name"
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer((c) => ({ ...c, name: e.target.value }))
                    }
                    onBlur={() => markTouched("name")}
                    aria-invalid={!!errorFor("name")}
                    aria-describedby={
                      errorFor("name") ? "name-error" : undefined
                    }
                    className={`${inputClass} ${errorFor("name") ? "border-[#b23328]" : "border-line"}`}
                  />
                </Field>

                <Field label="Ciudad *" htmlFor="city" error={errorFor("city")}>
                  <input
                    id="city"
                    ref={cityRef}
                    required
                    autoComplete="address-level2"
                    value={customer.city}
                    onChange={(e) =>
                      setCustomer((c) => ({ ...c, city: e.target.value }))
                    }
                    onBlur={() => markTouched("city")}
                    aria-invalid={!!errorFor("city")}
                    aria-describedby={
                      errorFor("city") ? "city-error" : undefined
                    }
                    className={`${inputClass} ${errorFor("city") ? "border-[#b23328]" : "border-line"}`}
                  />
                </Field>

                <Field
                  label="Teléfono / WhatsApp *"
                  htmlFor="phone"
                  error={errorFor("phone")}
                >
                  <input
                    id="phone"
                    ref={phoneRef}
                    type="tel"
                    inputMode="tel"
                    required
                    autoComplete="tel"
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer((c) => ({ ...c, phone: e.target.value }))
                    }
                    onBlur={() => markTouched("phone")}
                    aria-invalid={!!errorFor("phone")}
                    aria-describedby={
                      errorFor("phone") ? "phone-error" : undefined
                    }
                    className={`${inputClass} ${errorFor("phone") ? "border-[#b23328]" : "border-line"}`}
                  />
                </Field>

                <Field
                  label="Dirección de envío *"
                  htmlFor="address"
                  error={errorFor("address")}
                  className="sm:col-span-2"
                >
                  <input
                    id="address"
                    ref={addressRef}
                    required
                    autoComplete="street-address"
                    placeholder="Calle, número, barrio"
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer((c) => ({ ...c, address: e.target.value }))
                    }
                    onBlur={() => markTouched("address")}
                    aria-invalid={!!errorFor("address")}
                    aria-describedby={
                      errorFor("address") ? "address-error" : undefined
                    }
                    className={`${inputClass} ${errorFor("address") ? "border-[#b23328]" : "border-line"}`}
                  />
                </Field>

                <Field
                  label="Apto / interior (opcional)"
                  htmlFor="addressLine2"
                  className="sm:col-span-2"
                >
                  <input
                    id="addressLine2"
                    autoComplete="address-line2"
                    value={customer.addressLine2}
                    onChange={(e) =>
                      setCustomer((c) => ({
                        ...c,
                        addressLine2: e.target.value,
                      }))
                    }
                    className={`${inputClass} border-line`}
                  />
                </Field>

                <Field
                  label="Notas (opcional)"
                  htmlFor="notes"
                  className="sm:col-span-2"
                >
                  <input
                    id="notes"
                    value={customer.notes}
                    onChange={(e) =>
                      setCustomer((c) => ({ ...c, notes: e.target.value }))
                    }
                    className={`${inputClass} border-line`}
                  />
                </Field>

                <div className="sm:col-span-2 mt-2 border border-line-soft bg-black/[0.02] p-5">
                  <p className="label text-ink/50">Cómo funciona el envío</p>
                  <ol className="mt-3 flex flex-col gap-2 text-sm text-ink/70">
                    <li>
                      1. Al presionar &quot;Enviar pedido&quot;, copiamos
                      automáticamente el resumen a tu portapapeles.
                    </li>
                    <li>
                      2. Se abrirá el chat directo de Instagram con @
                      {INSTAGRAM_HANDLE} en una pestaña nueva.
                    </li>
                    <li>
                      3. Pega el mensaje ahí (mantén presionado y elige
                      &quot;Pegar&quot;, o Ctrl/Cmd + V).
                    </li>
                    <li>
                      4. Presiona enviar en Instagram — con eso tu pedido queda
                      registrado.
                    </li>
                  </ol>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`label mt-2 w-full py-4 text-center sm:col-span-2 ${
                    isSubmitting
                      ? "cursor-wait bg-ink/60 text-paper"
                      : "bg-ink text-paper hover:bg-ink/85"
                  }`}
                >
                  {isSubmitting ? "Procesando…" : "Enviar pedido por Instagram"}
                </button>
                <p className="text-xs text-ink/40 sm:col-span-2">
                  * Campos obligatorios. Los precios son estimados y se
                  confirman por Instagram antes del envío.
                </p>
              </form>
            </div>
          </div>

          <div className="mt-16 border-t border-line pt-10">
            <p className="label text-ink/50">
              ¿Primera vez pidiendo con nosotros?
            </p>
            <h2 className="font-display mt-2 text-xl">
              Mira cómo se hace en 20 segundos
            </h2>
            <div className="mt-6 max-w-sm overflow-hidden border border-line-soft">
              <video
                src="/videos/pedido-demo.mp4"
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full"
              />
            </div>
          </div>
        </>
      )}

      {step === "confirm" && (
        <div className="mt-10 max-w-lg">
          <div className="border border-ink/20 bg-black/[0.02] p-6">
            <p className="text-sm font-medium">
              {copied
                ? "✅ Tu pedido fue copiado. Se abrió Instagram en una pestaña nueva."
                : "No pudimos copiar el texto automáticamente. Se abrió Instagram en una pestaña nueva — copia el texto de abajo manualmente."}
            </p>
            <p className="mt-3 text-sm text-ink/70">
              Ve a la pestaña de Instagram, toca el campo de mensaje, pega el
              texto (Ctrl/Cmd + V, o mantén presionado → Pegar) y presiona
              enviar. Así confirmamos tu pedido.
            </p>
          </div>

          <div className="mt-6">
            <p className="label text-ink/50">Texto de tu pedido</p>
            <textarea
              readOnly
              value={message}
              rows={10}
              className="mt-3 w-full resize-none border border-line bg-transparent px-4 py-3 text-sm text-ink/80 outline-none"
            />
            <button
              onClick={handleCopyAgain}
              className="label mt-3 border border-ink px-6 py-3 text-ink transition hover:bg-ink hover:text-paper"
            >
              Copiar de nuevo
            </button>
          </div>

          <a
            href={`https://ig.me/m/${INSTAGRAM_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="label mt-6 inline-block w-full bg-ink py-4 text-center text-paper transition hover:bg-ink/85 sm:w-auto sm:px-10"
          >
            Abrir Instagram de nuevo
          </a>
        </div>
      )}
    </div>
  );
}
