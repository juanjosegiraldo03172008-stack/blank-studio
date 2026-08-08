"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { COLORS, formatCOP } from "@/data/products";

export default function CartDrawer() {
  const { itemsWithPrice, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-ink/30 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-paper shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="label">Tu pedido</p>
          <button onClick={closeCart} aria-label="Cerrar" className="text-lg">
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
                <li key={item.id} className="flex gap-4">
                  <div
                    className="h-20 w-16 flex-shrink-0 rounded-sm"
                    style={{ backgroundColor: COLORS[item.color].hex }}
                  />
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-ink/50">
                      {COLORS[item.color].name} · Talla {item.size}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center border border-line">
                        <button
                          className="px-2 py-1 text-sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          aria-label="Restar"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          className="px-2 py-1 text-sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          aria-label="Sumar"
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-xs text-ink/40 underline underline-offset-2 hover:text-ink"
                        onClick={() => removeItem(item.id)}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                  <p className="whitespace-nowrap text-sm text-ink/70">
                    {formatCOP(item.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-line px-6 py-5">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-ink/60">Total</span>
            <span className="font-medium">{formatCOP(totalPrice)}</span>
          </div>
          <p className="mb-4 text-xs text-ink/40">
            Envío calculado en el siguiente paso.
          </p>
          <Link
            href="/pedido"
            onClick={closeCart}
            className={`block w-full py-3 text-center label transition ${
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
