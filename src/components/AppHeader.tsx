"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import CheckoutHeader from "@/components/CheckoutHeader";

/** Elige el header global o la variante de checkout según la ruta — no modifica SiteHeader.tsx. */
export default function AppHeader() {
  const pathname = usePathname();
  // /pedido (revisión + datos de entrega) y /pedido/[id] (pago por
  // transferencia) son ambos parte del checkout — mismo header simplificado.
  const isCheckout = pathname === "/pedido" || pathname?.startsWith("/pedido/");
  return isCheckout ? <CheckoutHeader /> : <SiteHeader />;
}
