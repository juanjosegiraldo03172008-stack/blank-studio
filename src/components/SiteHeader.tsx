"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useDrawer } from "@/hooks/useDrawer";

/**
 * Arquitectura de navegación: SHOP filtra por fit (horma/silueta),
 * COLLECTIONS filtra por universo/colección. Son dimensiones distintas del
 * producto y por eso viven en menús separados, no mezcladas en una sola fila.
 */
const SHOP_LINKS = [
  { href: "/catalogo", label: "All" },
  { href: "/catalogo?fit=oversize", label: "Oversize" },
  { href: "/catalogo?fit=essential", label: "Essentials" },
];

const COLLECTIONS_LINKS = [
  { href: "/catalogo", label: "Iconic" },
  { href: "/legacy", label: "Legacy" },
  { href: "/origin", label: "Origin" },
];

type MenuKey = "shop" | "collections";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={`transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DesktopDropdown({
  label,
  links,
  menuKey,
  openMenu,
  setOpenMenu,
}: {
  label: string;
  links: { href: string; label: string }[];
  menuKey: MenuKey;
  openMenu: MenuKey | null;
  setOpenMenu: (m: MenuKey | null) => void;
}) {
  const open = openMenu === menuKey;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpenMenu(menuKey)}
      onMouseLeave={() => setOpenMenu(null)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node))
          setOpenMenu(null);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpenMenu(null);
          e.currentTarget.querySelector("button")?.focus();
        }
      }}
    >
      <button
        type="button"
        className="label flex items-center gap-1.5 text-ink/70 transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline-none"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpenMenu(open ? null : menuKey)}
      >
        {label}
        <ChevronIcon open={open} />
      </button>
      <div
        className={`absolute left-1/2 top-full z-10 -translate-x-1/2 pt-4 transition-all duration-150 ease-out motion-reduce:transition-none ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        <div className="flex min-w-[160px] flex-col border border-line bg-paper py-2 shadow-sm">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpenMenu(null)}
              className="label px-5 py-3 text-center text-ink/70 transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline-none"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SiteHeader() {
  const { totalItems, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
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
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <div
          className={`relative z-[55] mx-auto flex max-w-[1600px] items-center justify-between px-5 transition-[height] duration-200 motion-reduce:transition-none sm:px-8 ${
            scrolled ? "h-14" : "h-16"
          }`}
        >
          <button
            className="relative flex h-9 w-9 items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
          >
            {/* Hamburger — closed state */}
            <span
              aria-hidden="true"
              className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ease-out motion-reduce:transition-none ${
                menuOpen ? "scale-90 opacity-0" : "scale-100 opacity-100"
              }`}
            >
              <span className="block h-px w-5 bg-ink" />
              <span className="block h-px w-5 bg-ink" />
            </span>

            {/* VALENCIANO monogram — open state */}
            <span
              aria-hidden="true"
              className={`absolute inset-0 m-auto h-[18px] w-[18px] bg-ink transition-all duration-200 ease-out motion-reduce:transition-none ${
                menuOpen ? "scale-100 opacity-100" : "scale-90 opacity-0"
              }`}
              style={{
                WebkitMaskImage: "url(/valenciano-monogram.png)",
                maskImage: "url(/valenciano-monogram.png)",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            />
          </button>

          <Link
            href="/"
            className="font-logo text-xl tracking-[0.26em] whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
          >
            VALENCIANO
          </Link>

          <nav className="hidden md:flex md:items-center md:gap-9">
            <DesktopDropdown
              label="Shop"
              links={SHOP_LINKS}
              menuKey="shop"
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
            />
            <DesktopDropdown
              label="Collections"
              links={COLLECTIONS_LINKS}
              menuKey="collections"
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
            />
            <Link
              href="/marca"
              className="group label relative whitespace-nowrap text-ink/70 transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline-none"
            >
              The Brand
              <span
                aria-hidden="true"
                className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-200 group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
              />
            </Link>
          </nav>

          <div className="flex items-center gap-5">
            <button
              onClick={openCart}
              className="relative flex h-9 w-9 items-center justify-center text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
              aria-label={
                totalItems > 0 ? `Ver bolsa (${totalItems})` : "Ver bolsa"
              }
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
      </header>

      {/* Mobile nav drawer — rendered as a sibling of <header>, not a descendant:
          backdrop-blur on <header> establishes a containing block for
          position:fixed descendants, which would otherwise shrink this
          drawer's h-full/inset-0 down to the header's own box. Sits below
          header's z-40 (unlike the cart drawer's z-50) so the hamburger,
          logo and cart button stay visible/tappable while it's open. */}
      <div
        className={`fixed inset-0 z-30 bg-ink/30 transition-opacity duration-300 motion-reduce:transition-none md:hidden ${
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
        className={`fixed left-0 top-0 z-30 flex h-full w-full max-w-xs flex-col bg-paper transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none md:hidden ${
          scrolled ? "pt-14" : "pt-16"
        } ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
          <p className="label mt-2 text-ink/35">Shop</p>
          {SHOP_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="label border-b border-line-soft py-4 text-ink/80 transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline-none"
            >
              {link.label}
            </Link>
          ))}

          <p className="label mt-6 text-ink/35">Collections</p>
          {COLLECTIONS_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="label border-b border-line-soft py-4 text-ink/80 transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline-none"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/marca"
            onClick={() => setMenuOpen(false)}
            className="label mt-6 border-b border-line-soft py-4 text-ink/80 transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline-none"
          >
            The Brand
          </Link>
        </nav>
      </div>
    </>
  );
}
