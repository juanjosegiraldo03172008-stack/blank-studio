import Link from "next/link";
import EditorialImage from "@/components/EditorialImage";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { PRODUCTS, type ColorId } from "@/data/products";

const SHOP_FILTERS = [
  { href: "/catalogo", label: "Todos" },
  { href: "/catalogo?fit=essential", label: "Essentials" },
  { href: "/catalogo?fit=oversize", label: "Oversize" },
];

// Un color inicial distinto por card para que la grilla tenga ritmo cromático
// en vez de mostrar cuatro veces el mismo blanco por defecto.
const HOME_INITIAL_COLOR: Record<string, ColorId> = {
  "essentials-200": "blanco",
  "essentials-300": "beige",
  "oversize-200": "negro",
  "oversize-300": "merlot",
};

const COLLECTIONS = [
  {
    name: "Iconic",
    tagline: "Diseñado para quedarse en el clóset, no en una temporada",
    href: "/catalogo",
    image: "/products/oversize-300/negro-back.jpg",
    gradient: "from-[#111110] via-[#0c0b0a] to-[#050505]",
  },
  {
    name: "Legacy",
    tagline: "Diseñado para perdurar",
    href: "/legacy",
    image: "/products/legacy-merlot/merlot-4.jpg",
    gradient: "from-[#2a1013] via-[#1c0a0c] to-[#0c0405]",
  },
  {
    name: "Origin",
    tagline: "Donde empieza la identidad",
    href: "/origin",
    image: "/products/origin-arena/arena-2.jpg",
    gradient: "from-[#3a3226] via-[#2a2419] to-[#18140d]",
  },
];

export default function Home() {
  const iconicProducts = PRODUCTS.filter((p) => p.collection === "iconic");

  return (
    <div>
      {/* HERO — editorial dividido: texto a la izquierda, fotografía a la derecha */}
      <section className="mx-auto max-w-[1600px] px-5 pt-6 sm:px-8 sm:pt-8">
        <div className="grid grid-cols-1 items-stretch gap-8 overflow-hidden bg-brand-black lg:grid-cols-12 lg:gap-0">
          <Reveal className="order-2 flex flex-col justify-center px-6 py-14 sm:px-12 sm:py-20 lg:order-1 lg:col-span-5 lg:py-0">
            <p className="label text-white/50">Un estilo, no una temporada</p>
            <h1 className="font-display mt-4 text-4xl leading-[1.05] text-white sm:text-5xl lg:text-[3.25rem]">
              Un estilo que perdura
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/70">
              Ropa esencial en 100% algodón peruano, con una estética elegante
              e italiana. Essentials y Oversize, horma limpia, materiales
              premium.
            </p>
            <Link
              href="/catalogo"
              className="label mt-9 inline-flex w-fit items-center border border-white/60 px-8 py-4 text-white transition hover:border-white hover:bg-white hover:text-ink"
            >
              Ver colección →
            </Link>
          </Reveal>

          <Reveal
            delay={100}
            className="relative order-1 aspect-[4/5] w-full overflow-hidden bg-brand-black sm:aspect-[16/10] lg:order-2 lg:col-span-7 lg:aspect-auto"
          >
            <EditorialImage
              src="/products/essentials-200/beige-model-1.jpg"
              alt="VALENCIANO — Essentials 200 en beige"
              className="object-[center_15%]"
              priority
            />
            {/* Tratamiento cálido sobre una foto de estudio real (no hay
                herramienta de generación de imágenes disponible para producir
                una toma ambientada nueva) — no altera la prenda ni el archivo. */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2a2117]/70 via-[#2a2117]/10 to-transparent mix-blend-multiply" />
            <div className="absolute inset-0 bg-[#caa876]/10 mix-blend-color" />
          </Reveal>
        </div>
      </section>

      {/* DESTACADOS — producto primero, visible desde el primer scroll */}
      <section id="shop" className="mx-auto max-w-[1600px] scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
        <Reveal className="mb-10 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label text-ink/40">Destacados</p>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl">
              Las cuatro esenciales
            </h2>
          </div>
          <nav
            aria-label="Filtrar por categoría"
            className="flex flex-wrap gap-x-5 gap-y-2 sm:flex-nowrap sm:gap-6"
          >
            {SHOP_FILTERS.map((f) => (
              <Link
                key={f.label}
                href={f.href}
                className="label whitespace-nowrap text-ink/50 transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline-none"
              >
                {f.label}
              </Link>
            ))}
          </nav>
        </Reveal>
        <div className="grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4">
          {iconicProducts.map((product, i) => (
            <ProductCard
              key={product.slug}
              product={product}
              priority={i < 4}
              initialColor={HOME_INITIAL_COLOR[product.slug]}
            />
          ))}
        </div>
        <Link
          href="/catalogo"
          className="label mt-12 block border-b border-ink pb-1 text-center sm:hidden"
        >
          Ver todo el catálogo →
        </Link>
      </section>

      {/* COLECCIONES — Iconic, Legacy y Origin como tres tarjetas equivalentes */}
      <section className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 sm:py-24">
        <Reveal className="mb-10 sm:mb-12">
          <p className="label text-ink/40">Colecciones</p>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl">
            Nuestras colecciones
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {COLLECTIONS.map((c, i) => (
            <Reveal key={c.name} delay={i * 80}>
              <Link
                href={c.href}
                className="group relative flex aspect-[3/4] w-full items-end overflow-hidden bg-brand-black"
              >
                <EditorialImage
                  src={c.image}
                  alt={`VALENCIANO ${c.name}`}
                  gradient={c.gradient}
                  className="transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="relative z-10 flex flex-col items-start gap-2 p-7">
                  <p className="font-display text-2xl text-white sm:text-3xl">
                    {c.name}
                  </p>
                  <p className="label max-w-[22ch] text-white/75">
                    {c.tagline}
                  </p>
                  <span className="label mt-2 inline-block border-b border-white/60 pb-1 text-white transition group-hover:border-white">
                    Descubrir →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CALIDAD — breve, visual, sin interrumpir el recorrido de compra */}
      <section className="bg-black/[0.02] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden bg-brand-stone">
                <EditorialImage
                  src="/products/essentials-200/blanco-detail.jpg"
                  alt="Detalle de tela — 100% algodón peruano"
                />
              </div>
            </Reveal>
            <Reveal delay={100} className="lg:col-span-7">
              <p className="label text-ink/40">100% algodón peruano</p>
              <h2 className="font-display mt-3 text-3xl leading-snug sm:text-4xl">
                Hecho para quedarse, no para una temporada
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ink/60">
                Dos gramajes, dos sensaciones. Cada prenda está confeccionada
                con materiales premium y una horma limpia, pensada para
                acompañarte más allá de una tendencia.
              </p>
              <Link
                href="/marca"
                className="label mt-7 inline-block border-b border-ink pb-1"
              >
                Conocer la marca →
              </Link>

              <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-8 sm:grid-cols-4 sm:gap-4">
                {[
                  "100% algodón peruano",
                  "Fit oversize premium",
                  "Pago contraentrega",
                  "Atención por Instagram",
                ].map((item) => (
                  <li key={item} className="label text-ink/55">
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
