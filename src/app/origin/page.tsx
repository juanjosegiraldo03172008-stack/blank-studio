import type { Metadata } from "next";
import Image from "next/image";
import ProductGrid from "@/components/ProductGrid";
import Reveal from "@/components/Reveal";
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
      <section className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16">
        <Reveal className="order-2 max-w-lg lg:order-1">
          <p className="label text-ink/40">Origin</p>
          <h1 className="font-display mt-3 text-5xl sm:text-6xl">Origin</h1>
          <p className="label mt-5 text-ink/60">Donde empieza la identidad</p>
          <p className="mt-6 text-sm leading-relaxed text-ink/65">
            El primer universo propio de VALENCIANO: diseño con identidad
            gráfica, más expresivo que Iconic, siempre sobre la misma base de
            100% algodón peruano.
          </p>
        </Reveal>
        <Reveal
          delay={100}
          className="order-1 flex aspect-[4/5] w-full items-center justify-center bg-brand-sand/25 lg:order-2"
        >
          <div className="relative h-[85%] w-[85%]">
            <Image
              src="/products/origin-arena/arena-1.jpg"
              alt="Origin — Legacy Of Luxury, color arena"
              fill
              preload
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-contain"
            />
          </div>
        </Reveal>
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
          <ProductGrid products={products} />
        )}
      </section>
    </div>
  );
}
