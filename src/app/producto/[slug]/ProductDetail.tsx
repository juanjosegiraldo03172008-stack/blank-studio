"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import ColorSwatch from "@/components/ColorSwatch";
import { useCart } from "@/context/CartContext";
import {
  COLORS,
  formatCOP,
  getUnitPrice,
  isSizeAvailable,
  type ColorId,
  type Product,
  type Size,
} from "@/data/products";

export default function ProductDetail({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const [color, setColor] = useState<ColorId>(product.colorsLinea[0]);
  const [size, setSize] = useState<Size>(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Precio fijo B2C — no varía con la talla ni la cantidad.
  const unitPrice = getUnitPrice(product.line);
  const total = unitPrice === null ? null : unitPrice * quantity;

  const sizeOptions = useMemo(() => product.sizes, [product.sizes]);

  const media = product.media?.[color];

  function handleSelectColor(c: ColorId) {
    setColor(c);
    if (!isSizeAvailable(product, size, c)) {
      const fallback = product.sizes.find((s) => isSizeAvailable(product, s, c));
      if (fallback) setSize(fallback);
    }
  }

  function handleAdd() {
    addItem({ slug: product.slug, name: product.name, line: product.line, color, size, quantity });
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="grid grid-cols-2 gap-3">
          {media ? (
            media.map((item, i) => (
              <div key={item.src} className={i === 0 ? "col-span-2" : ""}>
                <ProductImage
                  src={item.src}
                  alt={item.alt}
                  fit={product.fit}
                  hex={COLORS[color].hex}
                  priority={i === 0}
                  variant={i}
                  bgClassName="bg-[#efece4]"
                />
              </div>
            ))
          ) : (
            <>
              <div className="col-span-2">
                <ProductImage
                  src={`${product.imageFolder}/${color}-1.jpg`}
                  fallbackSrc={product.coverImage}
                  alt={`${product.name} en ${COLORS[color].name}`}
                  fit={product.fit}
                  hex={COLORS[color].hex}
                  priority
                  bgClassName="bg-[#efece4]"
                />
              </div>
              {[1, 2].map((v) => (
                <ProductImage
                  key={v}
                  src={`${product.imageFolder}/${color}-${v + 1}.jpg`}
                  alt={`${product.name} detalle ${v}`}
                  fit={product.fit}
                  hex={COLORS[color].hex}
                  variant={v}
                  bgClassName="bg-[#efece4]"
                />
              ))}
            </>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="label text-ink/40">
            {product.fit === "essential" ? "Essentials" : "Oversize"} · {product.gsm} GSM
          </p>
          <h1 className="font-display mt-2 text-4xl">{product.name}</h1>
          <p className="mt-3 text-sm text-ink/60">{product.tagline}</p>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-ink/70">
            {product.description}
          </p>

          {/* Price */}
          <div className="mt-8">
            <p className="text-2xl font-medium">{formatCOP(unitPrice)}</p>
            <p className="text-xs text-ink/45">
              Precio por unidad · Total: {formatCOP(total)}
            </p>
          </div>

          {/* Color */}
          <div className="mt-8">
            <p className="label text-ink/50">
              Color — <span className="text-ink">{COLORS[color].name}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.colorsLinea.map((c) => (
                <ColorSwatch
                  key={c}
                  color={c}
                  selected={c === color}
                  onClick={() => handleSelectColor(c)}
                />
              ))}
            </div>
            {product.colorsTemporada.length > 0 && (
              <div className="mt-5">
                <p className="label text-ink/40">
                  Colores de temporada{" "}
                  <span className="normal-case tracking-normal text-ink/35">
                    (sujeto a disponibilidad)
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.colorsTemporada.map((c) => (
                    <ColorSwatch
                      key={c}
                      color={c}
                      selected={c === color}
                      onClick={() => handleSelectColor(c)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Size */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="label text-ink/50">Talla</p>
              <Link
                href="/guia-de-tallas"
                className="text-xs text-ink/50 underline underline-offset-2 hover:text-ink"
              >
                Guía de tallas
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizeOptions.map((s) => {
                const available = isSizeAvailable(product, s, color);
                return (
                  <button
                    key={s}
                    disabled={!available}
                    onClick={() => setSize(s)}
                    title={
                      available
                        ? undefined
                        : "2XL solo disponible en Negro y Blanco"
                    }
                    className={`label h-11 min-w-11 px-3 transition ${
                      !available
                        ? "cursor-not-allowed border border-line text-ink/25 line-through"
                        : s === size
                        ? "bg-ink text-paper"
                        : "border border-line text-ink/70 hover:border-ink hover:text-ink"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-8">
            <p className="label text-ink/50">Cantidad</p>
            <div className="mt-3 flex items-center border border-line w-fit">
              <button
                className="px-4 py-3 text-sm"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                className="px-4 py-3 text-sm"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAdd}
            className="label mt-8 w-full bg-ink py-4 text-center text-paper transition hover:bg-ink/85 sm:w-auto sm:px-14"
          >
            {added ? "Agregado ✓" : "Agregar al carrito"}
          </button>

          {/* Details */}
          <div className="mt-10 border-t border-line pt-6">
            <p className="label text-ink/40">Detalles</p>
            <ul className="mt-4 flex flex-col gap-2">
              {product.details.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm text-ink/70">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-ink/40" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
