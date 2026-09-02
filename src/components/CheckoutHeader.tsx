"use client";

import Link from "next/link";

/**
 * Variante contextual del header, solo para /pedido — sin SHOP/COLLECTIONS/
 * THE BRAND compitiendo durante la finalización. No es SiteHeader.tsx: es un
 * componente aparte, así el header global queda intacto en el resto del sitio.
 */
export default function CheckoutHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="font-logo text-xl tracking-[0.26em] whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
        >
          VALENCIANO
        </Link>
        <Link
          href="/catalogo"
          className="label whitespace-nowrap text-ink/60 transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline-none"
        >
          {/* "VALENCIANO" + el label completo no caben con margen en 375px — se acorta antes de sm. */}
          <span className="sm:hidden">Tienda</span>
          <span className="hidden sm:inline">Seguir comprando</span>
        </Link>
      </div>
    </header>
  );
}
