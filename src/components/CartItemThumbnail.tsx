"use client";

import ProductCarousel from "@/components/ProductCarousel";
import { COLORS, getProductBySlug, type ColorId } from "@/data/products";

/** Miniatura de línea de carrito — misma foto real en el drawer y en /pedido. */
export default function CartItemThumbnail({
  slug,
  color,
  name,
  className = "h-24 w-[4.8rem]",
}: {
  slug: string;
  color: ColorId;
  name: string;
  className?: string;
}) {
  const product = getProductBySlug(slug);
  const colorMeta = COLORS[color];

  if (!product) {
    return (
      <div
        className={`flex-shrink-0 ${className}`}
        style={{ backgroundColor: colorMeta.hex }}
      />
    );
  }

  const media = product.media?.[color]?.[0];

  return (
    <div className={`flex-shrink-0 overflow-hidden bg-[#efece4] ${className}`}>
      <ProductCarousel
        images={[
          {
            src: media?.src ?? product.coverImage,
            alt: media?.alt ?? `${name} en ${colorMeta.name}`,
          },
        ]}
        fit={product.fit}
        hex={colorMeta.hex}
        fallbackSrc={product.coverImage}
        bgClassName="bg-[#efece4]"
        aspectClassName="h-full"
        sizes="80px"
      />
    </div>
  );
}
