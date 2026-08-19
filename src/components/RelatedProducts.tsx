import ProductCard from "./ProductCard";
import type { RelatedItem } from "@/lib/relatedProducts";

export default function RelatedProducts({ items }: { items: RelatedItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8">
      <div className="mb-10">
        <p className="label text-ink/40">Descubre más</p>
        <h2 className="font-display mt-3 text-3xl sm:text-4xl">Seguir explorando</h2>
      </div>
      <div
        role="region"
        aria-label="Productos relacionados — desplázate horizontalmente para ver más"
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink sm:gap-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map(({ product, color }) => (
          <div
            key={`${product.slug}-${color}`}
            className="w-[62vw] flex-shrink-0 snap-start sm:w-[280px] lg:w-[320px]"
          >
            <ProductCard
              product={product}
              initialColor={color}
              linkColor
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 280px, 62vw"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
