"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/catalogo", label: "Iconic" },
  { href: "/origin", label: "Origin" },
  { href: "/legacy", label: "Legacy" },
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
          className="font-logo flex items-center gap-2.5 text-xl tracking-[0.26em] whitespace-nowrap"
        >
          VALENCIANO
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-9">
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

        <div className="flex items-center gap-5">
          <button
            onClick={openCart}
            className="relative flex h-9 w-9 items-center justify-center text-ink"
            aria-label="Ver bolsa"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              aria-hidden="true"
            >
              <path d="M7 8V6.5a5 5 0 0 1 10 0V8" strokeLinecap="round" />
              <path d="M4.5 8h15l-1 13h-13l-1-13Z" strokeLinejoin="round" />
            </svg>
            {totalItems > 0 && (
              <span className="font-ui absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-ink px-[3px] text-[9px] font-medium leading-none text-paper">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="animate-fade-in flex flex-col border-t border-line px-5 py-4 md:hidden">
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
