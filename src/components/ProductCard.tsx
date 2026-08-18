"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import ProductCarousel, { type CarouselImage } from "./ProductCarousel";
import ColorSwatch from "./ColorSwatch";
import {
  allColorsFor,
  COLORS,
  formatCOP,
  getUnitPrice,
  type Product,
} from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
  const colors = allColorsFor(product);
  const [hoverColor, setHoverColor] = useState(colors[0]);
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

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group block"
      onClickCapture={(e) => {
        if (wasDragging.current) {
          e.preventDefault();
          wasDragging.current = false;
        }
      }}
    >
      <ProductCarousel
        images={images}
        fit={product.fit}
        hex={COLORS[hoverColor].hex}
        fallbackSrc={product.coverImage}
        bgClassName="bg-[#efece4] transition-colors duration-500 group-hover:bg-[#e9e5db]"
        onDragStateChange={(dragging) => {
          if (dragging) wasDragging.current = true;
        }}
      />
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
