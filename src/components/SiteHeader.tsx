"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useDrawer } from "@/hooks/useDrawer";

const NAV_LINKS = [
  { href: "/catalogo", label: "Iconic" },
  { href: "/origin", label: "Origin" },
  { href: "/legacy", label: "Legacy" },
  { href: "/marca", label: "La marca" },
];

export default function SiteHeader() {
  const { totalItems, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useDrawer(menuOpen, () => setMenuOpen(false), navRef);

  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        ticking = false;
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div
        className={`mx-auto flex max-w-[1600px] items-center justify-between px-5 transition-[height] duration-200 motion-reduce:transition-none sm:px-8 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <button
          className="relative flex h-9 w-9 flex-col items-center justify-center gap-1.5 p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-drawer"
        >
          <span
            className={`block h-px w-5 bg-ink transition-transform duration-200 motion-reduce:transition-none ${
              menuOpen ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-5 bg-ink transition-transform duration-200 motion-reduce:transition-none ${
              menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>

        <Link
          href="/"
          className="font-logo text-xl tracking-[0.26em] whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
        >
          VALENCIANO
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-9">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group label relative whitespace-nowrap text-ink/70 transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline-none"
            >
              {link.label}
              <span
                aria-hidden="true"
                className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-200 group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button
            onClick={openCart}
            className="relative flex h-9 w-9 items-center justify-center text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
            aria-label={totalItems > 0 ? `Ver bolsa (${totalItems})` : "Ver bolsa"}
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

      {/* Mobile nav drawer */}
      <div
        className={`fixed inset-0 z-50 bg-ink/30 transition-opacity duration-300 motion-reduce:transition-none md:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <div
        id="mobile-nav-drawer"
        ref={navRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        className={`fixed left-0 top-0 z-50 flex h-full w-full max-w-xs flex-col bg-paper transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none md:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-5">
          <span className="font-logo text-lg tracking-[0.22em]">VALENCIANO</span>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar menú"
            className="flex h-9 w-9 items-center justify-center text-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
          >
            ×
          </button>
        </div>
        <nav className="flex flex-1 flex-col px-5 py-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="label border-b border-line-soft py-4 text-ink/80 transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline-none"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
