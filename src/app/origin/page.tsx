import type { Metadata } from "next";
import EditorialImage from "@/components/EditorialImage";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS } from "@/data/products";

export const metadata: Metadata = {
  title: "Origin",
  description:
    "Origin — donde empieza la identidad de VALENCIANO. Primeras referencias con diseño propio.",
};

export default function OriginPage() {
  const products = PRODUCTS.filter((p) => p.collection === "origin");

  return (
    <div>
      <section className="relative flex h-[65vh] min-h-[440px] w-full items-center justify-center overflow-hidden bg-brand-stone">
        <EditorialImage
          src="/products/origin-arena/arena-2.jpg"
          alt="Origin"
          priority
          gradient="from-[#d9d2c2] via-[#c9c2b0] to-[#b6ae9c]"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <h1 className="font-display text-5xl text-white sm:text-7xl">Origin</h1>
          <p className="label mt-6 text-white/85">Donde empieza la identidad</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8">
        <div className="mb-12">
          <p className="label text-ink/40">Origin</p>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl">Colección</h2>
        </div>
        {products.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink/50">
            Próximamente nuevas referencias.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
