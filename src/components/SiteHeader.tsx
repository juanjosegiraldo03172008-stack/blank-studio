"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { INSTAGRAM_HANDLE } from "@/lib/instagramOrder";

const NAV_LINKS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/catalogo?fit=essential", label: "Essentials" },
  { href: "/catalogo?fit=oversize", label: "Oversize" },
  { href: "/studio-series", label: "Studio Series" },
  { href: "/icon-series", label: "Icon Series" },
  { href: "/guia-de-tallas", label: "Guía de tallas" },
  { href: "/marca", label: "La marca" },
];

export default function SiteHeader() {
  const { totalItems, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 sm:px-8">
        <button
          className="flex flex-col gap-1.5 p-1 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Abrir menú"
        >
          <span className="block h-px w-5 bg-ink" />
          <span className="block h-px w-5 bg-ink" />
        </button>

        <Link
          href="/"
          className="font-logo flex items-center gap-2.5 text-2xl tracking-[0.24em] whitespace-nowrap"
        >
          VALENCIANO
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="label whitespace-nowrap text-ink/70 transition hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="label hidden whitespace-nowrap text-ink/70 transition hover:text-ink 2xl:inline"
          >
            @{INSTAGRAM_HANDLE}
          </a>
          <button
            onClick={openCart}
            className="label relative flex items-center gap-2 text-ink"
            aria-label="Ver pedido"
          >
            Pedido
            {totalItems > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-paper">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col border-t border-line px-5 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="label border-b border-line-soft py-3 text-ink/80"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
