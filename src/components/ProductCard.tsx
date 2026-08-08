"use client";

import Link from "next/link";
import { useState } from "react";
import ProductImage from "./ProductImage";
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
  const cardImage = product.media?.[hoverColor]?.[0]?.src ?? `${product.imageFolder}/${hoverColor}-1.jpg`;

  return (
    <Link href={`/producto/${product.slug}`} className="group block">
      <ProductImage
        src={cardImage}
        alt={`${product.name} en ${COLORS[hoverColor].name}`}
        fit={product.fit}
        hex={COLORS[hoverColor].hex}
        fallbackSrc={product.coverImage}
        bgClassName="bg-[#efece4] transition-colors duration-500 group-hover:bg-[#e9e5db]"
      />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium tracking-tight">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-ink/50">{product.tagline}</p>
        </div>
        <p className="whitespace-nowrap text-sm text-ink/80">
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
