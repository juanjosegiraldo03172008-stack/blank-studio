"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { COLORS, formatCOP } from "@/data/products";
import {
  buildOrderMessage,
  copyOrderAndOpenInstagram,
  INSTAGRAM_HANDLE,
  type CustomerInfo,
} from "@/lib/instagramOrder";

type Step = "form" | "confirm";

export default function PedidoPage() {
  const { itemsWithPrice: items, totalPrice, updateQuantity, removeItem } = useCart();
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    city: "",
    phone: "",
    notes: "",
  });
  const [step, setStep] = useState<Step>("form");
  const [copied, setCopied] = useState(false);

  const message = useMemo(
    () => buildOrderMessage(items, customer),
    [items, customer]
  );

  const canSubmit =
    items.length > 0 &&
    customer.name.trim() !== "" &&
    customer.city.trim() !== "" &&
    customer.phone.trim() !== "";

  async function handleSend() {
    if (!canSubmit) return;
    await copyOrderAndOpenInstagram(message);
    setCopied(true);
    setStep("confirm");
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
        <h1 className="font-display text-2xl">Tu pedido está vacío</h1>
        <p className="mt-3 text-sm text-ink/60">
          Explora el catálogo y agrega las prendas que quieras pedir.
        </p>
        <Link
          href="/catalogo"
          className="label mt-8 inline-block bg-ink px-8 py-3 text-paper"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <p className="label text-ink/50">Pedido</p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">
        {step === "form" ? "Confirma tu pedido" : "Casi listo"}
      </h1>

      {step === "form" && (
        <>
          <ul className="mt-10 flex flex-col gap-5 border-y border-line py-8">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-4">
                <div
                  className="h-16 w-14 flex-shrink-0"
                  style={{ backgroundColor: COLORS[item.color].hex }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-ink/50">
                    {COLORS[item.color].name} · Talla {item.size}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/40">
                    {formatCOP(item.unitPrice)} c/u
                  </p>
                </div>
                <div className="flex items-center border border-line">
                  <button
                    className="px-2 py-1 text-sm"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    className="px-2 py-1 text-sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <p className="w-24 text-right text-sm text-ink/70">
                  {formatCOP(item.lineTotal)}
                </p>
                <button
                  className="text-xs text-ink/40 underline underline-offset-2 hover:text-ink"
                  onClick={() => removeItem(item.id)}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between pt-6 text-sm">
            <span className="text-ink/60">Total estimado</span>
            <span className="text-lg font-medium">{formatCOP(totalPrice)}</span>
          </div>
          <p className="pb-6 text-xs text-ink/40">
            Puedes mezclar referencias, colores y tallas S–XL: la escala de
            precio se calcula sobre el total de unidades de todo el pedido.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2"
          >
            <label className="flex flex-col gap-2 sm:col-span-1">
              <span className="label text-ink/50">Nombre completo *</span>
              <input
                required
                value={customer.name}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, name: e.target.value }))
                }
                className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-2 sm:col-span-1">
              <span className="label text-ink/50">Ciudad *</span>
              <input
                required
                value={customer.city}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, city: e.target.value }))
                }
                className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-2 sm:col-span-1">
              <span className="label text-ink/50">Teléfono / WhatsApp *</span>
              <input
                required
                value={customer.phone}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, phone: e.target.value }))
                }
                className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-2 sm:col-span-1">
              <span className="label text-ink/50">Notas (opcional)</span>
              <input
                value={customer.notes}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, notes: e.target.value }))
                }
                className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </label>

            <div className="sm:col-span-2 mt-4 border border-line-soft bg-black/[0.02] p-5">
              <p className="label text-ink/50">Cómo funciona el envío</p>
              <ol className="mt-3 flex flex-col gap-2 text-sm text-ink/70">
                <li>1. Al presionar &quot;Enviar pedido&quot;, copiamos automáticamente el resumen a tu portapapeles.</li>
                <li>2. Se abrirá el chat directo de Instagram con @{INSTAGRAM_HANDLE} en una pestaña nueva.</li>
                <li>3. Pega el mensaje ahí (mantén presionado y elige &quot;Pegar&quot;, o Ctrl/Cmd + V).</li>
                <li>4. Presiona enviar en Instagram — con eso tu pedido queda registrado.</li>
              </ol>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`label mt-2 w-full py-4 text-center sm:col-span-2 ${
                canSubmit
                  ? "bg-ink text-paper hover:bg-ink/85"
                  : "cursor-not-allowed bg-ink/20 text-paper"
              }`}
            >
              Enviar pedido por Instagram
            </button>
            <p className="text-xs text-ink/40 sm:col-span-2">
              * Campos obligatorios. Los precios son estimados y se confirman
              por Instagram antes del envío.
            </p>
          </form>
        </>
      )}

      {step === "confirm" && (
        <div className="mt-10">
          <div className="border border-ink/20 bg-black/[0.02] p-6">
            <p className="text-sm font-medium">
              {copied
                ? "✅ Tu pedido fue copiado. Se abrió Instagram en una pestaña nueva."
                : "Se abrió Instagram en una pestaña nueva. Copia el texto de abajo manualmente."}
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
