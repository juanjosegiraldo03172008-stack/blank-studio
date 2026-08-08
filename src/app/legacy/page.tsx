import type { Metadata } from "next";
import EditorialImage from "@/components/EditorialImage";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS } from "@/data/products";

export const metadata: Metadata = {
  title: "Legacy",
  description:
    "Legacy — la propuesta más especial de VALENCIANO. Diseñado para perdurar.",
};

export default function LegacyPage() {
  const products = PRODUCTS.filter((p) => p.collection === "legacy");

  return (
    <div>
      <section className="relative flex h-[65vh] min-h-[440px] w-full items-center justify-center overflow-hidden bg-brand-black">
        <EditorialImage
          src="/products/legacy-merlot/merlot-1.jpg"
          alt="Legacy"
          priority
          gradient="from-[#2a1013] via-[#1c0a0c] to-[#0c0405]"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <h1 className="font-display text-5xl text-white sm:text-7xl">Legacy</h1>
          <p className="label mt-6 text-white/85">Diseñado para perdurar</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8">
        <div className="mb-12">
          <p className="label text-ink/40">Legacy</p>
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
