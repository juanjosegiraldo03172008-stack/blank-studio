import Link from "next/link";
import EditorialImage from "@/components/EditorialImage";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { PRODUCTS } from "@/data/products";
import { INSTAGRAM_HANDLE } from "@/lib/instagramOrder";

const UNIVERSES = [
  {
    href: "/catalogo",
    label: "Iconic",
    desc: "Essentials & Oversize · 200 / 300 GSM",
    cta: "Explorar Iconic",
    img: "/catalog/oversize-300-stack.jpg",
    objectPosition: "center 35%",
  },
  {
    href: "/origin",
    label: "Origin",
    desc: "Donde empieza la identidad",
    cta: "Descubrir Origin",
    img: "/products/origin-arena/arena-1.jpg",
    objectPosition: "center 30%",
  },
  {
    href: "/legacy",
    label: "Legacy",
    desc: "Diseñado para perdurar",
    cta: "Ver Legacy",
    img: "/products/legacy-merlot/merlot-3.jpg",
    objectPosition: "center 18%",
  },
];

export default function Home() {
  const iconicProducts = PRODUCTS.filter((p) => p.collection === "iconic");

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[92vh] min-h-[560px] w-full overflow-hidden bg-brand-black">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/video/hero-loop.mp4"
          poster="/video/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/55" />

        <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
          <h1
            className="font-logo select-none whitespace-nowrap text-white/45"
            style={{ fontSize: "clamp(2.75rem, 13vw, 11rem)", letterSpacing: "0.04em" }}
          >
            VALENCIANO
          </h1>
        </div>
      </section>

      {/* INTRO STATEMENT — breve, el manifiesto completo vive en /marca */}
      <section className="mx-auto max-w-xl px-5 py-16 text-center sm:px-8 sm:py-20">
        <Reveal>
          <p className="label text-ink/40">Filosofía</p>
          <p className="font-display mt-5 text-xl leading-relaxed text-ink/85 sm:text-2xl">
            Prendas simples y elegantes, con espíritu italiano — tela de
            calidad, corte impecable, detalles con intención.
          </p>
        </Reveal>
      </section>

      {/* UNIVERSOS — Iconic / Origin / Legacy */}
      <section className="grid grid-cols-1 gap-px bg-line sm:grid-cols-3">
        {UNIVERSES.map((u) => (
          <Link
            key={u.label}
            href={u.href}
            className="group relative flex h-[72vh] min-h-[440px] items-end overflow-hidden bg-brand-stone"
          >
            <EditorialImage
              src={u.img}
              alt={u.label}
              objectPosition={u.objectPosition}
              className="transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <div className="relative z-10 p-8 sm:p-10">
              <p className="font-display text-3xl text-white sm:text-4xl">
                {u.label}
              </p>
              <p className="label mt-2 text-white/75">{u.desc}</p>
              <span className="label mt-5 inline-block border-b border-white/60 pb-1 text-white transition group-hover:border-white">
                {u.cta} →
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* ICONIC ESSENTIALS */}
      <section className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 sm:py-28">
        <Reveal className="mb-12 flex items-end justify-between">
          <div>
            <p className="label text-ink/40">Iconic</p>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl">
              Las cuatro esenciales
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="label hidden border-b border-ink pb-1 sm:inline-block"
          >
            Ver todo
          </Link>
        </Reveal>
        <div className="grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {iconicProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        <Link
          href="/catalogo"
          className="label mt-12 block border-b border-ink pb-1 text-center sm:hidden"
        >
          Ver todo el catálogo
        </Link>
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

      {/* MATERIAL / QUALITY */}
      <section className="grid grid-cols-1 items-center gap-10 bg-black/[0.02] px-5 py-24 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative aspect-square w-full max-w-md overflow-hidden justify-self-center lg:justify-self-end">
          <EditorialImage
            src="/catalog/fabric-texture.jpg"
            alt="Detalle de textura del algodón peruano VALENCIANO"
            gradient="from-[#5b4433] via-[#4a3626] to-[#2c2018]"
          />
        </Reveal>
        <Reveal delay={100} className="max-w-lg">
          <p className="label text-ink/40">Materiales</p>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl">
            100% algodón peruano
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-ink/65">
            Trabajamos con algodón peruano de alta calidad en dos gramajes —
            200 y 300 GSM — para que elijas entre una prenda ligera para el
            día a día o una de mayor estructura y presencia. Colores sólidos
            que perduran, tela que no se encoge ni se deforma.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4">
            {[
              "100% algodón peruano",
              "Gramajes 200 / 300 GSM",
              "Hecho para durar",
              "Diseño minimalista",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-ink/70">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-ink/40" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

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
                src="/products/origin-arena/arena-1.jpg"
                alt="Origin Arena — Legacy Of Luxury"
                objectPosition="center 20%"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* BRAND STATEMENT */}
      <section className="relative flex h-[55vh] min-h-[400px] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#1c1b19] via-[#141312] to-[#0c0b0a]">
        <Reveal className="relative z-10 flex flex-col items-center px-6 text-center">
          <span className="label rounded-full border border-white/25 px-5 py-2 text-white/70">
            L&apos;eccellenza non si spiega, si vive
          </span>
          <p className="font-display mt-8 max-w-xl text-2xl leading-snug text-white sm:text-3xl">
            No competimos por precio. Competimos por elegancia, calidad y
            confianza.
          </p>
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
