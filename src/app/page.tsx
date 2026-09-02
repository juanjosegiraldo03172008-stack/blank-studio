import Link from "next/link";
import EditorialImage from "@/components/EditorialImage";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { PRODUCTS, type ColorId } from "@/data/products";
import { INSTAGRAM_HANDLE } from "@/lib/instagramOrder";

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

export default function Home() {
  const iconicProducts = PRODUCTS.filter((p) => p.collection === "iconic");
  const essentials200 = PRODUCTS.find((p) => p.slug === "essentials-200")!;
  const oversize200 = PRODUCTS.find((p) => p.slug === "oversize-200")!;

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[85vh] min-h-[520px] w-full overflow-hidden bg-brand-black sm:h-[92vh]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/video/hero-loop.mp4"
          poster="/video/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/50" />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 px-4 text-center">
          <h1
            className="font-logo select-none whitespace-nowrap text-white/45"
            style={{ fontSize: "clamp(2.75rem, 13vw, 11rem)", letterSpacing: "0.04em" }}
          >
            VALENCIANO
          </h1>
          <Link
            href="#shop"
            className="label border border-white/50 px-8 py-3.5 text-white backdrop-blur-sm transition hover:border-white hover:bg-white hover:text-ink"
          >
            Ver colección
          </Link>
        </div>
      </section>

      {/* ALGODÓN PERUANO — puente editorial entre el Hero y el producto */}
      <section className="bg-black/[0.02] px-5 py-20 sm:px-8 sm:py-28">
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
                200G / 300G. Dos estructuras, una misma exigencia.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ink/60">
                Colores sólidos que no se encogen ni se deforman — cada
                gramaje responde a un propósito distinto.
              </p>
            </Reveal>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-px bg-line sm:grid-cols-2">
            <Reveal className="bg-paper p-8 sm:p-10">
              <p className="label text-ink/40">200 GSM</p>
              <p className="font-display mt-3 text-xl leading-snug">
                Ligera, fresca y perfecta para el día a día.
              </p>
            </Reveal>
            <Reveal delay={80} className="bg-paper p-8 sm:p-10">
              <p className="label text-ink/40">300 GSM</p>
              <p className="font-display mt-3 text-xl leading-snug">
                Más cuerpo, más presencia, caída firme y suave.
              </p>
            </Reveal>
          </div>

          <div className="mt-px grid grid-cols-1 gap-px bg-line sm:grid-cols-2">
            <Reveal className="relative flex aspect-[16/10] overflow-hidden bg-paper">
              <div className="relative w-1/2">
                <EditorialImage
                  src={essentials200.media?.blanco?.[0]?.src ?? essentials200.coverImage}
                  alt="Essentials — horma normal"
                />
              </div>
              <div className="flex w-1/2 flex-col justify-center bg-paper p-6 sm:p-8">
                <p className="label text-ink/40">Essentials</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">
                  Horma normal, corte recto.
                </p>
              </div>
            </Reveal>
            <Reveal delay={80} className="relative flex aspect-[16/10] overflow-hidden bg-paper">
              <div className="relative w-1/2">
                <EditorialImage
                  src={oversize200.media?.negro?.[0]?.src ?? oversize200.coverImage}
                  alt="Oversize — silueta amplia, cuello en rib"
                />
              </div>
              <div className="flex w-1/2 flex-col justify-center bg-paper p-6 sm:p-8">
                <p className="label text-ink/40">Oversize</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">
                  Silueta amplia, cuello en rib, caída relajada.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SHOP — producto primero */}
      <section id="shop" className="mx-auto max-w-[1600px] scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="mb-10 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label text-ink/40">Shop</p>
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
          Ver todo el catálogo
        </Link>
      </section>

      {/* EDITORIAL */}
      <Link
        href="/catalogo"
        className="group relative flex h-[75vh] min-h-[460px] w-full items-center justify-center overflow-hidden bg-brand-black"
      >
        <EditorialImage
          src="/products/oversize-300/negro-back.jpg"
          alt="VALENCIANO ICONIC — Oversize 300 negro, espalda"
          gradient="from-[#111110] via-[#0c0b0a] to-[#050505]"
          className="opacity-90 transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/35" />
        <Reveal className="relative z-10 flex flex-col items-center px-6 text-center">
          <p className="font-display text-4xl text-white sm:text-5xl">Iconic</p>
          <p className="label mt-4 text-white/75">
            Diseñado para quedarse en el clóset, no en una temporada
          </p>
          <span className="label mt-6 inline-block border-b border-white/60 pb-1 text-white transition group-hover:border-white">
            Descubrir →
          </span>
        </Reveal>
      </Link>

      {/* ORIGIN — CTA */}
      <section className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 sm:py-28">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 max-w-lg lg:order-1">
            <p className="label text-ink/40">Origin</p>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl">
              Donde empieza la identidad
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-ink/65">
              La primera referencia de Origin: oversize en 200 GSM, color
              arena, con el sello VALENCIANO ORIGIN al pecho. El punto de
              partida de un universo que seguirá creciendo.
            </p>
            <Link
              href="/origin"
              className="label mt-7 inline-block border-b border-ink pb-1"
            >
              Descubrir Origin →
            </Link>
          </Reveal>
          <Reveal delay={100} className="order-1 lg:order-2">
            <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden justify-self-center bg-brand-stone lg:justify-self-end">
              <EditorialImage
                src="/products/origin-arena/arena-2.jpg"
                alt="Origin Arena — Legacy Of Luxury"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* LEGACY — bloque editorial */}
      <section className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 sm:py-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
          <Reveal className="lg:col-span-7">
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-brand-stone sm:aspect-[3/4]">
              <EditorialImage
                src="/products/legacy-merlot/merlot-4.jpg"
                alt="Legacy — espalda, estampado Valenciano Legacy"
                objectPosition="center 15%"
                gradient="from-[#2a1013] via-[#1c0a0c] to-[#0c0405]"
              />
            </div>
          </Reveal>

          <div className="flex flex-col justify-between gap-8 lg:col-span-5">
            <Reveal delay={100}>
              <p className="label text-ink/40">Legacy</p>
              <h2 className="font-display mt-3 text-3xl sm:text-4xl">
                Diseñado para perdurar
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink/65">
                Nuestra propuesta más especial: oversize en 300 GSM,
                tipografía grabada y un espíritu de herencia — pensada para
                quedarse en el guardarropa, no en una temporada.
              </p>
              <Link
                href="/legacy"
                className="label mt-7 inline-block border-b border-ink pb-1"
              >
                Ver Legacy →
              </Link>
            </Reveal>

            <Reveal delay={200} className="grid grid-cols-2 gap-4">
              <div className="relative aspect-[6/5] overflow-hidden bg-brand-stone">
                <EditorialImage
                  src="/products/legacy-merlot/merlot-1.jpg"
                  alt="Legacy Merlot — prenda"
                  gradient="from-[#2a1013] via-[#1c0a0c] to-[#0c0405]"
                />
              </div>
              <div className="relative aspect-[6/5] overflow-hidden bg-brand-stone">
                <EditorialImage
                  src="/products/legacy-merlot/merlot-6.jpg"
                  alt="Legacy — detalle del estampado en la espalda"
                  gradient="from-[#2a1013] via-[#1c0a0c] to-[#0c0405]"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* MANIFIESTO — muy breve, la historia completa vive en /marca */}
      <section className="relative flex h-[55vh] min-h-[420px] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#1c1b19] via-[#141312] to-[#0c0b0a]">
        <Reveal className="relative z-10 flex flex-col items-center px-6 text-center">
          <span className="label rounded-full border border-white/25 px-5 py-2 text-white/70">
            L&apos;eccellenza non si spiega, si vive
          </span>
          <p className="font-display mt-8 max-w-xl text-2xl leading-snug text-white sm:text-3xl">
            Prendas simples y elegantes, con espíritu italiano — tela de
            calidad, corte impecable, detalles con intención.
          </p>
          <Link
            href="/marca"
            className="label mt-8 inline-block border-b border-white/60 pb-1 text-white transition hover:border-white"
          >
            Conocer la marca →
          </Link>
        </Reveal>
      </section>

      {/* INSTAGRAM CTA */}
      <section className="mx-auto flex max-w-2xl flex-col items-center px-5 py-24 text-center sm:px-8 sm:py-28">
        <Reveal className="flex flex-col items-center">
          <p className="label text-ink/40">Síguenos</p>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl">
            @{INSTAGRAM_HANDLE}
          </h2>
          <p className="mt-4 max-w-sm text-sm text-ink/60">
            Nuevas prendas, colores de temporada y el detrás de escena de
            VALENCIANO.
          </p>
          <a
            href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="label mt-8 border border-ink px-8 py-4 transition hover:bg-ink hover:text-paper"
          >
            Ir a Instagram
          </a>
        </Reveal>
      </section>
    </div>
  );
}
