import Link from "next/link";
import { INSTAGRAM_HANDLE } from "@/lib/instagramOrder";
import BrandMark from "./BrandMark";

const COLUMNS = [
  {
    title: "Comprar",
    links: [
      { href: "/catalogo", label: "Catálogo completo" },
      { href: "/catalogo?fit=essential", label: "Essentials" },
      { href: "/catalogo?fit=oversize", label: "Oversize" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { href: "/guia-de-tallas", label: "Guía de tallas" },
      { href: "/pedido", label: "Cómo hacer un pedido" },
      { href: "/marca", label: "Sobre BLANK STUDIO" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-line">
      <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-2">
            <p className="flex items-center gap-2.5 font-display text-xl tracking-[0.24em]">
              <BrandMark size={26} />
              BLANK STUDIO
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/60">
              Ropa esencial en 100% algodón peruano. Essentials y Oversize,
              horma limpia, materiales premium, sin ruido visual.
            </p>
            <a
              href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="label mt-6 inline-block text-ink/70 underline underline-offset-4 transition hover:text-ink"
            >
              @{INSTAGRAM_HANDLE}
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="label text-ink/40">{col.title}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink/70 transition hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-4 border-t border-line-soft pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-ink/40">
            © {new Date().getFullYear()} BLANK STUDIO. Todos los derechos
            reservados.
          </p>
          <p className="label text-ink/40">Diseñado en Colombia</p>
        </div>
      </div>
    </footer>
  );
}
