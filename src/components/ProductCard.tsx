"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import ProductCarousel, { type CarouselImage } from "./ProductCarousel";
import ColorSwatch from "./ColorSwatch";
import {
  allColorsFor,
  COLORS,
  formatCOP,
  getUnitPrice,
  type ColorId,
  type Product,
} from "@/data/products";

export default function ProductCard({
  product,
  priority = false,
  initialColor,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  linkColor = false,
}: {
  product: Product;
  priority?: boolean;
  /** Color mostrado por defecto (antes del hover) — útil para dar ritmo cromático a una grilla. */
  initialColor?: ColorId;
  /** Ajusta según el ancho real de la tarjeta en su contexto (grid 4-col, riel horizontal, etc). */
  sizes?: string;
  /** Enlaza directo al color mostrado (?color=) — para carriles de recomendación donde el color es parte de la sugerencia. */
  linkColor?: boolean;
}) {
  const colors = allColorsFor(product);
  const [hoverColor, setHoverColor] = useState(
    initialColor && colors.includes(initialColor) ? initialColor : colors[0]
  );
  const price = getUnitPrice(product.line);
  const wasDragging = useRef(false);

  const media = product.media?.[hoverColor];
  const images: CarouselImage[] = media
    ? media.map((m) => ({ src: m.src, alt: m.alt }))
    : [
        {
          src: product.coverImage,
          alt: `${product.name} en ${COLORS[hoverColor].name}`,
        },
      ];
  // Solo desktop: en hover se revela una segunda toma (espalda o modelo) por
  // encima de la primera. Se implementa como imagen hermana en vez de mover
  // ProductCarousel a modo controlado, que precargaría todas las imágenes
  // de cada tarjeta de la grilla.
  const hoverImage = media?.find((m) => m.role === "back" || m.role === "model");

  return (
    <Link
      href={linkColor ? `/producto/${product.slug}?color=${hoverColor}` : `/producto/${product.slug}`}
      className="group block"
      onClickCapture={(e) => {
        if (wasDragging.current) {
          e.preventDefault();
          wasDragging.current = false;
        }
      }}
    >
      <div className="relative">
        <ProductCarousel
          images={images}
          fit={product.fit}
          hex={COLORS[hoverColor].hex}
          fallbackSrc={product.coverImage}
          priority={priority}
          bgClassName="bg-[#efece4] transition-colors duration-500 group-hover:bg-[#e9e5db]"
          sizes={sizes}
          onDragStateChange={(dragging) => {
            if (dragging) wasDragging.current = true;
          }}
        />
        {hoverImage && (
          <Image
            src={hoverImage.src}
            alt={hoverImage.alt}
            fill
            loading="lazy"
            sizes={sizes}
            className="pointer-events-none absolute inset-0 hidden object-cover opacity-0 transition-opacity duration-500 motion-reduce:transition-none md:block md:group-hover:opacity-100"
          />
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-ui label text-ink/40">
            {product.fit === "essential" ? "Essential" : "Oversize"} · {product.gsm} GSM
          </p>
          <h3 className="mt-1.5 text-sm font-medium tracking-tight">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-ink/50">{COLORS[hoverColor].name}</p>
        </div>
        <p className="font-ui whitespace-nowrap text-sm text-ink/80">
          {formatCOP(price)}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {colors.slice(0, 9).map((c) => (
          <span
            key={c}
            onMouseEnter={(e) => {
              e.preventDefault();
              setHoverColor(c);
            }}
          >
            <ColorSwatch color={c} size="sm" selected={c === hoverColor} />
          </span>
        ))}
        {colors.length > 9 && (
          <span className="label self-center text-ink/40">
            +{colors.length - 9}
          </span>
        )}
      </div>
    </Link>
  );
}
