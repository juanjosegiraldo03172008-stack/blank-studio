"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { COLORS, formatCOP } from "@/data/products";
import CartItemThumbnail from "@/components/CartItemThumbnail";
import { INSTAGRAM_DM_URL } from "@/lib/instagramOrder";
import { createOrderAction } from "@/app/actions/orders";
import DeliveryModeSelector from "@/components/DeliveryModeSelector";
import {
  DEFAULT_CARRIER,
  MAX_CARRIER_PREFERENCE_LENGTH,
  MAX_PICKUP_OFFICE_LENGTH,
  QUOTE_RESPONSE_TIME_COPY,
  type DeliveryMode,
} from "@/data/shipping";

type FieldName = "name" | "email" | "city" | "address" | "phone";
/** Datos del formulario de checkout — se envían tal cual a createOrderAction,
 * que los valida de nuevo server-side (src/lib/orders/validate.ts). */
interface CheckoutCustomer {
  name: string;
  email: string;
  city: string;
  address: string;
  /** Apto, torre, interior, etc. — opcional. */
  addressLine2?: string;
  phone: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(
  customer: CheckoutCustomer,
  deliveryMode: DeliveryMode,
): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  if (!customer.name.trim()) errors.name = "Ingresa tu nombre completo.";
  if (!customer.email.trim()) errors.email = "Ingresa tu correo.";
  else if (!EMAIL_RE.test(customer.email.trim()))
    errors.email = "Ingresa un correo válido.";
  if (!customer.city.trim()) errors.city = "Ingresa tu ciudad.";
  // P0-B3: la dirección solo aplica a entrega en dirección.
  if (deliveryMode === "domicilio" && !customer.address.trim())
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
  const router = useRouter();
  const {
    itemsWithPrice: items,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const [customer, setCustomer] = useState<CheckoutCustomer>({
    name: "",
    email: "",
    city: "",
    address: "",
    addressLine2: "",
    phone: "",
  });
  // P0-B3: "Entrega en tu dirección" preseleccionada; se puede cambiar a
  // recogida en oficina (sin dirección).
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("domicilio");
  const [pickupOfficePreference, setPickupOfficePreference] = useState("");
  const [carrierPreference, setCarrierPreference] = useState("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Igual que en la herramienta de prueba de FASE 4A: generar el UUID en el
  // initializer de useState rompería la hidratación (valor distinto en
  // servidor vs. cliente) — se genera en un efecto, solo en el cliente.
  const [idempotencyKey, setIdempotencyKey] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdempotencyKey(crypto.randomUUID());
  }, []);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const fieldRefs: Record<
    FieldName,
    React.RefObject<HTMLInputElement | null>
  > = {
    name: nameRef,
    email: emailRef,
    city: cityRef,
    address: addressRef,
    phone: phoneRef,
  };

  const errors = useMemo(
    () => validate(customer, deliveryMode),
    [customer, deliveryMode],
  );
  const canSubmit = items.length > 0 && Object.keys(errors).length === 0;

  function errorFor(field: FieldName) {
    return touched[field] || submitAttempted ? errors[field] : undefined;
  }

  function markTouched(field: FieldName) {
    setTouched((t) => (t[field] ? t : { ...t, [field]: true }));
  }

  function focusFirstInvalid() {
    setSubmitAttempted(true);
    const firstInvalid = (
      ["name", "email", "city", "phone", "address"] as FieldName[]
    ).find((f) => errors[f]);
    if (firstInvalid) fieldRefs[firstInvalid].current?.focus();
  }

  async function handleRequestQuote() {
    if (isCreatingOrder) return;
    if (!canSubmit) {
      focusFirstInvalid();
      return;
    }
    setIsCreatingOrder(true);
    setOrderError(null);
    const isHome = deliveryMode === "domicilio";
    const res = await createOrderAction({
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        // En oficina no se envía dirección: nunca se guarda una de relleno.
        address: isHome ? customer.address : undefined,
        addressLine2: isHome ? customer.addressLine2 || undefined : undefined,
      },
      shipping: {
        deliveryMode,
        pickupOfficePreference: isHome
          ? undefined
          : pickupOfficePreference || undefined,
        carrierPreference: carrierPreference || undefined,
      },
      items: items.map((i) => ({
        slug: i.slug,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
      })),
      idempotencyKey,
    });
    if (res.ok) {
      // El pedido ya quedó registrado en la base de datos — aquí sí es
      // seguro vaciar el carrito.
      clearCart();
      router.push(`/pedido/${res.orderId}`);
    } else {
      setOrderError(res.error);
      setIsCreatingOrder(false);
    }
  }

  if (items.length === 0) {
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
        Solicita tu pedido
      </h1>

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
                <span className="text-ink/60">Prendas</span>
                <span className="text-lg font-medium">
                  {formatCOP(totalPrice)}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink/40">
                Envío: se cotiza según tu ciudad y modalidad, y se paga al
                recibir.
              </p>
            </div>

            {/* Formulario */}
            <div className="order-2 lg:order-1">
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRequestQuote();
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

                <Field
                  label="Email *"
                  htmlFor="email"
                  error={errorFor("email")}
                  className="sm:col-span-2"
                >
                  <input
                    id="email"
                    ref={emailRef}
                    type="email"
                    required
                    autoComplete="email"
                    value={customer.email}
                    onChange={(e) =>
                      setCustomer((c) => ({ ...c, email: e.target.value }))
                    }
                    onBlur={() => markTouched("email")}
                    aria-invalid={!!errorFor("email")}
                    aria-describedby={
                      errorFor("email") ? "email-error" : undefined
                    }
                    className={`${inputClass} ${errorFor("email") ? "border-[#b23328]" : "border-line"}`}
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

                <div className="sm:col-span-2">
                  <DeliveryModeSelector
                    name="deliveryMode"
                    value={deliveryMode}
                    onChange={setDeliveryMode}
                  />
                </div>

                {deliveryMode === "domicilio" ? (
                  <>
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
                          setCustomer((c) => ({
                            ...c,
                            address: e.target.value,
                          }))
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
                  </>
                ) : (
                  <Field
                    label="Oficina o sede preferida (opcional)"
                    htmlFor="pickupOfficePreference"
                    className="sm:col-span-2"
                  >
                    <input
                      id="pickupOfficePreference"
                      maxLength={MAX_PICKUP_OFFICE_LENGTH}
                      placeholder="Barrio o sede de la transportadora"
                      value={pickupOfficePreference}
                      onChange={(e) => setPickupOfficePreference(e.target.value)}
                      className={`${inputClass} border-line`}
                    />
                  </Field>
                )}

                <Field
                  label="Transportadora (opcional)"
                  htmlFor="carrierPreference"
                  className="sm:col-span-2"
                >
                  <span className="-mt-1 text-xs text-ink/50">
                    Normalmente enviamos con {DEFAULT_CARRIER}. Si prefieres
                    otra transportadora, escríbela aquí.
                  </span>
                  <input
                    id="carrierPreference"
                    maxLength={MAX_CARRIER_PREFERENCE_LENGTH}
                    value={carrierPreference}
                    onChange={(e) => setCarrierPreference(e.target.value)}
                    className={`${inputClass} border-line`}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={isCreatingOrder}
                  className={`label mt-2 w-full py-4 text-center sm:col-span-2 ${
                    isCreatingOrder
                      ? "cursor-wait bg-ink/60 text-paper"
                      : "bg-ink text-paper hover:bg-ink/85"
                  }`}
                >
                  {isCreatingOrder ? "Enviando…" : "Solicitar cotización de envío"}
                </button>
                {orderError && (
                  <p className="text-sm text-[#b23328] sm:col-span-2">
                    {orderError}
                  </p>
                )}
                <div className="text-sm leading-relaxed text-ink/70 sm:col-span-2">
                  <p className="font-medium text-ink">
                    Todavía no realizas ningún pago.
                  </p>
                  <p className="mt-1">
                    {QUOTE_RESPONSE_TIME_COPY} Cuando la veas, decides si
                    aceptas el total.
                  </p>
                </div>
                <p className="text-xs text-ink/40 sm:col-span-2">
                  * Campos obligatorios.
                </p>
              </form>

              <div className="mt-6 text-center sm:text-left">
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
          </div>
    </div>
  );
}
