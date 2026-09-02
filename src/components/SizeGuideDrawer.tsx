"use client";

import Link from "next/link";
import { useRef } from "react";
import { useDrawer } from "@/hooks/useDrawer";
import type { Product } from "@/data/products";

/** Guía de tallas del producto actual, en un drawer — evita sacar al usuario de la PDP. */
export default function SizeGuideDrawer({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDrawer(open, onClose, panelRef);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-ink/30 transition-opacity duration-300 motion-reduce:transition-none ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Guía de tallas"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-paper shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="label">Guía de tallas</p>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center text-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <p className="label text-ink/40">{product.name}</p>
          <p className="mt-4 text-xs leading-relaxed text-ink/60">
            Medidas en centímetros, con la prenda extendida sobre una superficie
            plana. Pueden variar entre 1 y 2 cm de una unidad a otra.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[280px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="label py-2 pr-3 font-medium text-ink/50">
                    Talla
                  </th>
                  {product.sizeChart.map((row) => (
                    <th
                      key={row.size}
                      className="label py-2 pr-3 text-center font-medium text-ink/50"
                    >
                      {row.size}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line-soft">
                  <td className="py-2 pr-3 text-ink/60">Pecho (cm)</td>
                  {product.sizeChart.map((row) => (
                    <td key={row.size} className="py-2 pr-3 text-center">
                      {row.chestCm}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pr-3 text-ink/60">Largo (cm)</td>
                  {product.sizeChart.map((row) => (
                    <td key={row.size} className="py-2 pr-3 text-center">
                      {row.lengthCm}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-line-soft pt-6 text-xs leading-relaxed text-ink/60">
            <p>
              <span className="label text-ink/50">Ancho de pecho — </span>
              Mide de axila a axila, en línea recta, con la prenda extendida.
            </p>
            <p>
              <span className="label text-ink/50">Largo — </span>
              Mide desde el punto más alto del hombro hasta el borde inferior de
              la prenda.
            </p>
            {product.sizes.includes("2XL") && (
              <p>La talla 2XL está disponible únicamente en Negro y Blanco.</p>
            )}
          </div>

          <Link
            href="/guia-de-tallas"
            onClick={onClose}
            className="label mt-8 inline-block border-b border-ink pb-1 text-ink"
          >
            Ver guía completa →
          </Link>
        </div>
      </div>
    </>
  );
}
