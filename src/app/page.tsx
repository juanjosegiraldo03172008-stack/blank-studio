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
    tagline: "Lo esencial, elevado.",
    href: "/catalogo",
    image: "/products/oversize-300/negro-back.jpg",
  },
  {
    name: "Legacy",
    tagline: "Un estilo que trasciende.",
    href: "/legacy",
    image: "/products/legacy-merlot/merlot-4.jpg",
  },
  {
    name: "Origin",
    tagline: "Inspirado en lo esencial.",
    href: "/origin",
    image: "/products/origin-arena/arena-2.jpg",
  },
];

const TRUST_POINTS = [
  {
    label: "100% algodón peruano",
    sub: "Calidad que se siente.",
    icon: (
      <path d="M12 3c-4 2-7 5-7 9a7 7 0 0 0 14 0c0-4-3-7-7-9Z M12 12v9" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    label: "Fit oversize premium",
    sub: "Comodidad en cada detalle.",
    icon: (
      <path d="M8 4 4 7l2 3 2-1v11h8V9l2 1 2-3-4-3-1 2h-6L8 4Z" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    label: "Pago contraentrega",
    sub: "Compra con confianza.",
    icon: (
      <path d="M2 8h13v8H2zM15 11h4l3 3v2h-7zM6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    label: "Atención por Instagram",
    sub: "Te asesoramos personalmente.",
    icon: (
      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM17.2 6.8h.01" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
];

export default function Home() {
  const iconicProducts = PRODUCTS.filter((p) => p.collection === "iconic");

  return (
    <div>
      {/* HERO — foto editorial a pantalla completa (ancho), texto superpuesto
          con velo de gradiente, sin panel sólido separado. */}
      <section className="relative h-[82vh] min-h-[560px] w-full overflow-hidden bg-brand-black">
        <EditorialImage
          src="/products/essentials-200/beige-model-1.jpg"
          alt="VALENCIANO — Essentials 200 en beige"
          className="object-[center_18%] [filter:grayscale(0.25)_contrast(1.06)_brightness(0.95)]"
          priority
        />
        {/* Tratamiento cálido tipo duotono sobre una foto de estudio real —
            no hay herramienta de generación de imágenes disponible para
            producir una toma ambientada nueva. No altera la prenda. */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#100d09]/85 via-[#100d09]/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#100d09]/50 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[#caa269]/[0.14] mix-blend-color" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-center px-5 sm:px-8">
          <Reveal>
            <p className="label leading-relaxed text-white/60">
              Ropa para
              <br />
              un mejor mañana
            </p>
            <h1
              className="font-display mt-5 leading-[0.95] text-white"
              style={{ fontSize: "clamp(2.75rem, 7vw, 5.5rem)" }}
            >
              VALENCIANO
            </h1>
            <p className="font-display mt-4 max-w-sm text-lg italic text-white/80 sm:text-xl">
              Esenciales premium que permanecen.
            </p>
            <Link
              href="/catalogo"
              className="label mt-8 inline-flex w-fit items-center bg-white px-8 py-4 text-ink transition hover:bg-white/90"
            >
              Ver colección →
            </Link>
          </Reveal>
        </div>

        <p className="label absolute right-5 top-24 z-10 hidden text-right leading-relaxed text-white/55 sm:right-8 sm:top-28 md:block">
          Más que ropa,
          <br />
          una actitud.
        </p>
      </section>

      {/* DESTACADOS — producto primero, visible desde el primer scroll */}
      <section id="shop" className="mx-auto max-w-[1600px] scroll-mt-20 px-5 py-16 sm:px-8 sm:py-20">
        <Reveal className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-3xl sm:text-4xl">Destacados</h2>
          <Link
            href="/catalogo"
            className="label whitespace-nowrap text-ink/50 transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline-none"
          >
            Ver todos →
          </Link>
        </Reveal>
        <div className="mb-8 flex flex-wrap gap-x-5 gap-y-2 sm:mb-10">
          {SHOP_FILTERS.map((f) => (
            <Link
              key={f.label}
              href={f.href}
              className="label whitespace-nowrap text-ink/50 transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline-none"
            >
              {f.label}
            </Link>
          ))}
        </div>
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
      </section>

      {/* COLECCIONES */}
      <section className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 sm:py-20">
        <Reveal className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-3xl sm:text-4xl">Nuestras colecciones</h2>
          <Link
            href="/catalogo"
            className="label whitespace-nowrap text-ink/50 transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline-none"
          >
            Explorar colecciones →
          </Link>
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
                  className="transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                <div className="relative z-10 flex flex-col items-start gap-1.5 p-7">
                  <p className="font-display text-2xl text-white sm:text-3xl">
                    {c.name}
                  </p>
                  <p className="text-sm text-white/80">{c.tagline}</p>
                  <span className="label mt-3 inline-block border-b border-white/60 pb-1 text-white transition group-hover:border-white">
                    Ver colección →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TRUST BAR — franja breve con lo que realmente diferencia la compra */}
      <section className="bg-black/[0.03] px-5 py-14 sm:px-8">
        <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {TRUST_POINTS.map((t) => (
            <Reveal key={t.label} className="flex flex-col items-center text-center">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden="true"
                className="text-ink/70"
              >
                {t.icon}
              </svg>
              <p className="label mt-4 text-ink/80">{t.label}</p>
              <p className="mt-1.5 text-xs text-ink/50">{t.sub}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* MANIFIESTO / MARCA — breve, visual, cierre editorial */}
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-6">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-stone sm:aspect-[3/2]">
              <EditorialImage
                src="/products/essentials-200/blanco-detail.jpg"
                alt="Detalle de tela — 100% algodón peruano"
              />
            </div>
          </Reveal>
          <Reveal delay={100} className="flex flex-col gap-8 lg:col-span-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-md">
              <p className="label text-ink/40">VALENCIANO</p>
              <h2 className="font-display mt-3 text-3xl leading-snug sm:text-4xl">
                Hecho para el hoy y el siempre.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink/60">
                Prendas atemporales. Detalles que importan. Un estilo que te
                acompaña, siempre.
              </p>
              <Link
                href="/marca"
                className="label mt-8 inline-block bg-ink px-8 py-4 text-paper transition hover:bg-ink/85"
              >
                Conocer la historia →
              </Link>
            </div>
            <ul className="label flex shrink-0 flex-row gap-6 text-ink/40 lg:flex-col lg:gap-4 lg:pt-2 lg:text-right">
              <li>Disciplina</li>
              <li>Estilo</li>
              <li>Libertad</li>
            </ul>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
