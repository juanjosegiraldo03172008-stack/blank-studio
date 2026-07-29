import Link from "next/link";
import EditorialImage from "@/components/EditorialImage";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS } from "@/data/products";
import { INSTAGRAM_HANDLE } from "@/lib/instagramOrder";

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative h-[92vh] min-h-[560px] w-full overflow-hidden bg-brand-black">
        <EditorialImage
          src="/catalog/hero-elegant.jpg"
          alt="Textura de tela negra VALENCIANO"
          priority
          gradient="from-[#1c1b19] via-[#141312] to-[#0c0b0a]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/40" />
        <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-16 sm:px-8 sm:pb-24">
          <p className="label mb-4 text-white/70 animate-fade-in">
            100% algodón peruano
          </p>
          <h1 className="font-display max-w-3xl text-5xl leading-[1.05] text-white sm:text-7xl">
            L&apos;eleganza essenziale.
            <br />
            <span className="italic text-white/85">Hecha para durar.</span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/70">
            Essentials y Oversize en algodón 100% peruano. Espíritu italiano,
            horma limpia, materiales premium — elegancia sin esfuerzo, todos
            los días.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/catalogo"
              className="label bg-white px-8 py-4 text-brand-black transition hover:bg-white/85"
            >
              Ver catálogo
            </Link>
            <Link
              href="/marca"
              className="label border border-white/40 px-8 py-4 text-white transition hover:border-white"
            >
              Conoce la marca
            </Link>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="mx-auto max-w-2xl px-5 py-28 text-center sm:px-8">
        <p className="label text-ink/40">Filosofía</p>
        <p className="font-display mt-6 text-2xl leading-relaxed text-ink/85 sm:text-3xl">
          Diseñamos prendas simples, versátiles y elegantes, con un espíritu
          italiano. Sin saturación visual — solo tela de calidad, un corte
          impecable y detalles con intención.
        </p>
      </section>

      {/* CATEGORY SPLIT */}
      <section className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2">
        {[
          {
            href: "/catalogo?fit=essential",
            label: "Essentials",
            desc: "Horma normal · 200 / 300 GSM",
            img: "/catalog/essentials-300-beige.jpg",
          },
          {
            href: "/catalogo?fit=oversize",
            label: "Oversize",
            desc: "Silueta amplia · 200 / 300 GSM",
            img: "/catalog/oversize-300-stack.jpg",
          },
        ].map((cat) => (
          <Link
            key={cat.label}
            href={cat.href}
            className="group relative flex h-[70vh] min-h-[420px] items-end overflow-hidden bg-brand-stone"
          >
            <EditorialImage
              src={cat.img}
              alt={cat.label}
              gradient="from-[#d9d2c2] via-[#c9c2b0] to-[#b6ae9c]"
              className="transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="relative z-10 p-8 sm:p-10">
              <p className="font-display text-3xl text-white sm:text-4xl">
                {cat.label}
              </p>
              <p className="label mt-2 text-white/75">{cat.desc}</p>
              <span className="label mt-5 inline-block border-b border-white/60 pb-1 text-white">
                Explorar →
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-[1600px] px-5 py-28 sm:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="label text-ink/40">Catálogo</p>
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
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((product) => (
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

      {/* MATERIAL / QUALITY */}
      <section className="grid grid-cols-1 items-center gap-10 bg-black/[0.02] px-5 py-28 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-square w-full max-w-md overflow-hidden justify-self-center lg:justify-self-end">
          <EditorialImage
            src="/catalog/fabric-texture.jpg"
            alt="Detalle de textura del algodón peruano VALENCIANO"
            gradient="from-[#5b4433] via-[#4a3626] to-[#2c2018]"
          />
        </div>
        <div className="max-w-lg">
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
        </div>
      </section>

      {/* BRAND BAND */}
      <section className="relative flex h-[60vh] min-h-[420px] w-full items-center justify-center overflow-hidden bg-brand-black">
        <EditorialImage
          src="/catalog/fabric-bg.jpg"
          alt="Tela negra VALENCIANO"
          gradient="from-[#1c1b19] via-[#141312] to-[#0c0b0a]"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <span className="label rounded-full border border-white/25 px-5 py-2 text-white/70">
            L&apos;eccellenza non si spiega, si vive
          </span>
          <p className="font-display mt-8 max-w-xl text-2xl leading-snug text-white sm:text-3xl">
            No competimos por precio. Competimos por elegancia, calidad y
            confianza.
          </p>
        </div>
      </section>

      {/* INSTAGRAM CTA */}
      <section className="mx-auto flex max-w-2xl flex-col items-center px-5 py-28 text-center sm:px-8">
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
      </section>
    </div>
  );
}
