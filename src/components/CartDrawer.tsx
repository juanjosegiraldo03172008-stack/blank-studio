"use client";

import Link from "next/link";
import { useRef } from "react";
import { useCart, type CartItemWithPrice } from "@/context/CartContext";
import { COLORS, formatCOP, getProductBySlug } from "@/data/products";
import CartItemThumbnail from "@/components/CartItemThumbnail";
import { useDrawer } from "@/hooks/useDrawer";

function CartLineItem({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItemWithPrice;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}) {
  const product = getProductBySlug(item.slug);
  const colorMeta = COLORS[item.color];

  return (
    <li className="flex gap-4">
      <CartItemThumbnail slug={item.slug} color={item.color} name={item.name} />
      <div className="flex flex-1 flex-col">
        <p className="text-sm font-medium">{item.name}</p>
        {product && (
          <p className="label mt-0.5 text-ink/35">
            {product.fit === "essential" ? "Essentials" : "Oversize"} · {product.gsm} GSM
          </p>
        )}
        <p className="mt-1 text-xs text-ink/50">
          {colorMeta.name} · Talla {item.size}
        </p>
        <div className="mt-2.5 flex items-center gap-4">
          <div className="font-ui flex items-center border border-line">
            <button
              className="flex h-9 w-8 items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              aria-label={`Reducir cantidad de ${item.name}`}
            >
              −
            </button>
            <span className="w-6 text-center text-sm" aria-live="polite">
              {item.quantity}
            </span>
            <button
              className="flex h-9 w-8 items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              aria-label={`Aumentar cantidad de ${item.name}`}
            >
              +
            </button>
          </div>
          <button
            className="font-ui text-xs text-ink/40 underline underline-offset-2 hover:text-ink focus-visible:outline-none focus-visible:text-ink"
            onClick={() => onRemove(item.id)}
          >
            Quitar
          </button>
        </div>
      </div>
      <p className="font-ui whitespace-nowrap text-sm text-ink/70">
        {formatCOP(item.lineTotal)}
      </p>
    </li>
  );
}

export default function CartDrawer() {
  const { itemsWithPrice, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCart();
  const asideRef = useRef<HTMLElement>(null);

  useDrawer(isOpen, closeCart, asideRef);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-ink/30 transition-opacity duration-300 motion-reduce:transition-none ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        ref={asideRef}
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-paper shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="label">Tu pedido</p>
          <button
            onClick={closeCart}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center text-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {itemsWithPrice.length === 0 ? (
            <p className="mt-10 text-center text-sm text-ink/50">
              Aún no has agregado prendas.
            </p>
          ) : (
            <ul className="flex flex-col gap-6">
              {itemsWithPrice.map((item) => (
                <CartLineItem
                  key={item.id}
                  item={item}
                  onRemove={removeItem}
                  onUpdateQuantity={updateQuantity}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-line px-6 py-5">
          <div className="font-ui mb-1 flex items-center justify-between text-sm">
            <span className="text-ink/60">Subtotal</span>
            <span className="font-medium">{formatCOP(totalPrice)}</span>
          </div>
          <p className="mb-4 text-xs text-ink/40">
            Envío calculado en el siguiente paso.
          </p>
          <Link
            href="/pedido"
            onClick={closeCart}
            className={`label block w-full py-4 text-center transition-colors duration-200 ${
              itemsWithPrice.length === 0
                ? "pointer-events-none bg-ink/20 text-paper"
                : "bg-ink text-paper hover:bg-ink/85"
            }`}
          >
            Finalizar pedido
          </Link>
        </div>
      </aside>
    </>
  );
}
